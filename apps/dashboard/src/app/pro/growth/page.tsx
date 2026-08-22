import { availableUntil, isAvailableNow } from "@masseurmatch/db/available-now";
import { spikeBlockedMessage } from "@masseurmatch/db/spikes";
import { parseTravelSchedule } from "@masseurmatch/db/travel";
import { resolveTier } from "@masseurmatch/db/tier-grants";
import { Plane, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";

import { SpikeCard } from "@/app/spike-card";
import { TravelCard } from "@/app/travel-card";
import { PageHeader } from "@/components/pro/page-header";
import { Section } from "@/components/pro/section";
import { ToggleActionButton } from "@/components/pro/toggle-action-button";
import { ToggleCard } from "@/components/pro/toggle-card";
import { entitlementFor } from "@/lib/entitlements";
import { requireTherapist } from "@/lib/guards";
import { getOrCreateMyProfile } from "@/lib/profile";
import { getSpikeStatus } from "@/lib/spikes";

import { toggleAvailableNow } from "../actions";

export const metadata = { title: "Growth Tools | MasseurMatch" };
export const dynamic = "force-dynamic";

/**
 * The three things a therapist can do to be seen more.
 *
 * ---------------------------------------------------------------------------
 * What was here before
 * ---------------------------------------------------------------------------
 * A second copy of `/pro/analytics` — the same view counts, in a different
 * layout — followed by four hard-coded "Tips to Increase Your Views" cards,
 * one of which claimed "therapists with complete profiles get 70% more views".
 * That figure has nothing behind it; it is the same invented statistic that was
 * on the AI Coach page.
 *
 * Worse, it had no travel controls at all, while the sidebar called it "Growth
 * Tools", the dashboard's travel card linked here with "Manage travel dates",
 * and the quick-action bar called it "Travel & specials". Three routes into a
 * page that could not do the thing all three named.
 *
 * So it is now the tools: Available Now, the travel schedule, and Spikes. The
 * numbers stay on Analytics, which is the page that owns them.
 *
 * `TravelCard` and `SpikeCard` already existed and were rendered by nothing —
 * they were written for a dashboard home that was replaced before they landed.
 * They carry the real actions, the real validation and the real entitlement
 * notes, so this page mounts them rather than growing a second pair.
 */
export default async function ProGrowthPage() {
  const viewer = await requireTherapist("/pro/growth");
  const { profile } = await getOrCreateMyProfile(viewer.user.id);

  const now = new Date();
  const tier = resolveTier(profile, now);

  const badge = entitlementFor("available-now", tier);
  const tours = entitlementFor("tour-pages", tier);
  const spikes = entitlementFor("visibility-spikes", tier);

  const trips = parseTravelSchedule(profile.travel_schedule);
  const live = isAvailableNow(profile, now);
  const until = availableUntil(profile, now);

  const spike = await getSpikeStatus(
    {
      id: profile.id,
      subscription_tier: profile.subscription_tier,
      subscription_status: profile.subscription_status,
      // Not a column in the generated types yet — see the note on
      // `PROFILE_COLUMNS`. Absent means no grant, which is the safe reading.
      tier_granted_until: null,
      spike_until: profile.spike_until,
    },
    now,
  );

  return (
    <>
      <PageHeader
        eyebrow="Provider dashboard"
        title="Growth tools"
        subtitle="Three ways to be seen by more people this week."
        action={{
          href: "/pro/analytics",
          label: "See the numbers",
          icon: <TrendingUp className="h-4 w-4" aria-hidden />,
        }}
      />

      <ToggleCard
        title="Available Now"
        description={
          live && until
            ? `Live until ${until.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}. Clients browsing your city see the badge on your card.`
            : "A short live badge saying you can take someone today. It runs alongside travel and outcall, not instead of them."
        }
        icon={<Zap className="h-4 w-4" />}
        state={live}
      >
        {badge.access === "full" ? (
          <ToggleActionButton
            action={toggleAvailableNow.bind(null, !live)}
            label={live ? "Turn off live badge" : "Activate Available Now"}
            variant={live ? "outline" : "primary"}
            icon={<Zap className="h-4 w-4" aria-hidden />}
          />
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{badge.previewNote}</p>
            {badge.upgrade ? (
              <Link
                href="/pro/subscription"
                className="inline-flex h-10 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                {badge.upgrade.name} is {badge.upgrade.price}/mo
              </Link>
            ) : null}
          </div>
        )}
      </ToggleCard>

      <TravelCard
        entries={trips}
        canHaveTourPage={tours.access === "full"}
        previewNote={tours.previewNote}
        upgrade={tours.upgrade}
      />

      <SpikeCard
        access={spikes.access}
        previewNote={spikes.previewNote}
        upgrade={spikes.upgrade}
        remaining={spike.remaining}
        perMonth={spike.perMonth}
        activeUntil={spike.activeUntil}
        canSpend={spike.canSpend}
        // The reason as a sentence, not as its code — `already-active` is
        // not something to print at a therapist.
        blockedMessage={spikeBlockedMessage(spike.blockedBecause)}
        available={spike.available}
      />

      {/* Last, and only a signpost. Everything above changes something; this
          says where to look at what changed. */}
      <Section title="Did it work?">
        <p className="text-sm text-muted-foreground">
          Views and contact clicks are on{" "}
          <Link href="/pro/analytics" className="underline underline-offset-4">
            Analytics
          </Link>
          , and what your city is searching for is on{" "}
          <Link href="/pro/demand-radar" className="underline underline-offset-4">
            Demand Radar
          </Link>
          . <Plane className="inline h-3.5 w-3.5 align-baseline" aria-hidden /> Trips only reach
          destination-city discovery once your profile is approved.
        </p>
      </Section>
    </>
  );
}
