import {
  accessTo,
  cheapestTierWith,
  featureById,
  formatPrice,
  planFor,
  PLANS,
} from "@masseurmatch/billing";
import {
  availableNowLapsed,
  availableNowRemaining,
  isAvailableNow,
} from "@masseurmatch/db/available-now";
import { scoreProfile } from "@masseurmatch/db/profile-score";
import { PROFILE_STATUS_LABELS } from "@masseurmatch/db/profile-status";
import { spikeBlockedMessage } from "@masseurmatch/db/spikes";
import { resolveTier } from "@masseurmatch/db/tier-grants";
import { parseTravelSchedule } from "@masseurmatch/db/travel";
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

import { photoLimitForProfile } from "@/lib/cloudinary";
import { requireTherapist } from "@/lib/guards";
import { canSubmit, currentStep, STEP_LABELS } from "@/lib/onboarding";
import { getOrCreateMyProfile } from "@/lib/profile";
import { publicProfileUrl } from "@/lib/public-site";
import { ANALYTICS_WINDOW_DAYS, getMyViewAnalytics } from "@/lib/analytics";
import { getSpikeStatus } from "@/lib/spikes";

import { AnalyticsCard } from "./analytics-card";
import { AvailableNowCard } from "./available-now-card";
import { ProfileScoreCard } from "./profile-score-card";
import { SignOutButton } from "./sign-out-button";
import { SpikeCard } from "./spike-card";
import { TravelCard } from "./travel-card";

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
  const photoLimit = photoLimitForProfile(profile);
  const spikeProfile = {
    id: profile.id,
    subscription_tier: profile.subscription_tier,
    subscription_status: profile.subscription_status,
    tier_granted_until:
      (profile as { tier_granted_until?: string | null }).tier_granted_until ?? null,
    spike_until: (profile as { spike_until?: string | null }).spike_until ?? null,
  };
  const [spikes, viewStats] = await Promise.all([
    getSpikeStatus(spikeProfile),
    getMyViewAnalytics(profile.id),
  ]);

  // The entitled tier, read once. Everything below branches on this and never
  // on `subscription_tier`: a lapsed courtesy grant is Free.
  const tier = resolveTier(spikeProfile);
  const travelEntries = parseTravelSchedule(
    (profile as { travel_schedule?: unknown }).travel_schedule,
  );
  const tourTier = cheapestTierWith("tour-pages");

  const availability = {
    available_now: (profile as { available_now?: boolean | null }).available_now ?? null,
    available_now_expires:
      (profile as { available_now_expires?: string | null }).available_now_expires ?? null,
  };
  const availableTier = cheapestTierWith("available-now");

  // What the therapist is entitled to comes from the entitlement table, not
  // from `spikesPerMonth === 0`. The two agree today, and inferring it from the
  // number is how they stop agreeing: a tier with an allowance of zero that is
  // nonetheless meant to preview the tool would silently render as a dead
  // counter. The table is the contract; this reads it.
  const spikeAccess = accessTo("visibility-spikes", tier);
  const spikeUpgradeTier = cheapestTierWith("visibility-spikes");
  const spikeUpgrade = spikeUpgradeTier
    ? { name: PLANS[spikeUpgradeTier].name, price: formatPrice(PLANS[spikeUpgradeTier]) }
    : null;

  // Derived on every read rather than stored. `profiles` already carries four
  // columns claiming to be this number and nothing computes any of them; see
  // packages/db/profile-score.ts. The photo allowance is passed in because the
  // db package must not reach into billing.
  const score = scoreProfile({
    headline: profile.headline,
    bio: profile.bio,
    service_categories: profile.service_categories,
    incall_price: profile.incall_price,
    outcall_price: profile.outcall_price,
    photoCount,
    photoLimit,
  });
  const name = profile.display_name ?? profile.full_name ?? viewer.user.email ?? "there";

  const facts = [
    { label: "Profile status", value: PROFILE_STATUS_LABELS[status], note: null },
    {
      label: "Photos",
      value: `${photoCount} of ${photoLimit}`,
      note: photoCount === 0 ? "Add at least one to go live" : null,
    },
    {
      // The entitled tier, not the raw column. Capitalising
      // `subscription_tier` would show "Elite" to someone whose courtesy grant
      // has lapsed, while every tool on this page already treats them as Free —
      // and a plan label that disagrees with what the plan does is worse than
      // no label. It also renders whatever junk the free-text column holds.
      label: "Plan",
      value: planFor(tier).name,
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

        {/* Score first: it is what makes a listing work at all, and a Spike on a
            thin profile just shows more people a thin profile. Side by side on
            wide screens so the page does not become a column of cards. */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Held back until onboarding is done. Someone still filling in the
              basics already has one instruction on this page — "Next step:
              About you" — and answering it with a second, lower number is
              piling on. Onboarding guides until the profile can be submitted;
              the score guides after. */}
          {complete ? <ProfileScoreCard score={score} /> : null}
          <AnalyticsCard stats={viewStats} windowDays={ANALYTICS_WINDOW_DAYS} />
          <SpikeCard
            access={spikeAccess}
            previewNote={featureById("visibility-spikes")?.previewNote ?? null}
            upgrade={spikeUpgrade}
            remaining={spikes.remaining}
            perMonth={spikes.perMonth}
            activeUntil={spikes.activeUntil}
            canSpend={spikes.canSpend}
            blockedMessage={spikeBlockedMessage(spikes.blockedBecause)}
            available={spikes.available}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AvailableNowCard
            access={accessTo("available-now", tier)}
            previewNote={featureById("available-now")?.previewNote ?? null}
            upgrade={
              availableTier
                ? { name: PLANS[availableTier].name, price: formatPrice(PLANS[availableTier]) }
                : null
            }
            active={isAvailableNow(availability)}
            remaining={availableNowRemaining(availability)}
            hours={planFor(tier).availableNowHours}
            lapsed={availableNowLapsed(availability)}
          />
          <TravelCard
            entries={travelEntries}
            canHaveTourPage={accessTo("tour-pages", tier) === "full"}
            previewNote={featureById("tour-pages")?.previewNote ?? null}
            upgrade={
              tourTier ? { name: PLANS[tourTier].name, price: formatPrice(PLANS[tourTier]) } : null
            }
          />
        </div>

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
