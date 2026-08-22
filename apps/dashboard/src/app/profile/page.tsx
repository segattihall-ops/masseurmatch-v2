import { createServiceClient } from "@masseurmatch/db/client";
import { PROFILE_STATUS_LABELS } from "@masseurmatch/db/profile-status";
import { Card } from "@masseurmatch/ui";
import type { Metadata } from "next";
import Link from "next/link";

import { requireTherapist } from "@/lib/guards";
import { fromProfile, LISTING_COLUMNS, type ListingRow } from "@/lib/listing";
import { getOrCreateMyProfile } from "@/lib/profile";
import { publicProfileUrl } from "@/lib/public-site";

import { ListingForm } from "./listing-form";

export const metadata: Metadata = {
  title: "Your profile",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const viewer = await requireTherapist("/profile");
  const { profile, status } = await getOrCreateMyProfile(viewer.user.id);
  const publicUrl = publicProfileUrl(profile);
  const inReview = profile.moderation_status === "pending_review";

  /*
   * `getOrCreateMyProfile` selects the columns the dashboard shell needs; the
   * editor needs a different, wider set, and reading it here keeps that list
   * next to the mapping that writes it. A missing row cannot happen — the call
   * above creates one — so an empty result hydrates to a blank listing rather
   * than failing the page.
   */
  const { data: row } = await createServiceClient()
    .from("profiles")
    .select(LISTING_COLUMNS.join(","))
    .eq("id", viewer.user.id)
    .maybeSingle();

  const initial = fromProfile((row ?? {}) as ListingRow);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-ink">Your profile</h1>
          <p className="mt-1 text-sm text-ink/60">
            Status:{" "}
            <strong className="font-medium text-ink">{PROFILE_STATUS_LABELS[status]}</strong>
            {inReview ? " — changes queued for review" : null}
          </p>
        </div>

        {publicUrl ? (
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-wine hover:underline"
          >
            View public profile ↗
          </a>
        ) : (
          <span className="text-sm text-ink/50">No public page yet</span>
        )}
      </header>

      {status !== "approved" ? (
        <Card className="mb-6 border-wineSoft bg-wineSoft/40 p-4">
          <p className="text-sm text-wineDark">
            {status === "pending"
              ? "Your profile is waiting for review. You can keep editing while you wait."
              : status === "rejected"
                ? "Your profile was not approved. Update it and it will be reviewed again."
                : "Your profile is suspended. Contact support if you think that is a mistake."}{" "}
            <Link href="/onboarding" className="font-medium underline">
              Finish setup
            </Link>
          </p>
        </Card>
      ) : null}

      <ListingForm initial={initial} />
    </main>
  );
}
