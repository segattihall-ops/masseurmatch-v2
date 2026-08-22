import { createServiceClient } from "@masseurmatch/db/client";
import { PROFILE_STATUS_LABELS } from "@masseurmatch/db/profile-status";
import Link from "next/link";

import { ListingForm } from "@/app/profile/listing-form";
import { PageHeader } from "@/components/pro/page-header";
import { Section } from "@/components/pro/section";
import { requireTherapist } from "@/lib/guards";
import { fromProfile, LISTING_COLUMNS, type ListingRow } from "@/lib/listing";
import { getOrCreateMyProfile } from "@/lib/profile";
import { publicProfileUrl } from "@/lib/public-site";

export const metadata = { title: "My Profile | MasseurMatch" };
export const dynamic = "force-dynamic";

/**
 * The listing editor.
 *
 * `ListingForm` is the real editor and is mounted rather than copied —
 * production already learned what a second, partial editor writing the same
 * table under different field names costs, which is why `/pro/profile` is a
 * redirect to this page rather than a rival form.
 *
 * The shell is what changed. This route used to re-export `/profile`
 * wholesale, which brought that page's own `<main>` and max-width inside the
 * Pro layout's container — two nested containers and two sets of padding.
 * `/profile` still works on its own for anything linking to it.
 *
 * The wide read mirrors `/profile`: `getOrCreateMyProfile` selects what the
 * dashboard shell needs, and the editor needs a different, wider set. A missing
 * row cannot happen — the call above creates one — so an empty result hydrates
 * to a blank listing rather than failing the page.
 */
export default async function ProListingPage() {
  const viewer = await requireTherapist("/pro/listing");
  const { profile, status } = await getOrCreateMyProfile(viewer.user.id);
  const publicUrl = publicProfileUrl(profile);
  const queued = profile.moderation_status === "pending_review";

  const { data: row } = await createServiceClient()
    .from("profiles")
    .select(LISTING_COLUMNS.join(","))
    .eq("id", viewer.user.id)
    .maybeSingle();

  const initial = fromProfile((row ?? {}) as ListingRow);

  return (
    <>
      <PageHeader
        eyebrow="Provider dashboard"
        title="My profile"
        subtitle={`${PROFILE_STATUS_LABELS[status]}${queued ? " — your latest edits are queued for review" : ""}.`}
        action={publicUrl ? { href: publicUrl, label: "View public page" } : undefined}
      />

      {status === "approved" ? null : (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {status === "pending"
            ? "Your profile is with a reviewer. Keep editing if you like — changes are reviewed together."
            : status === "rejected"
              ? "Your profile was not approved. Update it and it goes back into the queue automatically."
              : status === "suspended"
                ? "Your profile is suspended. Open a support ticket if you think that is a mistake."
                : "Your profile is a draft and is not in the directory yet."}{" "}
          <Link href="/pro/approval-status" className="font-medium underline underline-offset-4">
            See what review is waiting for
          </Link>
        </p>
      )}

      {/* The form brings its own section headings and collapsible groups, so it
          is mounted bare rather than inside a `Section` that would title it
          twice. */}
      <ListingForm initial={initial} />

      <Section title="Elsewhere">
        <p className="text-sm text-muted-foreground">
          Photos live on{" "}
          <Link href="/pro/photos" className="underline underline-offset-4">
            Photos
          </Link>
          , travel dates and Available Now on{" "}
          <Link href="/pro/growth" className="underline underline-offset-4">
            Growth tools
          </Link>
          , and what your listing scores on{" "}
          <Link href="/pro/ai-coach" className="underline underline-offset-4">
            the coach
          </Link>
          .
        </p>
      </Section>
    </>
  );
}
