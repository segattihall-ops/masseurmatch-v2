import "server-only";

import type { BillingEvent, ProviderId } from "@masseurmatch/billing";
import { createServiceClient } from "@masseurmatch/db/client";

/**
 * The idempotency ledger.
 *
 * **This file is the one place that reaches `billing_events` untyped, and it is
 * temporary.** The table is defined in
 * `supabase/migrations/20260816040000_billing_events.sql`, which has not been
 * applied, so it is absent from the generated `Database` type and the typed
 * client rejects every reference to it.
 *
 * Rather than sprinkle `as never` through the webhook route, the casts are
 * confined here behind a small typed API. When the migration is applied and
 * `pnpm db:types` is re-run, delete `untyped()` and the four call sites become
 * ordinary typed queries — nothing outside this file changes.
 *
 * Everything runs as `service_role`: the caller is a payment processor with no
 * user session, so RLS cannot be the boundary. The webhook signature is.
 */

const TABLE = "billing_events";

/**
 * The service client with the table typing dropped.
 *
 * Narrow on purpose — `from()` only, so the escape hatch cannot spread.
 */
function untyped() {
  return createServiceClient() as unknown as {
    from: (table: string) => {
      select: (columns: string) => {
        eq: (
          column: string,
          value: string,
        ) => {
          eq: (
            column: string,
            value: string,
          ) => { maybeSingle: () => Promise<{ data: { id: string } | null }> };
        };
      };
      insert: (values: Record<string, unknown>) => Promise<{ error: { code?: string } | null }>;
      update: (values: Record<string, unknown>) => {
        eq: (
          column: string,
          value: string,
        ) => { eq: (column: string, value: string) => Promise<{ error: unknown }> };
      };
    };
  };
}

/** True when this exact event has already been recorded. */
export async function alreadyProcessed(provider: ProviderId, eventId: string): Promise<boolean> {
  const { data } = await untyped()
    .from(TABLE)
    .select("id")
    .eq("provider", provider)
    .eq("event_id", eventId)
    .maybeSingle();
  return Boolean(data);
}

export type ClaimResult = "claimed" | "duplicate" | "failed";

/**
 * Record the event before acting on it.
 *
 * The `alreadyProcessed` check above is a fast path; *this* is what actually
 * guarantees exactly-once under concurrent deliveries, because the unique
 * constraint on `(provider, event_id)` rejects the second writer. A duplicate
 * is success, not failure — the other delivery is handling it.
 */
export async function claimEvent(provider: ProviderId, event: BillingEvent): Promise<ClaimResult> {
  const { error } = await untyped().from(TABLE).insert({
    provider,
    event_id: event.eventId,
    kind: event.kind,
    subscription_id: event.subscriptionId,
    payload: event.raw,
    occurred_at: event.occurredAt,
  });

  if (!error) return "claimed";
  return error.code === "23505" ? "duplicate" : "failed";
}

/** Annotate a recorded event once handling finishes, successfully or not. */
export async function annotateEvent(
  provider: ProviderId,
  eventId: string,
  error: string | null,
): Promise<void> {
  await untyped()
    .from(TABLE)
    .update({ error, processed_at: new Date().toISOString() })
    .eq("provider", provider)
    .eq("event_id", eventId);
}
