import { Card } from "@masseurmatch/ui";
import type { Metadata } from "next";

import { photoLimitFor } from "@/lib/cloudinary";
import { requireTherapist } from "@/lib/guards";
import { getOrCreateMyProfile } from "@/lib/profile";

export const metadata: Metadata = {
  title: "Subscription",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Subscription status — read-only in this phase.
 *
 * Everything below is read straight from `profiles`. Phase 7 introduces
 * `packages/billing` with a `PaymentProvider` abstraction and real subscribe /
 * change-plan / cancel actions.
 *
 * The component is shaped to take that without rework: it renders a plain
 * `SubscriptionView` object rather than reaching into the profile row itself,
 * so phase 7 only has to change where that object is built — from the billing
 * provider instead of the database — and add the action buttons. No JSX here
 * needs to move.
 */

type SubscriptionView = {
  tier: string;
  statusLabel: string;
  isActive: boolean;
  photoLimit: number;
  /** Phase 7 fills this from the provider; the database has no billing date. */
  nextChargeOn: string | null;
};

const TIER_LABELS: Record<string, string> = {
  free: "Free",
  standard: "Standard",
  pro: "Pro",
  elite: "Elite",
};

const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);

export default async function SubscriptionPage() {
  const viewer = await requireTherapist("/subscription");
  const { profile } = await getOrCreateMyProfile(viewer.user.id);

  const tier = (profile.subscription_tier ?? "free").toLowerCase();
  const status = (profile.subscription_status ?? "none").toLowerCase();

  const view: SubscriptionView = {
    tier: TIER_LABELS[tier] ?? tier,
    statusLabel: status === "none" ? "No active subscription" : status.replace(/_/g, " "),
    isActive: ACTIVE_STATUSES.has(status),
    photoLimit: photoLimitFor(profile.subscription_tier, profile.photo_limit),
    nextChargeOn: null,
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-semibold text-ink">Subscription</h1>
      <p className="mt-1 mb-8 text-sm text-ink/60">Your current plan and what it includes.</p>

      <Card className="p-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-ink/60">Plan</dt>
            <dd className="text-lg font-semibold text-ink">{view.tier}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink/60">Status</dt>
            <dd className="text-lg font-semibold capitalize text-ink">{view.statusLabel}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink/60">Photos included</dt>
            <dd className="text-lg font-semibold text-ink">{view.photoLimit}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink/60">Next charge</dt>
            <dd className="text-lg font-semibold text-ink">
              {view.nextChargeOn ?? <span className="text-ink/40">—</span>}
            </dd>
          </div>
        </dl>
      </Card>

      <p className="mt-4 text-sm text-ink/50">
        Changing or cancelling a plan is not available yet — billing is connected in a later phase.
        {view.isActive
          ? " Your current plan stays active in the meantime."
          : " Listings remain free while this is being set up."}
      </p>
    </main>
  );
}
