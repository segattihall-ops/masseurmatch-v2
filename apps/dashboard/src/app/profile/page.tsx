import { PROFILE_STATUS_LABELS } from "@masseurmatch/db/profile-status";
import { Card } from "@masseurmatch/ui";
import type { Metadata } from "next";
import Link from "next/link";

import { requireTherapist } from "@/lib/guards";
import { getOrCreateMyProfile } from "@/lib/profile";
import { publicProfileUrl } from "@/lib/public-site";
import { SERVICE_OPTIONS } from "@/lib/services";

import { EditProfileForm } from "./edit-form";

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

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
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

      <Card className="p-6">
        <EditProfileForm
          initial={{
            display_name: profile.display_name,
            full_name: profile.full_name,
            headline: profile.headline,
            bio: profile.bio,
            city: profile.city,
            state: profile.state,
            phone: profile.phone,
            email: profile.email,
            service_categories: profile.service_categories,
            incall_price: profile.incall_price,
            outcall_price: profile.outcall_price,
          }}
          serviceOptions={[...SERVICE_OPTIONS]}
        />
      </Card>
    </main>
  );
}
