import Link from "next/link";

import { PhotosStep } from "@/app/onboarding/photos-step";
import { PageHeader } from "@/components/pro/page-header";
import { DetailRow, Section } from "@/components/pro/section";
import { photoLimitForProfile } from "@/lib/cloudinary";
import { requireTherapist } from "@/lib/guards";
import { getOrCreateMyProfile, listMyPhotos } from "@/lib/profile";

export const metadata = { title: "Photos | MasseurMatch" };
export const dynamic = "force-dynamic";

/**
 * The gallery.
 *
 * `PhotosStep` is the real uploader — the same component onboarding uses — and
 * it is mounted rather than reimplemented, so there is one upload path and one
 * definition of the primary photo.
 *
 * What this page adds is the part the legacy version left out: how many slots
 * the plan allows, how many are used, and how each photo is doing in
 * moderation. The old page rendered the uploader inside a `bg-surface` card —
 * a class with no definition in this Tailwind preset — under a fixed `p-8`
 * that fought the Pro shell's own padding.
 */
export default async function ProPhotosPage() {
  const viewer = await requireTherapist("/pro/photos");
  const { profile } = await getOrCreateMyProfile(viewer.user.id);
  const photos = await listMyPhotos(profile.id);
  const limit = photoLimitForProfile(profile);

  const approved = photos.filter((p) => p.moderation_status === "approved").length;
  const rejected = photos.filter((p) => p.moderation_status === "rejected").length;
  const pending = photos.length - approved - rejected;

  return (
    <>
      <PageHeader
        eyebrow="Provider dashboard"
        title="Photos"
        subtitle="New photos are reviewed before they appear publicly. Your primary photo is the one on your card."
      />

      <Section title="Your gallery">
        <PhotosStep photos={photos} limit={limit} managePrimary />
      </Section>

      <Section title="Where they stand">
        <div>
          <DetailRow label="Used" value={`${photos.length} of ${limit} slots`} />
          <DetailRow label="Approved and public" value={approved} />
          <DetailRow label="Waiting for review" value={pending} />
          <DetailRow label="Rejected" value={rejected} />
        </div>

        {rejected > 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            A rejected photo is not shown to anyone and does not count against your listing. If you
            want to know why one was rejected,{" "}
            <Link href="/pro/tickets" className="underline underline-offset-4">
              ask us
            </Link>
            .
          </p>
        ) : null}

        {photos.length >= limit ? (
          <p className="mt-4 text-sm text-muted-foreground">
            You have used every slot on your plan.{" "}
            <Link href="/pro/subscription" className="underline underline-offset-4">
              More slots come with the paid plans
            </Link>
            .
          </p>
        ) : null}
      </Section>
    </>
  );
}
