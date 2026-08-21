import { therapistName } from "@masseurmatch/db/actions/directory-config";
import type { Metadata } from "next";

import { requireAdmin } from "@/lib/guards";
import { getModerationQueue } from "@/lib/admin";
import { publicProfileUrl } from "@/lib/public-site";

import { ModerationQueue, type QueueRow } from "./queue";

export const metadata: Metadata = {
  title: "Moderation queue",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ModerationPage({
  searchParams,
}: {
  searchParams: { profile?: string };
}) {
  await requireAdmin("/admin/moderation");
  const items = await getModerationQueue();
  const requestedProfile = searchParams.profile?.trim();
  const visibleItems = requestedProfile
    ? items.filter(({ profile }) => profile.id === requestedProfile)
    : items;

  const rows: QueueRow[] = visibleItems.map(({ profile, kind, photos }) => ({
    id: profile.id,
    name: therapistName({ ...profile, slug: profile.slug ?? profile.id }),
    headline: profile.headline,
    bio: profile.bio,
    city: profile.city,
    state: profile.state,
    services: [...(profile.service_categories ?? []), ...(profile.additional_services ?? [])],
    kind,
    moderationNotes: profile.moderation_notes,
    photos,
    publicUrl: kind === "edited" ? publicProfileUrl(profile) : null,
  }));

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-ink">Moderation queue</h1>
        <p className="mt-1 text-sm text-ink/60">
          {requestedProfile
            ? rows.length === 0
              ? "That profile is no longer waiting for moderation."
              : "Showing the profile requested by the legacy approval link."
            : rows.length === 0
              ? "Nothing waiting."
              : `${rows.length} waiting — oldest first, so nothing starves at the back.`}
        </p>
        {requestedProfile ? (
          <a href="/admin/moderation" className="mt-3 inline-block text-sm font-medium text-wine hover:underline">
            ← Back to full queue
          </a>
        ) : null}
      </header>

      <ModerationQueue rows={rows} />
    </main>
  );
}
