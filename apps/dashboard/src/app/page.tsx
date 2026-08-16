import { PROFILE_STATUS_LABELS } from "@masseurmatch/db/profile-status";
import {
  Avatar,
  buttonVariants,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FadeIn,
  PageTransition,
  StaggerItem,
  StaggerList,
} from "@masseurmatch/ui";
import Link from "next/link";

import { photoLimitFor } from "@/lib/cloudinary";
import { requireTherapist } from "@/lib/guards";
import { canSubmit, currentStep, STEP_LABELS } from "@/lib/onboarding";
import { getOrCreateMyProfile } from "@/lib/profile";
import { publicProfileUrl } from "@/lib/public-site";

import { SignOutButton } from "./sign-out-button";

/**
 * Dashboard home.
 *
 * Server component — the motion wrappers own their own client boundaries, so
 * nothing here is forced onto the client.
 *
 * Everything shown is read from the database. The previous version of this page
 * displayed invented figures ("1,284 profile views, +12% vs last week"); those
 * are gone rather than kept as placeholders, because a number on a dashboard
 * reads as a fact. Real analytics exist in `profile_view_analytics`, which the
 * therapist's own role cannot currently read — worth wiring up deliberately
 * rather than faking in the meantime.
 */

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const viewer = await requireTherapist("/");
  const { profile, photoCount, snapshot, status } = await getOrCreateMyProfile(viewer.user.id);

  const publicUrl = publicProfileUrl(profile);
  const complete = canSubmit(snapshot);
  const nextStep = currentStep(snapshot);
  const photoLimit = photoLimitFor(profile.subscription_tier, profile.photo_limit);
  const name = profile.display_name ?? profile.full_name ?? viewer.user.email ?? "there";

  const facts = [
    { label: "Profile status", value: PROFILE_STATUS_LABELS[status], note: null },
    {
      label: "Photos",
      value: `${photoCount} of ${photoLimit}`,
      note: photoCount === 0 ? "Add at least one to go live" : null,
    },
    {
      label: "Plan",
      value: (profile.subscription_tier ?? "Free").replace(/^\w/, (c) => c.toUpperCase()),
      note: null,
    },
  ];

  return (
    <PageTransition transitionKey="dashboard-home">
      <div className="mx-auto w-full max-w-5xl px-6 py-12">
        <FadeIn className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar size="xl" name={name} src={profile.avatar_url ?? undefined} />
            <div className="space-y-1">
              <h1 className="font-display text-ds-32 font-bold tracking-tight text-text-primary">
                Welcome back, {name}
              </h1>
              <p className="text-sm text-text-secondary">
                {complete
                  ? status === "approved"
                    ? "Your profile is live."
                    : "Your profile is complete and waiting for review."
                  : `Next step: ${STEP_LABELS[nextStep]}.`}
              </p>
            </div>
          </div>
          <SignOutButton />
        </FadeIn>

        <StaggerList className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {facts.map((fact) => (
            <StaggerItem key={fact.label}>
              <Card className="h-full">
                <CardHeader>
                  <CardDescription>{fact.label}</CardDescription>
                  <CardTitle className="font-stat text-ds-32">{fact.value}</CardTitle>
                </CardHeader>
                {fact.note ? (
                  <CardContent>
                    <p className="text-xs text-text-muted">{fact.note}</p>
                  </CardContent>
                ) : null}
              </Card>
            </StaggerItem>
          ))}
        </StaggerList>

        {viewer.role === "admin" ? (
          <FadeIn delay={0.08} className="mt-6">
            <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
              <p className="text-sm text-ink/70">
                You are signed in as an admin. This page shows your own therapist profile.
              </p>
              <Link href="/admin" className={buttonVariants({ variant: "outline", size: "sm" })}>
                Go to admin
              </Link>
            </Card>
          </FadeIn>
        ) : null}

        <FadeIn delay={0.12} className="mt-10 flex flex-wrap gap-3">
          {complete ? null : (
            <Link href="/onboarding" className={buttonVariants()}>
              Finish setup
            </Link>
          )}
          <Link
            href="/profile"
            className={buttonVariants({ variant: complete ? "primary" : "outline" })}
          >
            Edit profile
          </Link>
          <Link href="/subscription" className={buttonVariants({ variant: "outline" })}>
            Subscription
          </Link>
          {publicUrl ? (
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "ghost" })}
            >
              View public page ↗
            </a>
          ) : null}
        </FadeIn>
      </div>
    </PageTransition>
  );
}
