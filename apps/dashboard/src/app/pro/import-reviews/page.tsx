import { createSessionClient } from "@masseurmatch/db/auth";

import { PageHeader } from "@/components/pro/page-header";
import { EmptyState, Section } from "@/components/pro/section";
import { requireTherapist } from "@/lib/guards";
import { getOrCreateMyProfile } from "@/lib/profile";

export const metadata = { title: "Import Reviews | MasseurMatch" };
export const dynamic = "force-dynamic";

type ImportedReview = {
  id: string;
  rating: number | null;
  review_text: string | null;
  reviewer_name: string | null;
  reviewer_anonymized: boolean | null;
  source_platform: string | null;
  public_label: string;
  is_public: boolean;
  review_date: string | null;
};

/**
 * Reviews carried over from wherever a therapist was listed before.
 *
 * `public_label` is shown as written rather than reworded here. It is the
 * disclosure that says an imported review was not left on MasseurMatch, and
 * restating it in this page's own words is how that claim drifts.
 */
export default async function ProImportReviewsPage() {
  const viewer = await requireTherapist("/pro/import-reviews");
  const { profile } = await getOrCreateMyProfile(viewer.user.id);

  const { data, error } = await createSessionClient()
    .from("imported_reviews")
    .select(
      "id,rating,review_text,reviewer_name,reviewer_anonymized,source_platform,public_label,is_public,review_date",
    )
    .eq("profile_id", profile.id)
    .order("review_date", { ascending: false })
    .limit(50);

  const reviews = error ? [] : ((data ?? []) as unknown as ImportedReview[]);

  return (
    <>
      <PageHeader
        eyebrow="Provider dashboard"
        title="Import reviews"
        subtitle="Reviews brought across from another platform, and how they appear on your listing."
      />

      <Section
        title="Imported reviews"
        description="Our team reviews every import before it shows publicly."
      >
        {reviews.length === 0 ? (
          <EmptyState>
            {error
              ? "Imported reviews are not available on this account yet."
              : "Nothing imported yet. Open a support ticket with a link to your existing listing to start an import."}
          </EmptyState>
        ) : (
          <ul className="space-y-3">
            {reviews.map((review) => (
              <li key={review.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
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
