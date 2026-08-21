import Link from "next/link";

import { PageHeader } from "@/components/pro/page-header";
import { DetailRow, Section } from "@/components/pro/section";
import { requireTherapist } from "@/lib/guards";
import { getProDashboard } from "@/lib/pro-dashboard";

export const metadata = { title: "Trust & Verification | MasseurMatch" };
export const dynamic = "force-dynamic";

/**
 * Every trust signal on the account, in one place.
 *
 * Verified rows stay visible instead of disappearing once they pass. A badge
 * that quietly vanishes from the dashboard is indistinguishable from one that
 * was revoked, and the difference matters to the person it belongs to.
 *
 * Approval and visibility are listed side by side because they are the pair
 * people confuse: an approved profile that is switched off is not in trouble,
 * and a visible profile that was never approved is not yet discoverable.
 */
export default async function ProTrustPage() {
  const viewer = await requireTherapist("/pro/trust");
  const data = await getProDashboard(viewer.user.id);
  const { profile } = data;

  const rows: { label: string; value: string; href: string }[] = [
    {
      label: "Phone",
      value: profile.is_verified_phone ? "Verified" : "Not verified",
      href: "/verify-phone",
    },
    {
      label: "Identity document",
      value: profile.is_verified_identity ? "Verified" : (data.identity ?? "Not started"),
      href: "/verify-id",
    },
    {
      label: "Profile approval",
      value: profile.profile_status ?? "draft",
      href: "/pro/approval-status",
    },
    {
      label: "Visibility",
      value: data.toggles.visible ? "On" : "Off",
      href: "/pro/dashboard",
    },
    {
      label: "Approved photos",
      value: `${data.photos.approved} of ${data.photos.approved + data.photos.pending + data.photos.rejected}`,
      href: "/pro/photos",
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Provider dashboard"
        title="Trust & verification"
        subtitle="What we have confirmed about your account, and what is still open."
      />

      <Section
        title="Verification state"
        description="Approval is a separate state from visibility — one is our review, the other is your switch."
      >
        <div>
          {rows.map((row) => (
            <DetailRow
              key={row.label}
              label={row.label}
              value={
                <Link href={row.href} className="underline underline-offset-4">
                  {row.value}
                </Link>
              }
            />
          ))}
        </div>
      </Section>

      <Section title="What clients see">
        <p className="text-sm text-muted-foreground">
          Verified phone and identity earn the trust badges on your public card. Documents are
          checked by a person on our team and then deleted — they are never shown to clients or
          stored beyond the review.
        </p>
      </Section>
    </>
  );
}
