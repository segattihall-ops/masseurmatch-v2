import { PageHeader } from "@/components/pro/page-header";
import { EmptyState, Section } from "@/components/pro/section";
import { requireTherapist } from "@/lib/guards";
import { listMyImportedReviews, listMyImportRequests } from "@/lib/imported-reviews";
import { getOrCreateMyProfile } from "@/lib/profile";
import { importStatusLabel, isOpenImport } from "@/lib/review-imports";

import { ImportRequestForm } from "./import-form";

export const metadata = { title: "Import Reviews | MasseurMatch" };
export const dynamic = "force-dynamic";

/**
 * Reviews carried over from wherever a therapist was listed before.
 *
 * The page used to be read-only, and its empty state told people to "open a
 * support ticket with a link to your existing listing" — a dead end dressed as
 * an instruction, since nothing on the page could start one and the ticket
 * queue had no idea what to do with it. The form does what that sentence
 * described: it files the request against the therapist's own profile.
 *
 * `public_label` is shown as written rather than reworded here. It is the
 * disclosure that says an imported review was not left on MasseurMatch, and
 * restating it in this page's own words is how that claim drifts.
 */
export default async function ProImportReviewsPage() {
  const viewer = await requireTherapist("/pro/import-reviews");
  const { profile } = await getOrCreateMyProfile(viewer.user.id);

  const [reviews, requests] = await Promise.all([
    listMyImportedReviews(profile.id),
    listMyImportRequests(profile.id),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Provider dashboard"
        title="Import reviews"
        subtitle="Bring the reviews you already have across, and see how they appear on your listing."
      />

      <Section
        title="Request an import"
        description="Send us the listing your reviews are on now. A person checks it before anything is copied."
      >
        <ImportRequestForm defaultEmail={profile.email ?? viewer.user.email ?? ""} />
      </Section>

      <Section title="Your requests">
        {requests.length === 0 ? (
          <EmptyState>
            No imports requested yet. Add a link above and it will show up here with its status.
          </EmptyState>
        ) : (
          <ul className="space-y-3">
            {requests.map((request) => (
              <li key={request.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p className="min-w-0 font-medium text-foreground">
                    {/* `break-all`: these are pasted URLs, and one long enough
                        to have no spaces in it will otherwise push the card
                        wider than a phone. */}
                    <span className="break-all">{request.platform}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {importStatusLabel(request.status)}
                    {request.created_at
                      ? ` · asked ${new Date(request.created_at).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>

                <p className="mt-1 break-all text-xs text-muted-foreground">{request.source_url}</p>

                <p className="mt-2 text-sm text-muted-foreground">
                  {isOpenImport(request.status)
                    ? "Nothing to do — we will email you when it has been looked at."
                    : request.imported_review_count
                      ? `${request.imported_review_count} review${request.imported_review_count === 1 ? "" : "s"} brought across.`
                      : "Finished. Anything that came across is listed below."}
                </p>

                {/* The reviewer's note, when they left one. It is the only
                    explanation a declined request ever gets. */}
                {request.migration_notes ? (
                  <p className="mt-2 whitespace-pre-line rounded-lg bg-muted p-3 text-sm text-foreground">
                    {request.migration_notes}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        title="Imported reviews"
        description="Our team reviews every import before it shows publicly."
      >
        {reviews.length === 0 ? (
          <EmptyState>
            Nothing imported yet. Reviews appear here once a request above has been checked.
          </EmptyState>
        ) : (
          <ul className="space-y-3">
            {reviews.map((review) => (
              <li key={review.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p className="font-medium text-foreground">
                    {review.reviewer_anonymized
                      ? "Anonymised reviewer"
                      : (review.reviewer_name ?? "Reviewer")}
                    {review.rating === null ? "" : ` · ${review.rating}/5`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {review.is_public ? "Public" : "Not public"}
                    {review.review_date
                      ? ` · ${new Date(review.review_date).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
                {review.review_text ? (
                  <p className="mt-2 whitespace-pre-line text-sm text-foreground">
                    {review.review_text}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-muted-foreground">
                  {review.public_label}
                  {review.source_platform ? ` · ${review.source_platform}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
