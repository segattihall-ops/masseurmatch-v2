import { Card } from "@masseurmatch/ui";
import type { Metadata } from "next";
import Link from "next/link";

import { listAdminPhotos } from "@/lib/admin-operations";
import { requireAdmin } from "@/lib/guards";

import { moderatePhoto } from "../operations-actions";

export const metadata: Metadata = {
  title: "Photo moderation",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUSES = ["pending", "approved", "rejected", "all"] as const;

export default async function AdminPhotosPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  await requireAdmin("/photos");
  const status = STATUSES.includes(searchParams.status as (typeof STATUSES)[number])
    ? (searchParams.status as (typeof STATUSES)[number])
    : "pending";
  const photos = await listAdminPhotos(status);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-ink sm:text-3xl">Photo moderation</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-ink/60">
            Review provider photos independently from profile approval. Pending photos are never
            made public by this screen until you approve them.
          </p>
        </div>
        <Link
          href="/moderation"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-wine/20 px-3 py-2 text-sm font-medium text-wine hover:bg-wineSoft/30 sm:w-auto"
        >
          Profile approvals →
        </Link>
      </div>

      <nav aria-label="Photo status" className="mt-6 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap">
        {STATUSES.map((value) => (
          <Link
            key={value}
            href={value === "pending" ? "/photos" : `/photos?status=${value}`}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm capitalize ${
              status === value ? "bg-wine text-white" : "bg-ink/5 text-ink/70 hover:bg-ink/10"
            }`}
          >
            {value}
          </Link>
        ))}
      </nav>

      <p className="mt-5 text-sm text-ink/50">
        {photos.length} photo{photos.length === 1 ? "" : "s"} in this view.
      </p>

      {photos.length === 0 ? (
        <Card className="mt-6 p-6 text-center sm:p-8">
          <p className="text-sm text-ink/60">Nothing matches this status.</p>
        </Card>
      ) : (
        <ul className="mt-6 grid list-none grid-cols-1 gap-5 p-0 md:grid-cols-2 xl:grid-cols-3">
          {photos.map((photo) => (
            <li key={photo.id}>
              <Card className="overflow-hidden p-0">
                <div className="aspect-square bg-ink/5">
                  {photo.url ? (
                    // eslint-disable-next-line @next/next/no-img-element -- admin review supports Cloudinary and legacy Supabase URLs.
                    <img
                      src={photo.url}
                      alt={`Photo submitted by ${photo.profileName}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-4 text-center text-sm text-ink/50">
                      Image URL unavailable. Storage path: {photo.storagePath ?? "missing"}
                    </div>
                  )}
                </div>

                <div className="space-y-3 p-4">
                  <div>
                    <p className="font-medium text-ink">{photo.profileName}</p>
                    <p className="mt-0.5 text-xs leading-5 text-ink/50">
                      {photo.isPrimary ? "Primary · " : ""}
                      {photo.storageBucket ?? "unknown source"} ·{" "}
                      {new Date(photo.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <p className="text-sm capitalize text-ink/70">
                    Status: <strong className="font-medium text-ink">{photo.status}</strong>
                  </p>
                  {photo.reason ? (
                    <p className="text-sm leading-6 text-ink/60">{photo.reason}</p>
                  ) : null}

                  {photo.status === "pending" ? (
                    <form action={moderatePhoto} className="space-y-3 border-t border-ink/10 pt-3">
                      <input type="hidden" name="photo_id" value={photo.id} />
                      <label
                        className="block text-xs font-medium text-ink/70"
                        htmlFor={`reason-${photo.id}`}
                      >
                        Review note / rejection reason
                      </label>
                      <textarea
                        id={`reason-${photo.id}`}
                        name="reason"
                        rows={3}
                        placeholder="Required for rejection."
                        className="w-full rounded-lg border border-ink/15 bg-transparent px-3 py-2 text-base text-ink sm:text-sm"
                      />
                      <div className="grid gap-2 sm:flex">
                        <button
                          type="submit"
                          name="action"
                          value="approve"
                          className="min-h-11 w-full rounded-lg bg-wine px-3 py-2 text-sm font-medium text-white sm:w-auto"
                        >
                          Approve
                        </button>
                        <button
                          type="submit"
                          name="action"
                          value="reject"
                          className="min-h-11 w-full rounded-lg border border-wine/30 px-3 py-2 text-sm font-medium text-wine sm:w-auto"
                        >
                          Reject
                        </button>
                      </div>
                    </form>
                  ) : null}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
