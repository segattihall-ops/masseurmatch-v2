import { Card } from "@masseurmatch/ui";
import type { Metadata } from "next";
import Link from "next/link";

import { listProfileMigrations } from "@/lib/admin-imports";
import { requireAdmin } from "@/lib/guards";

import { reviewProfileImport } from "./actions";

export const metadata: Metadata = {
  title: "Profile Imports",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function externalUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export default async function MigrationsPage({
  searchParams,
}: {
  searchParams: { reviewed?: string; approved?: string; rejected?: string };
}) {
  await requireAdmin("/migrations");
  const migrations = await listProfileMigrations();
  const allReviews = migrations.flatMap((migration) => migration.reviews);
  const pending = allReviews.filter((review) => !review.reviewedAt);
  const approved = allReviews.filter((review) => review.reviewedAt && review.isPublic);
  const rejected = allReviews.filter((review) => review.reviewedAt && !review.isPublic);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-wine">
          Data operations
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Profile Imports</h1>
        <p className="mt-2 max-w-3xl text-sm text-ink/60">
          Review external profile migrations and imported testimonials. A submission is finalized in
          one database transaction, so partial review states cannot be created.
        </p>
      </header>

      {searchParams.reviewed ? (
        <p
          className="mt-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          role="status"
        >
          Import reviewed: {searchParams.approved ?? "0"} approved, {searchParams.rejected ?? "0"}{" "}
          rejected.
        </p>
      ) : null}

      <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Imports" value={migrations.length} />
        <Metric label="Pending reviews" value={pending.length} />
        <Metric label="Approved reviews" value={approved.length} />
        <Metric label="Rejected reviews" value={rejected.length} />
      </section>

      <section className="mt-8 space-y-4">
        {migrations.length === 0 ? (
          <Card className="p-8 text-center text-sm text-ink/55">No profile migrations found.</Card>
        ) : (
          migrations.map((migration) => {
            const pendingReviews = migration.reviews.filter((review) => !review.reviewedAt);
            const historical = migration.reviews.filter((review) => review.reviewedAt);
            const source = externalUrl(migration.sourceUrl);

            return (
              <details
                key={migration.id}
                open={pendingReviews.length > 0}
                className="rounded-2xl border border-ink/10 bg-white shadow-sm"
              >
                <summary className="cursor-pointer list-none px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{migration.profileName}</p>
                      <p className="mt-1 text-xs text-ink/50">
                        {migration.email} · {migration.platform} · {migration.status}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Pill
                        value={`${pendingReviews.length} pending`}
                        tone={pendingReviews.length > 0 ? "amber" : "neutral"}
                      />
                      <Pill value={`${migration.reviews.length} reviews`} tone="neutral" />
                      <Pill
                        value={migration.verified ? "Reviewed" : "Not finalized"}
                        tone={migration.verified ? "green" : "neutral"}
                      />
                    </div>
                  </div>
                </summary>

                <div className="border-t border-ink/10 p-5 sm:p-6">
                  <div className="flex flex-wrap gap-3 text-sm">
                    {migration.profileId ? (
                      <Link
                        href={`/people/${migration.profileId}`}
                        className="font-medium text-wine hover:underline"
                      >
                        Open provider →
                      </Link>
                    ) : null}
                    {source ? (
                      <a
                        href={source}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-wine hover:underline"
                      >
                        Source profile ↗
                      </a>
                    ) : null}
                  </div>
                  {migration.notes ? (
                    <p className="mt-4 rounded-xl bg-ink/[0.035] p-3 text-sm text-ink/60">
                      {migration.notes}
                    </p>
                  ) : null}

                  {pendingReviews.length > 0 ? (
                    <form action={reviewProfileImport} className="mt-6">
                      <input type="hidden" name="migration_id" value={migration.id} />
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h2 className="font-semibold text-ink">Pending publication review</h2>
                          <p className="mt-1 text-xs text-ink/50">
                            Every pending testimonial needs one decision before this import can be
                            finalized.
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-4">
                        {pendingReviews.map((review) => {
                          const reviewSource = externalUrl(review.sourceUrl);
                          return (
                            <fieldset
                              key={review.id}
                              className="rounded-xl border border-ink/10 p-4"
                            >
                              <input type="hidden" name="review_id" value={review.id} />
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-ink">
                                    {review.reviewerName || "Anonymous reviewer"}
                                    {review.rating !== null ? ` · ${review.rating}/5` : ""}
                                  </p>
                                  <p className="mt-1 text-xs text-ink/45">
                                    {[review.reviewDate, review.sourcePlatform]
                                      .filter(Boolean)
                                      .join(" · ")}
                                  </p>
                                </div>
                                {reviewSource ? (
                                  <a
                                    href={reviewSource}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs font-semibold text-wine hover:underline"
                                  >
                                    Evidence ↗
                                  </a>
                                ) : null}
                              </div>
                              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink/70">
                                {review.reviewText || "No review text supplied."}
                              </p>
                              <div className="mt-4 flex flex-wrap gap-5 text-sm">
                                <label className="inline-flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`decision_${review.id}`}
                                    value="approve"
                                    required
                                  />
                                  Approve for public profile
                                </label>
                                <label className="inline-flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`decision_${review.id}`}
                                    value="reject"
                                    required
                                  />
                                  Reject
                                </label>
                              </div>
                              <label className="mt-3 block">
                                <span className="text-xs font-medium text-ink/55">
                                  Review notes (optional)
                                </span>
                                <input
                                  name={`notes_${review.id}`}
                                  maxLength={1000}
                                  className="input mt-1.5"
                                />
                              </label>
                            </fieldset>
                          );
                        })}
                      </div>

                      <button
                        type="submit"
                        className="mt-5 min-h-11 rounded-lg bg-wine px-4 text-sm font-medium text-white"
                      >
                        Finalize all pending decisions
                      </button>
                    </form>
                  ) : (
                    <p className="mt-6 rounded-xl bg-ink/[0.035] p-4 text-sm text-ink/55">
                      No pending imported reviews in this migration.
                    </p>
                  )}

                  {historical.length > 0 ? (
                    <div className="mt-8">
                      <h2 className="font-semibold text-ink">Review history</h2>
                      <ul className="mt-3 divide-y divide-ink/10 rounded-xl border border-ink/10">
                        {historical.map((review) => (
                          <li key={review.id} className="p-4 text-sm">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="font-medium text-ink">
                                {review.reviewerName || "Anonymous reviewer"}
                                {review.rating !== null ? ` · ${review.rating}/5` : ""}
                              </p>
                              <Pill
                                value={review.isPublic ? "Approved" : "Rejected"}
                                tone={review.isPublic ? "green" : "red"}
                              />
                            </div>
                            <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-ink/60">
                              {review.reviewText || "No review text."}
                            </p>
                            {review.reviewNotes ? (
                              <p className="mt-2 text-xs text-ink/45">
                                Admin note: {review.reviewNotes}
                              </p>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </details>
            );
          })
        )}
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-ink/50">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">{value}</p>
    </Card>
  );
}

function Pill({ value, tone }: { value: string; tone: "neutral" | "amber" | "green" | "red" }) {
  const style =
    tone === "green"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "red"
        ? "bg-red-50 text-red-700"
        : tone === "amber"
          ? "bg-amber-50 text-amber-800"
          : "bg-ink/5 text-ink/60";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${style}`}>{value}</span>;
}
