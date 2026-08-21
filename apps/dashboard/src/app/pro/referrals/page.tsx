import { createSessionClient } from "@masseurmatch/db/auth";

import { PageHeader } from "@/components/pro/page-header";
import { DetailRow, EmptyState, Section } from "@/components/pro/section";
import { requireTherapist } from "@/lib/guards";

export const metadata = { title: "Referral Rewards | MasseurMatch" };
export const dynamic = "force-dynamic";

type ReferralCode = {
  id: string;
  code: string;
  referral_count: number;
  premium_months_earned: number;
};

type Signup = {
  id: string;
  payment_status: string;
  reward_months: number;
  qualified_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

/**
 * The therapist's referral code and what it has earned.
 *
 * Revoked signups stay on the list. A reward that quietly disappears is
 * indistinguishable from one that never counted, and the second is the thing
 * people write in about.
 */
export default async function ProReferralsPage() {
  const viewer = await requireTherapist("/pro/referrals");
  const supabase = createSessionClient();

  const { data: codeRow } = await supabase
    .from("referral_codes")
    .select("id,code,referral_count,premium_months_earned")
    .eq("user_id", viewer.user.id)
    .maybeSingle();

  const code = (codeRow as unknown as ReferralCode | null) ?? null;

  const { data: signupRows } = code
    ? await supabase
        .from("referral_signups")
        .select("id,payment_status,reward_months,qualified_at,revoked_at,created_at")
        .eq("referrer_user_id", viewer.user.id)
        .order("created_at", { ascending: false })
        .limit(50)
    : { data: [] };

  const signups = (signupRows ?? []) as unknown as Signup[];

  return (
    <>
      <PageHeader
        eyebrow="Provider dashboard"
        title="Referral rewards"
        subtitle="Earn free months when a therapist you refer subscribes."
      />

      <Section title="Your code">
        {code ? (
          <div>
            <p className="font-mono text-lg font-semibold text-foreground">{code.code}</p>
            <div className="mt-3">
              <DetailRow label="Referrals" value={code.referral_count} />
              <DetailRow label="Months earned" value={code.premium_months_earned} />
            </div>
          </div>
        ) : (
          <EmptyState>
            No referral code on this account yet. One is issued with your first paid month.
          </EmptyState>
        )}
      </Section>

      <Section title="Signups">
        {signups.length === 0 ? (
          <EmptyState>Nobody has signed up with your code yet.</EmptyState>
        ) : (
          <ul className="space-y-2">
            {signups.map((signup) => (
              <li
                key={signup.id}
                className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-border p-4"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {new Date(signup.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {signup.revoked_at
                      ? "Reward revoked"
                      : signup.qualified_at
                        ? `Qualified · ${signup.reward_months} month${signup.reward_months === 1 ? "" : "s"}`
                        : "Waiting on their first payment"}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">{signup.payment_status}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
