"use server";

import { activeProviderId, getProvider, isPlanId, PLANS } from "@masseurmatch/billing";
import { getViewer } from "@masseurmatch/db/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getOrCreateMyProfile } from "@/lib/profile";
import { LIMITS, rateLimit } from "@/lib/rate-limit";

import type { BillingState } from "./billing-state";
import {
  getMySubscription,
  recordCancellationRequest,
  recordNewSubscription,
  recordPlanChange,
} from "@/lib/subscription";

/**
 * Subscribe, change tier, cancel.
 *
 * Three rules hold across all of them:
 *
 *   1. The plan comes from the form, so it is validated against `PLAN_IDS`
 *      before it reaches a provider. A hand-crafted POST cannot name a tier
 *      that does not exist, and cannot name `free` — "free" is the absence of a
 *      subscription, not something to buy.
 *
 *   2. The subscription id comes from *our* database, keyed to the signed-in
 *      user's profile — never from the form. Otherwise anyone could cancel or
 *      re-plan a subscription by posting somebody else's id.
 *
 *   3. Nothing here marks a therapist paid. These actions record what the
 *      provider returned and then get out of the way; `active` is set only by
 *      the webhook, which is the only path with evidence that money moved.
 */

async function requireTherapistProfile() {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in?next=%2Fsubscription");
  if (viewer.role !== "provider" && viewer.role !== "admin") redirect("/not-authorized");
  const { profile } = await getOrCreateMyProfile(viewer.user.id);
  return profile;
}

/**
 * Rate limit, keyed on the user.
 *
 * Every action below makes a live call to a payment provider, so an unbounded
 * caller can make us hammer PayPal — and, on `startSubscription`, create real
 * subscription records in a loop. Returns an error string rather than throwing,
 * so a limited user sees the same kind of message as any other failure.
 */
function billingLimit(userId: string): string | null {
  const limited = rateLimit(
    `billing:${userId}`,
    LIMITS.billingAction.limit,
    LIMITS.billingAction.windowMs,
  );
  return limited.ok ? null : "Too many attempts. Please wait a moment and try again.";
}

/** Read and validate the requested tier. `free` is rejected — see rule 1. */
function requestedPlan(formData: FormData): string | null {
  const raw = String(formData.get("plan") ?? "").toLowerCase();
  if (!isPlanId(raw) || PLANS[raw].priceCents === 0) return null;
  return raw;
}

/**
 * Start a subscription.
 *
 * Records the row before redirecting, because the webhook is keyed on
 * `provider_subscription_id` and an approval that completes before the row
 * exists would be filed as "No matching subscription".
 *
 * The redirect goes to the provider's own approval page. `redirect()` throws,
 * so it is deliberately the last statement — anything after it would not run.
 */
export async function startSubscription(
  _prev: BillingState,
  formData: FormData,
): Promise<BillingState> {
  const profile = await requireTherapistProfile();
  const limited = billingLimit(profile.id);
  if (limited) return { error: limited };

  const plan = requestedPlan(formData);
  if (!plan || !isPlanId(plan)) return { error: "Choose one of the paid plans." };

  const existing = await getMySubscription(profile.id);
  if (existing && existing.status !== "none" && existing.status !== "canceled") {
    return { error: "You already have a subscription. Change your plan instead." };
  }

  let approvalUrl: string;
  try {
    const provider = getProvider();
    const ref = await provider.createSubscription(profile.id, plan);

    if (!ref.approvalUrl) {
      return { error: "The payment provider did not return an approval link. Please try again." };
    }

    await recordNewSubscription({
      profileId: profile.id,
      plan,
      provider: activeProviderId(),
      providerSubscriptionId: ref.id,
      status: ref.status,
      currentPeriodEnd: ref.nextChargeOn,
    });

    approvalUrl = ref.approvalUrl;
  } catch (error) {
    // The provider's message can name internal endpoints and account ids, so it
    // is logged rather than shown.
    console.error("startSubscription failed", error);
    return { error: "Could not start the subscription. Please try again." };
  }

  redirect(approvalUrl);
}

/**
 * Change tier on an existing subscription.
 *
 * PayPal may require the payer to re-approve an upgrade, in which case it
 * returns a fresh approval link and the therapist is sent back to PayPal. When
 * it does not, the change is already in effect and the page just refreshes.
 */
export async function changePlan(_prev: BillingState, formData: FormData): Promise<BillingState> {
  const profile = await requireTherapistProfile();
  const limited = billingLimit(profile.id);
  if (limited) return { error: limited };

  const plan = requestedPlan(formData);
  if (!plan || !isPlanId(plan)) return { error: "Choose one of the paid plans." };

  const existing = await getMySubscription(profile.id);
  if (!existing?.providerSubscriptionId) {
    return { error: "You do not have a subscription to change yet." };
  }

  let approvalUrl: string | null = null;
  try {
    const ref = await getProvider().updatePlan(existing.providerSubscriptionId, plan);
    await recordPlanChange(existing.id, plan);
    approvalUrl = ref.approvalUrl;
  } catch (error) {
    console.error("changePlan failed", error);
    return { error: "Could not change the plan. Please try again." };
  }

  if (approvalUrl) redirect(approvalUrl);

  revalidatePath("/subscription");
  return { ok: true };
}

/**
 * Cancel.
 *
 * Marks `cancel_at_period_end` rather than ending the listing immediately — the
 * therapist has paid for the current period. The provider's cancellation
 * webhook is what eventually sets `canceled`.
 */
export async function cancelSubscription(_prev: BillingState): Promise<BillingState> {
  const profile = await requireTherapistProfile();
  const limited = billingLimit(profile.id);
  if (limited) return { error: limited };

  const existing = await getMySubscription(profile.id);
  if (!existing?.providerSubscriptionId) {
    return { error: "You do not have a subscription to cancel." };
  }

  try {
    await getProvider().cancelSubscription(existing.providerSubscriptionId);
    await recordCancellationRequest(existing.id);
  } catch (error) {
    console.error("cancelSubscription failed", error);
    return { error: "Could not cancel the subscription. Please try again." };
  }

  revalidatePath("/subscription");
  return { ok: true };
}
