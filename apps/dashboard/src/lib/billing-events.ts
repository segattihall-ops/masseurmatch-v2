import "server-only";

import type { BillingEvent, ProviderId } from "@masseurmatch/billing";
import { createServiceClient } from "@masseurmatch/db/client";

/**
 * The idempotency ledger.
 *
 * Everything here runs as `service_role`: the caller is a payment processor
 * with no user session, so RLS cannot be the boundary. The webhook signature
 * is. `billing_events` is readable by admins and writable by nobody else —
 * see `supabase/migrations/20260816040000_billing_events.sql`.
 */

/** True when this exact event has already been recorded. */
export async function alreadyProcessed(provider: ProviderId, eventId: string): Promise<boolean> {
  const { data } = await createServiceClient()
    .from("billing_events")
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
  const { error } = await createServiceClient().from("billing_events").insert({
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
  await createServiceClient()
    .from("billing_events")
    .update({ error, processed_at: new Date().toISOString() })
    .eq("provider", provider)
    .eq("event_id", eventId);
}
