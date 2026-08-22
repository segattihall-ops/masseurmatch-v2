import { scoreSummary } from "@masseurmatch/db/profile-score";
import {
  BarChart3,
  Bell,
  Car,
  Eye,
  EyeOff,
  Image as ImageIcon,
  LifeBuoy,
  Plane,
  Radar,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

import { AiCoachBanner } from "@/components/pro/ai-coach-banner";
import { MetricCard } from "@/components/pro/metric-card";
import { PageHeader } from "@/components/pro/page-header";
import { QuickActions } from "@/components/pro/quick-actions";
import { ToggleActionButton } from "@/components/pro/toggle-action-button";
import { ToggleCard, ToggleCardLink } from "@/components/pro/toggle-card";
import { ANALYTICS_WINDOW_DAYS } from "@/lib/analytics";
import { requireTherapist } from "@/lib/guards";
import { getProDashboard, LONG_WINDOW_DAYS } from "@/lib/pro-dashboard";

import { toggleAvailableNow, toggleVisibility } from "../actions";

export const metadata = { title: "Dashboard | MasseurMatch" };
export const dynamic = "force-dynamic";

/**
 * The Pro dashboard home.
 *
 * ---------------------------------------------------------------------------
 * Rendered on the server, not fetched from the browser
 * ---------------------------------------------------------------------------
 * This was a client component that loaded `/api/pro/growth` in an effect. Three
 * things came with that shape and none of them were wanted:
 *
 *   1. The route hard-coded `null` for the AI profile score and the local
 *      demand score, so two of the six cards had never once shown a number.
 *      Both are computed by `getProDashboard`, which already existed and which
 *      only the Trust page was calling.
 *   2. Every visit began with a spinner over an empty screen while a second
 *      round trip fetched what the server had already authenticated for.
 *   3. Its `useToast` was a `window.alert`. A modal browser dialog to confirm a
 *      badge toggle is bad on a laptop and worse on a phone, where it takes the
 *      whole screen.
 *
 * The toggles are server actions now, so the answer arrives with the re-render
 * and is announced in the button's own live region rather than interrupting.
 *
 * ---------------------------------------------------------------------------
 * The completeness card is deliberately gone
 * ---------------------------------------------------------------------------
 * It read `profile_completeness` and labelled it "Production profile
 * completeness". That column is one of four rival completeness columns on
 * `profiles`, none of them computed by anything in this repository — see the
 * note at the top of `packages/db/profile-score.ts`. The profile score card
 * next to it is derived from the profile on every read and cannot disagree with
 * it, so showing both would be showing two answers to one question.
 */
export default async function ProDashboardPage() {
  const viewer = await requireTherapist("/pro/dashboard");
  const data = await getProDashboard(viewer.user.id);
  const { profile, score, toggles } = data;

  const displayName = profile.display_name || profile.full_name || "Your profile";
  const profileStatus = profile.profile_status ?? "draft";
  const approved = profileStatus === "approved";

  return (
    <>
      <PageHeader
        eyebrow="Provider dashboard"
        title={displayName}
        subtitle="Your listing, what it is doing, and the switches that change it."
        action={{
          href: "/pro/listing",
          label: "Edit listing",
          icon: <Settings className="h-4 w-4" aria-hidden />,
        }}
      />

      {approved ? null : (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong className="font-semibold">
            Profile status: {profileStatus.replace(/_/g, " ")}.
          </strong>{" "}
          Everything you save is kept, but your listing is not discoverable until a member of our
          team has approved it.
        </p>
      )}

      {toggles.visible ? null : (
        <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          Your profile is switched off and hidden from search. Available Now, travel dates and your
          outcall settings are all still saved.
        </p>
      )}

      <AiCoachBanner
        title={data.nextAction?.title ?? null}
        description={data.nextAction?.because ?? null}
      />

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <MetricCard
          label="Profile status"
          value={profileStatus.replace(/_/g, " ")}
          hint={toggles.visible ? "Visibility on" : "Visibility off"}
          href="/pro/approval-status"
          icon={<ShieldCheck className="h-4 w-4" />}
        />
        <MetricCard
          label="Profile score"
          value={`${score.total}/100`}
          hint={scoreSummary(score)}
          href="/pro/ai-coach"
          icon={<Sparkles className="h-4 w-4" />}
        />
        <MetricCard
          label={`Views · ${ANALYTICS_WINDOW_DAYS}d`}
          value={String(data.views.window)}
          hint={`${data.views.long} in the last ${LONG_WINDOW_DAYS} days`}
          href="/pro/analytics"
          icon={<BarChart3 className="h-4 w-4" />}
        />
        <MetricCard
          label={`Contacts · ${ANALYTICS_WINDOW_DAYS}d`}
          value={String(data.contacts.window)}
          hint={
            // No views means no denominator. `0%` would read as "nobody ever
            // contacts you", which is a different and much worse claim.
            data.contacts.rate === null
              ? "Needs views before there is a rate"
              : `${data.contacts.rate.toFixed(1)}% of views`
          }
          href="/pro/analytics"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          label="Local demand"
          value={data.demand.score === null ? "—" : String(data.demand.score)}
          hint={
            data.demand.score === null
              ? "No reading for your city yet"
              : `Demand is ${data.demand.direction}`
          }
          href="/pro/demand-radar"
          icon={<Radar className="h-4 w-4" />}
        />
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Photos"
          value={`${data.photos.approved} approved`}
          hint={`${data.photos.pending} pending · ${data.photos.rejected} rejected`}
          href="/pro/photos"
          icon={<ImageIcon className="h-4 w-4" />}
        />
        <MetricCard
          label="Identity"
          value={(data.identity ?? "not started").replace(/_/g, " ")}
          hint="Latest verification attempt"
          href="/pro/trust"
          icon={<ShieldCheck className="h-4 w-4" />}
        />
        <MetricCard
          label="Support"
          value={String(data.openTickets)}
          hint="Tickets still open"
          href="/pro/tickets"
          icon={<LifeBuoy className="h-4 w-4" />}
        />
        <MetricCard
          label="Notifications"
          value={String(data.unreadNotifications)}
          hint="Unread"
          href="/pro/notifications"
          icon={<Bell className="h-4 w-4" />}
        />
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <ToggleCard
          title="Available Now"
          description="A short live badge saying you can take someone today. It can run at the same time as travel and outcall."
          icon={<Zap className="h-4 w-4" />}
          state={toggles.availableNow}
        >
          <ToggleActionButton
            action={toggleAvailableNow.bind(null, !toggles.availableNow)}
            label={toggles.availableNow ? "Turn off live badge" : "Activate Available Now"}
            variant={toggles.availableNow ? "outline" : "primary"}
            icon={<Zap className="h-4 w-4" aria-hidden />}
          />
        </ToggleCard>

        <ToggleCard
          title="Traveling"
          description="Travel dates put an approved listing into the destination city while you are there."
          icon={<Plane className="h-4 w-4" />}
          state={toggles.traveling}
        >
          <ToggleCardLink
            href="/pro/growth"
            label="Manage travel dates"
            icon={<Plane className="h-4 w-4" aria-hidden />}
          />
        </ToggleCard>

        <ToggleCard
          title="Mobile / outcall"
          description="Whether you travel to clients, and how far. Configured on your listing, not switched here."
          icon={<Car className="h-4 w-4" />}
          state={toggles.mobile}
        >
          <ToggleCardLink
            href="/pro/listing"
            label="Configure outcall"
            icon={<Car className="h-4 w-4" aria-hidden />}
          />
        </ToggleCard>

        <ToggleCard
          title="Profile visibility"
          description="Your own switch. Separate from approval — turning it off does not withdraw you from review."
          icon={toggles.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          state={toggles.visible}
        >
          <ToggleActionButton
            action={toggleVisibility.bind(null, !toggles.visible)}
            label={toggles.visible ? "Turn profile OFF" : "Turn profile ON"}
            variant={toggles.visible ? "outline" : "primary"}
            icon={
              toggles.visible ? (
                <EyeOff className="h-4 w-4" aria-hidden />
              ) : (
                <Eye className="h-4 w-4" aria-hidden />
              )
            }
          />
        </ToggleCard>
      </div>

      <QuickActions />
    </>
  );
}
