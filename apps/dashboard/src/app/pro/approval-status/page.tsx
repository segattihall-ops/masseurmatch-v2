import { PROFILE_STATUS_LABELS } from "@masseurmatch/db/profile-status";
import Link from "next/link";

import { PageHeader } from "@/components/pro/page-header";
import { DetailRow, Section } from "@/components/pro/section";
import { requireTherapist } from "@/lib/guards";
import { canSubmit, stepProgress } from "@/lib/onboarding";
import { getOrCreateMyProfile } from "@/lib/profile";
import { publicProfileUrl } from "@/lib/public-site";

import { SubmitForReviewForm } from "./submit-form";

export const metadata = { title: "Approval Status | MasseurMatch" };
export const dynamic = "force-dynamic";

const EXPLANATION: Record<string, string> = {
  draft:
    "Your profile has not been sent for review yet. Finish the items below and submit it, and it will appear in the directory once a reviewer approves it.",
  pending:
    "A reviewer has your profile. You can keep editing while you wait — changes are reviewed together.",
  approved:
    "Your profile is approved and can appear in the directory. Whether it is actually showing is your own visibility switch, which is separate.",
  rejected:
    "A reviewer requested changes. Update your listing, save the edits, then submit it again. Resubmitting returns it to review and does not publish it.",
  suspended:
    "Your profile has been suspended by our team. It cannot be resubmitted from the dashboard; open a support ticket if you need the decision reviewed.",
};

export default async function ProApprovalStatusPage() {
  const viewer = await requireTherapist("/pro/approval-status");
  const { profile, status, snapshot } = await getOrCreateMyProfile(viewer.user.id);

  const steps = stepProgress(snapshot);
  const ready = canSubmit(snapshot);
  const publicUrl = publicProfileUrl(profile);
  const notes = profile.moderation_notes?.trim();

  const outstanding = [
    { done: steps.basics, label: "Name, city and how to reach you", href: "/pro/listing" },
    { done: steps.services, label: "Services and rates", href: "/pro/listing" },
    { done: steps.photos, label: "At least one photo", href: "/pro/photos" },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Provider dashboard"
        title="Approval status"
        subtitle="Where your listing stands with our review team."
        action={
          publicUrl && status === "approved"
            ? { href: publicUrl, label: "View public profile" }
            : undefined
        }
      />

      <Section title={PROFILE_STATUS_LABELS[status]}>
        <p className="text-sm text-muted-foreground">{EXPLANATION[status]}</p>

        {notes ? (
          <div className="mt-4 rounded-lg border border-border bg-muted p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              From the reviewer
            </p>
            <p className="mt-1 whitespace-pre-line text-sm text-foreground">{notes}</p>
          </div>
        ) : null}

        <div className="mt-4">
          <DetailRow label="Review state" value={PROFILE_STATUS_LABELS[status]} />
          <DetailRow
            label="Your visibility switch"
            value={
              <Link href="/pro/dashboard" className="underline underline-offset-4">
                {profile.visibility_status === "public" ? "On" : "Off"}
              </Link>
            }
          />
          <DetailRow
            label="Pending edits"
            value={
              profile.moderation_status === "pending_review"
                ? "Yes — your latest changes are queued"
                : "None"
            }
          />
          <DetailRow label="Last saved" value={new Date(profile.updated_at).toLocaleDateString()} />
        </div>
      </Section>

      <Section
        title="What review looks for"
        description="Checked against your profile as it is now, not a generic list."
      >
        <ul className="space-y-2">
          {outstanding.map((item) => (
            <li
              key={item.label}
              className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-border py-2 last:border-0"
            >
              <span className="text-sm text-foreground">
                {item.done ? (
                  item.label
                ) : (
                  <Link href={item.href} className="underline underline-offset-4">
                    {item.label}
                  </Link>
                )}
              </span>
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                {item.done ? "Done" : "Still needed"}
              </span>
            </li>
          ))}
        </ul>

        {status === "approved" || status === "suspended" ? null : (
          <div className="mt-4">
            {ready ? (
              <SubmitForReviewForm />
            ) : (
              <p className="text-sm text-muted-foreground">
                Finish the items above and a submit button appears here.
              </p>
            )}
          </div>
        )}
      </Section>

      {status === "suspended" || status === "rejected" ? (
        <Section title="If you think this is wrong">
          <p className="text-sm text-muted-foreground">
            <Link href="/pro/tickets" className="underline underline-offset-4">
              Open a support ticket
            </Link>{" "}
            and a person will look at it. Reviews are done by people on our team, not by an
            automated filter, so there is somebody to ask.
          </p>
        </Section>
      ) : null}
    </>
  );
}
