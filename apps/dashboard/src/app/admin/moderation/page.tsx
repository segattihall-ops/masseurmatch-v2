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

export default async function ModerationPage() {
  await requireAdmin("/admin/moderation");
  const items = await getModerationQueue();

  const rows: QueueRow[] = items.map(({ profile, kind, photos }) => ({
    id: profile.id,
    // A queued profile may have no slug yet — it is assigned on approval — so
    // fall back rather than requiring one just to render a name.
    name: therapistName({ ...profile, slug: profile.slug ?? profile.id }),
    headline: profile.headline,
    bio: profile.bio,
    city: profile.city,
    state: profile.state,
    services: [...(profile.service_categories ?? []), ...(profile.additional_services ?? [])],
    kind,
    moderationNotes: profile.moderation_notes,
    photos,
    // Only an already-live profile has a public page; a new submission is
    // private, so linking to it would 404.
    publicUrl: kind === "edited" ? publicProfileUrl(profile) : null,
  }));

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-ink">Moderation queue</h1>
        <p className="mt-1 text-sm text-ink/60">
          {rows.length === 0
            ? "Nothing waiting."
            : `${rows.length} waiting — oldest first, so nothing starves at the back.`}
        </p>
      </header>

      <ModerationQueue rows={rows} />
    </main>
  );
}
