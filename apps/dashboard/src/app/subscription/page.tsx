import { PAID_PLAN_IDS, PLANS } from "@masseurmatch/billing";
import { Card } from "@masseurmatch/ui";
import type { Metadata } from "next";

import { requireTherapist } from "@/lib/guards";
import { getOrCreateMyProfile } from "@/lib/profile";
import { buildView, getMySubscription } from "@/lib/subscription";

import { CancelForm, PlanPicker } from "./plan-forms";

export const metadata: Metadata = {
  title: "Subscription",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Subscription.
 *
 * Status and dates come from `therapist_subscriptions`, which the webhook owns,
 * rather than from `profiles.subscription_status` — the profile carries a cached
 * copy and the two can lag. Prices and limits come from `plans.ts`.
 *
 * Note what this page cannot do: nothing here, and nothing in the actions it
 * calls, can mark a therapist as paid. Every path to `active` runs through
 * `/api/webhooks/billing`.
 */
export default async function SubscriptionPage() {
  const viewer = await requireTherapist("/subscription");
  const { profile } = await getOrCreateMyProfile(viewer.user.id);
  const subscription = await getMySubscription(profile.id);
  const view = buildView(profile.subscription_tier, subscription);

  const plans = PAID_PLAN_IDS.map((id) => ({
    id,
    name: PLANS[id].name,
    priceCents: PLANS[id].priceCents,
    photoLimit: PLANS[id].photoLimit,
    blurb: PLANS[id].blurb,
  }));

  const nextCharge = view.nextChargeOn
    ? new Date(view.nextChargeOn).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-semibold text-ink">Subscription</h1>
      <p className="mt-1 mb-8 text-sm text-ink/60">Your current plan and what it includes.</p>

      <Card className="p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-sm text-ink/60">Plan</dt>
            <dd className="text-lg font-semibold text-ink">{view.planName}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink/60">Status</dt>
            <dd className="text-lg font-semibold text-ink">{view.statusLabel}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink/60">Photos included</dt>
            <dd className="text-lg font-semibold text-ink">{view.photoLimit}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink/60">
              {view.cancelAtPeriodEnd ? "Access until" : "Next charge"}
            </dt>
            <dd className="text-lg font-semibold text-ink">
              {nextCharge ?? <span className="text-ink/40">—</span>}
            </dd>
          </div>
        </dl>

        {view.status === "past_due" ? (
          <p className="mt-4 border-t border-ink/10 pt-4 text-sm text-wine">
            A payment did not go through. Your listing stays live for a short grace period — update
            your payment method at PayPal to keep it up.
          </p>
        ) : null}
      </Card>

      <PlanPicker
        plans={plans}
        currentPlanId={view.planId}
        hasSubscription={view.hasProviderSubscription && view.status !== "canceled"}
      />

      {view.isActive && view.hasProviderSubscription ? (
        <CancelForm cancelAtPeriodEnd={view.cancelAtPeriodEnd} />
      ) : null}
    </main>
  );
}
