import "server-only";

import { PLANS, planFor, type PlanId, type SubscriptionStatus } from "@masseurmatch/billing";
import { createSessionClient } from "@masseurmatch/db/auth";
import { createServiceClient } from "@masseurmatch/db/client";

/**
 * The therapist's own subscription.
 *
 * Reads use the session client, so RLS applies: the live policy
 * `therapist_subscriptions_select_own_or_admin` limits a therapist to their own
 * row. Writes cannot — the same table denies INSERT, UPDATE and DELETE to every
 * role with `with check (false)`, and only `service_role` (which bypasses RLS)
 * can write. That is the correct shape and is not worked around here: a user
 * must never be able to set their own subscription status, or the paywall is
 * decoration. The narrow service-role writes below record what the *provider*
 * told us, never what the browser asked for.
 */

/* -------------------------------------------------------------------------- */
/* subscription_plans — the FK target                                         */
/* -------------------------------------------------------------------------- */

/**
 * `therapist_subscriptions.plan_id` is `uuid NOT NULL` referencing
 * `subscription_plans(id)`, so a row cannot be created without one. The uuids
 * are assigned by the database and are not derivable, hence the lookup by
 * `code`.
 *
 * **`subscription_plans` is a foreign key target, not a price list.** It
 * predates this repository and its numbers disagree with `plans.ts`:
 *
 *   code      subscription_plans   plans.ts
 *   free      $0     1 photo       $0     3 photos
 *   standard  $39    5 photos      $39    10 photos
 *   pro       $79    12 photos     $79    20 photos
 *   elite     $99    20 photos     $149   40 photos
 *
 * `plans.ts` is the source of truth the phase 7 brief named, and it is what the
 * dashboard displays. Neither list is what actually gets charged — PayPal
 * charges whatever its own plan says, which is why `PAYPAL_PLAN_*` exists. The
 * elite row differs by $50/month and the photo limits differ everywhere, so
 * this needs reconciling before anyone subscribes; it is deliberately NOT
 * reconciled here, because production data is not this code's to rewrite.
 */
async function planUuid(plan: PlanId): Promise<string> {
  const { data, error } = await createServiceClient()
    .from("subscription_plans")
    .select("id")
    .eq("code", plan)
    .maybeSingle();

  if (error) throw new Error(`Could not resolve the plan "${plan}": ${error.message}`);
  if (!data) throw new Error(`No subscription_plans row has code "${plan}".`);
  return (data as { id: string }).id;
}

/* -------------------------------------------------------------------------- */
/* Reads                                                                      */
/* -------------------------------------------------------------------------- */

export type SubscriptionRow = {
  id: string;
  status: SubscriptionStatus;
  provider: string | null;
  providerSubscriptionId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

/** The therapist's current subscription row, or null if they have never had one. */
export async function getMySubscription(profileId: string): Promise<SubscriptionRow | null> {
  const { data, error } = await createSessionClient()
    .from("therapist_subscriptions")
    .select("id,status,provider,provider_subscription_id,current_period_end,cancel_at_period_end")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Could not load your subscription: ${error.message}`);
  if (!data) return null;

  const row = data as unknown as {
    id: string;
    status: string | null;
    provider: string | null;
    provider_subscription_id: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean | null;
  };

  return {
    id: row.id,
    status: (row.status as SubscriptionStatus) ?? "none",
    provider: row.provider,
    providerSubscriptionId: row.provider_subscription_id,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: row.cancel_at_period_end ?? false,
  };
}

/* -------------------------------------------------------------------------- */
/* Writes — service role, and only ever recording the provider's answer       */
/* -------------------------------------------------------------------------- */

/**
 * Record a subscription the provider has just created.
 *
 * Written **before** the therapist is sent to PayPal to approve it. That
 * ordering is the point: the webhook arrives keyed on
 * `provider_subscription_id`, and if the row does not exist by then the event
 * is recorded as "No matching subscription" and the payment is invisible. A row
 * for an approval nobody completes is harmless — it stays at `none`.
 *
 * `status` comes from the provider, which for a fresh PayPal subscription is
 * `none` (APPROVAL_PENDING). Nothing here may set `active`; only the webhook
 * may, because only the webhook has evidence that money moved.
 *
 * `therapist_profile_id` is left null on purpose. It is nullable, carries no
 * foreign key, and its meaning is not recoverable from the schema — writing a
 * guess into it would be worse than leaving it unset. `profile_id` is the
 * column with the FK and the column the webhook reads.
 */
export async function recordNewSubscription(input: {
  profileId: string;
  plan: PlanId;
  provider: string;
  providerSubscriptionId: string;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
}): Promise<void> {
  const { error } = await createServiceClient()
    .from("therapist_subscriptions")
    .insert({
      profile_id: input.profileId,
      plan_id: await planUuid(input.plan),
      provider: input.provider,
      provider_subscription_id: input.providerSubscriptionId,
      status: input.status,
      current_period_end: input.currentPeriodEnd,
      cancel_at_period_end: false,
    });

  if (error) throw new Error(`Could not record the subscription: ${error.message}`);
}

/** Record a tier change the provider has already accepted. */
export async function recordPlanChange(subscriptionRowId: string, plan: PlanId): Promise<void> {
  const { error } = await createServiceClient()
    .from("therapist_subscriptions")
    .update({ plan_id: await planUuid(plan), updated_at: new Date().toISOString() })
    .eq("id", subscriptionRowId);

  if (error) throw new Error(`Could not record the plan change: ${error.message}`);
}

/**
 * Mark a subscription as cancelling at period end.
 *
 * Not `canceled` — the therapist has paid for the current period and keeps the
 * listing until it ends. The provider's
 * `BILLING.SUBSCRIPTION.CANCELLED` webhook is what finally sets `canceled`,
 * through the same `applyBillingEvent` path every other status change uses.
 */
export async function recordCancellationRequest(subscriptionRowId: string): Promise<void> {
  const { error } = await createServiceClient()
    .from("therapist_subscriptions")
    .update({ cancel_at_period_end: true, updated_at: new Date().toISOString() })
    .eq("id", subscriptionRowId);

  if (error) throw new Error(`Could not record the cancellation: ${error.message}`);
}

/* -------------------------------------------------------------------------- */

export type SubscriptionView = {
  planId: PlanId;
  planName: string;
  priceCents: number;
  photoLimit: number;
  status: SubscriptionStatus;
  statusLabel: string;
  isActive: boolean;
  nextChargeOn: string | null;
  cancelAtPeriodEnd: boolean;
  hasProviderSubscription: boolean;
};

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  none: "No active subscription",
  active: "Active",
  trialing: "Trial",
  past_due: "Payment overdue",
  canceled: "Cancelled",
  expired: "Expired",
};

/**
 * What the page renders.
 *
 * Tier comes from `profiles.subscription_tier` and the money and limits from
 * `plans.ts`. Status and dates come from `therapist_subscriptions`, which the
 * webhook owns — so the page shows the provider's view of the account rather
 * than the profile's cached copy of it.
 */
export function buildView(
  tier: string | null,
  subscription: SubscriptionRow | null,
): SubscriptionView {
  const plan = planFor(tier);
  const status = subscription?.status ?? "none";

  return {
    planId: plan.id,
    planName: plan.name,
    priceCents: plan.priceCents,
    photoLimit: PLANS[plan.id].photoLimit,
    status,
    statusLabel: STATUS_LABELS[status],
    isActive: status === "active" || status === "trialing" || status === "past_due",
    nextChargeOn: subscription?.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
    hasProviderSubscription: Boolean(subscription?.providerSubscriptionId),
  };
}
