import { featuresFor, formatPrice, PAID_PLAN_IDS, PLANS } from "@masseurmatch/billing";
import { resolveTier } from "@masseurmatch/db/tier-grants";
import Link from "next/link";

import { CancelForm, PlanPicker, RefreshStatusForm } from "@/app/subscription/plan-forms";
import { PageHeader } from "@/components/pro/page-header";
import { DetailRow, Section } from "@/components/pro/section";
import { requireTherapist } from "@/lib/guards";
import { getOrCreateMyProfile } from "@/lib/profile";
import { buildView, getMySubscription } from "@/lib/subscription";

export const metadata = { title: "Subscription | MasseurMatch" };
export const dynamic = "force-dynamic";

/**
 * Plan, billing state, and how to change either.
 *
 * ---------------------------------------------------------------------------
 * What was here before
 * ---------------------------------------------------------------------------
 * A re-export of the legacy page, which hard-coded three plans at $0, $29 and
 * $79 with feature lists typed into the JSX; announced "your account is active
 * and your profile is visible in the directory" to everyone, including hidden
 * and unapproved profiles; printed "Next billing date —" and "Payment method
 * Not configured" as literals; and ended with an "Upgrade Now" button that had
 * no handler and no link. Nothing on the page could take a payment or read one.
 *
 * Meanwhile `/subscription` was already doing this properly. Prices and limits
 * come from `plans.ts`; status and dates come from `therapist_subscriptions`,
 * which the webhook owns, rather than from `profiles.subscription_status` —
 * the profile carries a cached copy and the two can lag.
 *
 * The tier is the **entitled** one from `resolveTier()`. A lapsed courtesy
 * grant would otherwise be told it is on Elite with twelve photo slots, on the
 * very page it came to in order to pay for them.
 *
 * Note what this page still cannot do: nothing here, and nothing in the actions
 * it calls, can mark a therapist as paid. Every path to `active` runs through
 * `/api/webhooks/billing`.
 */
export default async function ProSubscriptionPage() {
  const viewer = await requireTherapist("/pro/subscription");
  const { profile } = await getOrCreateMyProfile(viewer.user.id);
  const subscription = await getMySubscription(profile.id).catch(() => null);
  const view = buildView(resolveTier(profile), subscription, profile.photo_limit);

  const plans = PAID_PLAN_IDS.map((id) => ({
    id,
    name: PLANS[id].name,
    priceCents: PLANS[id].priceCents,
    photoLimit: PLANS[id].photoLimit,
    blurb: PLANS[id].blurb,
    // Only what the plan actually gives. A locked row on a card somebody is
    // being asked to buy is noise — the point of the card is what they get.
    unlocks: featuresFor(id)
      .filter((entry) => entry.access === "full")
      .map((entry) => entry.feature.label),
  }));

  const nextCharge = view.nextChargeOn
    ? new Date(view.nextChargeOn).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <>
      <PageHeader
        eyebrow="Provider dashboard"
        title="Subscription"
        subtitle="Your plan, what it includes, and what happens next."
        action={{ href: "/pro/payment-history", label: "Payment history" }}
      />

      <Section title="Your plan">
        <div>
          <DetailRow label="Plan" value={`${view.planName} · ${formatPrice(PLANS[view.planId])}`} />
          <DetailRow label="Status" value={view.statusLabel} />
          <DetailRow label="Photos included" value={view.photoLimit} />
          <DetailRow
            label={view.cancelAtPeriodEnd ? "Access until" : "Next charge"}
            value={nextCharge ?? "—"}
          />
        </div>

        {view.status === "past_due" ? (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            A payment did not go through. Your listing stays live for a short grace period — update
            your payment method with the provider to keep it up.
          </p>
        ) : null}

        {view.cancelAtPeriodEnd ? (
          <p className="mt-4 rounded-lg border border-border bg-muted p-4 text-sm text-muted-foreground">
            Your plan is set to end. Nothing is deleted — your listing drops back to Free when the
            period closes.
          </p>
        ) : null}
      </Section>

      <Section
        title="What your plan gives you"
        description="Straight from the entitlement table, so this and the tools themselves cannot disagree."
      >
        <ul className="space-y-2">
          {featuresFor(view.planId).map(({ feature, access }) => (
            <li
              key={feature.id}
              className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-border py-2 last:border-0"
            >
              <span className="text-sm text-foreground">{feature.label}</span>
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                {access === "full" ? "Included" : access === "preview" ? "Preview" : "Not included"}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <PlanPicker
        plans={plans}
        currentPlanId={view.planId}
        hasSubscription={view.hasProviderSubscription && view.status !== "canceled"}
      />

      {view.hasProviderSubscription && !view.isActive ? <RefreshStatusForm /> : null}

      {view.isActive && view.hasProviderSubscription ? (
        <CancelForm cancelAtPeriodEnd={view.cancelAtPeriodEnd} />
      ) : null}

      <Section title="Billing questions">
        <p className="text-sm text-muted-foreground">
          Every charge and refund recorded against your account is on{" "}
          <Link href="/pro/payment-history" className="underline underline-offset-4">
            Payment history
          </Link>
          , including the ones that failed. If something there looks wrong,{" "}
          <Link href="/pro/tickets" className="underline underline-offset-4">
            open a ticket
          </Link>{" "}
          and quote the date.
        </p>
      </Section>
    </>
  );
}
