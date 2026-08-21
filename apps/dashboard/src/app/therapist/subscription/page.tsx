import { createSessionClient } from "@masseurmatch/db/auth";
import { CheckCircle, Zap } from "lucide-react";

import { getOrCreateMyProfile } from "@/lib/profile";

export default async function SubscriptionPage() {
  const supabase = createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { profile } = await getOrCreateMyProfile(user.id);

  return (
    <div className="space-y-8 p-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-brand-primary" />
          <h1 className="text-3xl font-bold text-text-primary">Subscription</h1>
        </div>
        <p className="text-text-secondary">Manage your MasseurMatch Pro membership</p>
      </div>

      <div className="rounded-lg border border-brand-primary/20 bg-brand-primary/5 p-6">
        <div className="flex items-start gap-4">
          <CheckCircle className="h-6 w-6 text-brand-primary" />
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Current Plan: {profile?.subscription_tier || "Free"}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Your account is active and your profile is visible in the directory.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border p-6">
          <p className="text-xs font-semibold uppercase text-text-secondary">Free Plan</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">$0</p>
          <p className="mt-1 text-xs text-text-secondary">/month</p>
          <ul className="mt-4 space-y-2">
            <li className="text-sm text-text-primary">✓ Profile listing</li>
            <li className="text-sm text-text-primary">✓ 3 photos</li>
            <li className="text-sm text-text-primary">✓ Basic analytics</li>
          </ul>
        </div>

        <div className="rounded-lg border border-brand-primary bg-brand-primary/5 p-6">
          <p className="text-xs font-semibold uppercase text-brand-primary">Standard Plan</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">$29</p>
          <p className="mt-1 text-xs text-text-secondary">/month</p>
          <ul className="mt-4 space-y-2">
            <li className="text-sm text-text-primary">✓ Everything in Free</li>
            <li className="text-sm text-text-primary">✓ Unlimited photos</li>
            <li className="text-sm text-text-primary">✓ Advanced analytics</li>
            <li className="text-sm text-text-primary">✓ Featured badge option</li>
          </ul>
        </div>

        <div className="rounded-lg border border-border p-6">
          <p className="text-xs font-semibold uppercase text-text-secondary">Elite Plan</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">$79</p>
          <p className="mt-1 text-xs text-text-secondary">/month</p>
          <ul className="mt-4 space-y-2">
            <li className="text-sm text-text-primary">✓ Everything in Standard</li>
            <li className="text-sm text-text-primary">✓ Premium placement</li>
            <li className="text-sm text-text-primary">✓ Priority support</li>
            <li className="text-sm text-text-primary">✓ Monthly Spikes</li>
          </ul>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Billing Information</h2>
        <div className="space-y-4">
          <div className="flex justify-between py-2">
            <span className="text-text-secondary">Current plan</span>
            <span className="font-medium text-text-primary">{profile?.subscription_tier || "Free"}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-text-secondary">Billing cycle</span>
            <span className="font-medium text-text-primary">Monthly</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-text-secondary">Next billing date</span>
            <span className="font-medium text-text-primary">—</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-text-secondary">Payment method</span>
            <span className="font-medium text-text-primary">Not configured</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Upgrade Your Plan</h2>
        <p className="mb-4 text-sm text-text-secondary">
          Upgrade to Standard or Elite to unlock advanced features and increase your visibility.
        </p>
        <button className="rounded-lg bg-brand-primary px-6 py-2 font-medium text-white transition hover:bg-brand-primary/90">
          Upgrade Now
        </button>
      </div>
    </div>
  );
}
