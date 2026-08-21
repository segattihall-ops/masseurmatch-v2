import {
  BarChart3,
  Bell,
  Camera,
  Car,
  Eye,
  EyeOff,
  LifeBuoy,
  Plane,
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
import { requireTherapist } from "@/lib/guards";
import { ANALYTICS_WINDOW_DAYS } from "@/lib/analytics";
import { getProDashboard, LONG_WINDOW_DAYS } from "@/lib/pro-dashboard";

import { toggleAvailableNow, toggleVisibility } from "./actions";

export const metadata = { title: "Pro Dashboard | MasseurMatch" };

/** Live numbers, so a cached page cannot tell someone they are hidden when they are not. */
export const dynamic = "force-dynamic";

const ICON = "h-4 w-4";

export default async function ProDashboardPage() {
  const viewer = await requireTherapist("/pro");
  const data = await getProDashboard(viewer.user.id);

  const { photos, toggles } = data;

  return (
    <>
      <PageHeader
        eyebrow="Provider dashboard"
        title="Your profile"
        subtitle="Live profile, visibility, growth and trust signals from your account."
        action={{
          href: "/pro/listing",
          label: "Edit listing",
          icon: <Settings className={ICON} aria-hidden />,
        }}
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Profile status"
          value={data.profile.profile_status ?? "draft"}
          hint={toggles.visible ? "Visibility enabled" : "Visibility off"}
          href="/pro/approval-status"
          icon={<ShieldCheck className={ICON} />}
        />

        <MetricCard
          label="AI profile score"
          value={`${data.score.total}/100`}
          hint={data.score.todo[0]?.action ?? "Nothing left to improve"}
          href="/pro/ai-coach"
          icon={<Sparkles className={ICON} />}
        />

        <MetricCard
          label={`Views · ${ANALYTICS_WINDOW_DAYS} days`}
          value={String(data.views.window)}
          hint={`${data.views.long} in ${LONG_WINDOW_DAYS} days`}
          href="/pro/analytics"
          icon={<BarChart3 className={ICON} />}
        />

        <MetricCard
          label={`Contact clicks · ${ANALYTICS_WINDOW_DAYS}d`}
          value={String(data.contacts.window)}
          hint={
            data.contacts.rate === null
              ? "No views to measure against yet"
              : `${data.contacts.rate.toFixed(1)}% contact rate`
          }
          href="/pro/analytics"
          icon={<TrendingUp className={ICON} />}
        />

        <MetricCard
          label="Local demand"
          value={data.demand.score === null ? "—" : String(data.demand.score)}
          hint={data.demand.score === null ? "No reading for your city yet" : data.demand.direction}
          href="/pro/demand-radar"
          icon={<TrendingUp className={ICON} />}
        />

        {/* "—", never "0%". A completeness figure production has not computed is
            not the same as a profile that scored nothing. */}
        <MetricCard
          label="Profile completion"
          value={data.completion === null ? "—" : `${Math.round(data.completion)}%`}
          hint="Production profile completeness"
          href="/pro/listing"
          icon={<Settings className={ICON} />}
        />

        <MetricCard
          label="Photos"
          value={`${photos.approved} approved`}
          hint={`${photos.pending} pending · ${photos.rejected} rejected`}
          href="/pro/photos"
          icon={<Camera className={ICON} />}
        />

        <MetricCard
          label="Identity"
          value={data.identity ?? "not started"}
          hint="Latest verification state"
          href="/pro/approval-status"
          icon={<ShieldCheck className={ICON} />}
        />

        <MetricCard
          label="Support"
          value={String(data.openTickets)}
          hint="Open or in progress tickets"
          href="/pro/tickets"
          icon={<LifeBuoy className={ICON} />}
        />

        <MetricCard
          label="Notifications"
          value={String(data.unreadNotifications)}
          hint="Unread account notifications"
          href="/pro/notifications"
          icon={<Bell className={ICON} />}
        />
      </section>

      <AiCoachBanner
        title={data.nextAction?.title ?? null}
        description={data.nextAction?.because ?? null}
        href={data.nextAction?.href ?? "/pro/ai-coach"}
      />

      <section className="grid gap-3 lg:grid-cols-2">
        <ToggleCard
          title="Available Now"
          icon={<Zap className={ICON} />}
          state={toggles.availableNow}
          description="Temporary live badge. This can be active at the same time as travel and mobile service."
        >
          <ToggleActionButton
            action={toggleAvailableNow.bind(null, !toggles.availableNow)}
            label={toggles.availableNow ? "Turn Available Now off" : "Activate Available Now"}
            variant={toggles.availableNow ? "outline" : "primary"}
          />
        </ToggleCard>

        <ToggleCard
          title="Traveling"
          icon={<Plane className={ICON} />}
          state={toggles.traveling}
          description="Travel dates surface approved profiles in destination city discovery."
        >
          <ToggleCardLink href="/pro/travel" label="Manage travel dates" />
        </ToggleCard>

        <ToggleCard
          title="Mobile / Outcall"
          icon={<Car className={ICON} />}
          state={toggles.mobile}
          description="Configure outcall service and radius separately from Available Now and travel."
        >
          <ToggleCardLink href="/pro/travel" label="Configure mobile service" />
        </ToggleCard>

        <ToggleCard
          title="Profile visibility"
          icon={<Eye className={ICON} />}
          state={toggles.visible}
          description="Visibility controls discovery, while approval remains a separate trust state."
        >
          <ToggleActionButton
            action={toggleVisibility.bind(null, !toggles.visible)}
            label={toggles.visible ? "Turn profile OFF" : "Turn profile ON"}
            variant="outline"
            icon={
              toggles.visible ? (
                <EyeOff className={ICON} aria-hidden />
              ) : (
                <Eye className={ICON} aria-hidden />
              )
            }
          />
        </ToggleCard>
      </section>

      <QuickActions />
    </>
  );
}
