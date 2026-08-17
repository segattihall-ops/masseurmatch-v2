import { Card } from "@masseurmatch/ui";
import { PROFILE_STATUS_LABELS } from "@masseurmatch/db/profile-status";
import type { Metadata } from "next";

import { photoLimitForProfile } from "@/lib/cloudinary";
import { requireTherapist } from "@/lib/guards";
import { currentStep, stepProgress, STEP_LABELS, type OnboardingStep } from "@/lib/onboarding";
import { getOrCreateMyProfile, listMyPhotos } from "@/lib/profile";

import { PhotosStep } from "./photos-step";
import { BasicsStep, ReviewStep, ServicesStep, StepShell, Stepper } from "./steps";

export const metadata: Metadata = {
  title: "Set up your profile",
  robots: { index: false, follow: false },
};

/** Reads the session, so it can never be statically rendered. */
export const dynamic = "force-dynamic";

/**
 * Service options offered in the picker.
 *
 * Hard-coded for now rather than read from a table: `service_categories` is a
 * free-text array on `profiles`, and there is no service taxonomy table anon or
 * an authenticated therapist can read. Worth revisiting if one appears.
 */
const SERVICE_OPTIONS = [
  "Swedish",
  "Deep tissue",
  "Sports",
  "Trigger point",
  "Myofascial release",
  "Prenatal",
  "Hot stone",
  "Reflexology",
  "Lymphatic drainage",
  "Stretch therapy",
];

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: { step?: string };
}) {
  const viewer = await requireTherapist("/onboarding");
  const { profile, snapshot, status } = await getOrCreateMyProfile(viewer.user.id);
  const photos = await listMyPhotos(profile.id);

  const progress = stepProgress(snapshot);
  const resumeAt = currentStep(snapshot);

  // `?step=` lets a therapist go back and edit a completed step. Anything
  // unrecognised falls back to where they left off.
  const requested = searchParams.step as OnboardingStep | undefined;
  const step: OnboardingStep =
    requested && requested in STEP_LABELS ? (requested as OnboardingStep) : resumeAt;

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-ink">Set up your profile</h1>
        <p className="mt-1 text-sm text-ink/60">
          Progress saves as you go — you can leave and pick up where you stopped. Current status:{" "}
          <strong className="font-medium text-ink">{PROFILE_STATUS_LABELS[status]}</strong>.
        </p>
      </header>

      <Stepper current={step} progress={progress} />

      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold text-ink">{STEP_LABELS[step]}</h2>

        <StepShell step={step}>
          {step === "basics" ? (
            <BasicsStep
              initial={{
                display_name: profile.display_name ?? undefined,
                full_name: profile.full_name ?? undefined,
                headline: profile.headline ?? undefined,
                bio: profile.bio ?? undefined,
                city: profile.city ?? undefined,
                state: profile.state ?? undefined,
                phone: profile.phone ?? undefined,
                email: profile.email ?? viewer.user.email ?? undefined,
              }}
            />
          ) : null}

          {step === "services" ? (
            <ServicesStep
              options={SERVICE_OPTIONS}
              initial={{
                service_categories: profile.service_categories ?? [],
                incall_price: profile.incall_price,
                outcall_price: profile.outcall_price,
              }}
            />
          ) : null}

          {step === "photos" ? (
            <PhotosStep photos={photos} limit={photoLimitForProfile(profile)} />
          ) : null}

          {step === "review" ? <ReviewStep ready={progress.review} /> : null}
        </StepShell>
      </Card>
    </main>
  );
}
