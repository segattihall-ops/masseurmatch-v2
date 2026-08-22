import { CopyField } from "@/components/pro/copy-field";
import { PageHeader } from "@/components/pro/page-header";
import { DetailRow, EmptyState, Section } from "@/components/pro/section";
import { dashboardUrl } from "@/lib/dashboard-url";
import { requireTherapist } from "@/lib/guards";
import { getMyReferralCode, listMyReferralSignups } from "@/lib/referral-rewards";
import { referralSignUpUrl } from "@/lib/referrals";

export const metadata = { title: "Referral Rewards | MasseurMatch" };
export const dynamic = "force-dynamic";

/**
 * The therapist's referral code and what it has earned.
 *
 * Two things were wrong here. The code was `select`ed and never issued, so
 * every therapist saw "no referral code on this account yet" forever — see the
 * note in `@/lib/referral-rewards`. And even with a code, the page showed the
 * bare string with nothing to share: no link, nothing to copy, and no route
 * that would have honoured one. A referral programme whose link does not exist
 * is a page about a feature rather than the feature.
 *
 * Revoked signups stay on the list. A reward that quietly disappears is
 * indistinguishable from one that never counted, and the second is the thing
 * people write in about.
 */
export default async function ProReferralsPage() {
  const viewer = await requireTherapist("/pro/referrals");

  const [code, signups] = await Promise.all([
    getMyReferralCode(viewer.user.id),
    listMyReferralSignups(viewer.user.id),
  ]);

  const link = code ? referralSignUpUrl(dashboardUrl(), code.code) : null;

  return (
    <>
      <PageHeader
        eyebrow="Provider dashboard"
        title="Referral rewards"
        subtitle="Earn free months when a therapist you refer subscribes."
      />

      <Section
        title="Your link"
        description="Anyone who signs up through this is attributed to you, including through Google."
      >
        {code && link ? (
          <div className="space-y-4">
            <CopyField value={link} label="your referral link" />

            <div>
              <DetailRow label="Your code" value={<span className="font-mono">{code.code}</span>} />
              <DetailRow label="Referrals" value={code.referral_count} />
              <DetailRow label="Months earned" value={code.premium_months_earned} />
            </div>

            <p className="text-sm text-muted-foreground">
              A referral counts once the therapist you sent has paid for their first month. Until
              then it sits below as waiting.
            </p>
          </div>
        ) : (
          <EmptyState>
            We could not issue a referral code for this account. Nothing is wrong with your listing
            — contact support and we will sort it out.
          </EmptyState>
        )}
      </Section>

      <Section title="Signups">
        {signups.length === 0 ? (
          <EmptyState>Nobody has signed up with your link yet.</EmptyState>
        ) : (
          <ul className="space-y-2">
            {signups.map((signup) => (
              <li
                key={signup.id}
                className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 rounded-lg border border-border p-4"
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
