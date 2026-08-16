import type { PlanId, SubscriptionStatus } from "./plans";

/**
 * The payment-provider boundary.
 *
 * **No code outside `packages/billing` imports a processor SDK.** Everything
 * upstream — the dashboard, the webhook route — depends only on the types in
 * this file. Swapping Authorize.Net for PayPal is then a change to one
 * environment variable, not a change to any calling code, and the adapters can
 * be tested without touching the app.
 */

export type ProviderId = "authorizenet" | "paypal";

export type SubscriptionRef = {
  /** The provider's own identifier. Opaque to us. */
  id: string;
  planId: PlanId;
  status: SubscriptionStatus;
  /** ISO date of the next charge, when the provider reports one. */
  nextChargeOn: string | null;
};

/**
 * A webhook, normalised.
 *
 * Adapters translate their provider's vocabulary into these four kinds, so the
 * handler never branches on provider-specific event names.
 */
export type BillingEventKind =
  "payment_succeeded" | "payment_failed" | "subscription_canceled" | "subscription_expired";

/**
 * A JSON value.
 *
 * Declared here rather than imported from `@masseurmatch/db` so this package
 * keeps its one-way dependency: billing knows nothing about the database.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type BillingEvent = {
  /** Provider's event id — the idempotency key. Must be stable across retries. */
  eventId: string;
  kind: BillingEventKind;
  subscriptionId: string;
  occurredAt: string;
  /**
   * Raw payload, retained for the audit trail.
   *
   * `Json`, not `unknown`: this lands in a `jsonb` column, and every adapter
   * produces it by `JSON.parse`-ing the request body, so it is JSON by
   * construction. Typing it `unknown` only moved the cast to the insert.
   */
  raw: Json;
};

export type WebhookResult =
  | { ok: true; event: BillingEvent }
  | { ok: false; reason: "invalid_signature" | "unrecognized_event" | "malformed" };

export interface PaymentProvider {
  readonly id: ProviderId;

  createSubscription(therapistId: string, plan: PlanId): Promise<SubscriptionRef>;
  cancelSubscription(subscriptionId: string): Promise<void>;
  updatePlan(subscriptionId: string, newPlan: PlanId): Promise<SubscriptionRef>;

  /**
   * Verify and normalise an incoming webhook.
   *
   * Returns a discriminated result rather than throwing, because "the signature
   * did not verify" is an ordinary outcome that must produce a 401 — not a 500,
   * which would tell a prober that something unusual happened, and would show up
   * as an error rather than an attack in monitoring.
   *
   * Takes the **raw body string**, never a parsed object: every provider signs
   * the exact bytes, so re-serialising parsed JSON changes key order or
   * whitespace and breaks verification.
   */
  handleWebhook(payload: string, signature: string): Promise<WebhookResult>;
}

/**
 * Which provider is active.
 *
 * Defaults to Authorize.Net, the primary. An unrecognised value throws rather
 * than falling back: silently taking payments through a different processor
 * than the one configured is worse than refusing to start.
 */
export function activeProviderId(raw = process.env.BILLING_PROVIDER): ProviderId {
  const value = (raw ?? "authorizenet").toLowerCase();
  if (value === "authorizenet" || value === "paypal") return value;
  throw new Error(`Unknown BILLING_PROVIDER "${raw}". Expected "authorizenet" or "paypal".`);
}
