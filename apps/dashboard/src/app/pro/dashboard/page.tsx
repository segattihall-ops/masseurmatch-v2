"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  Camera,
  Car,
  Eye,
  EyeOff,
  LifeBuoy,
  Loader2,
  Plane,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

import { Button, buttonVariants } from "@masseurmatch/ui";

interface Toast {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

function useToast() {
  return {
    toast: (message: Toast) => {
      console.log(message);
      if (typeof window !== "undefined") {
        alert(message.description || message.title);
      }
    },
  };
}

type TravelEntry = { city?: string; state?: string; start_date?: string; end_date?: string };
type DashboardProfile = {
  id?: string;
  display_name?: string | null;
  full_name?: string | null;
  city?: string | null;
  subscription_tier?: string | null;
  available_now?: boolean | null;
  available_now_expires?: string | null;
  travel_schedule?: unknown;
  visibility_status?: string | null;
  profile_status?: string | null;
  profile_completion_score?: number | null;
  profile_views?: number | null;
  is_active?: boolean | null;
};

type AiSnapshot = {
  profile_score?: number | null;
  visibility_score?: number | null;
  profile_views_7d?: number | null;
  profile_views_30d?: number | null;
  contact_clicks_7d?: number | null;
  contact_rate_pct?: number | null;
  local_demand_score?: number | null;
  local_demand_trend?: string | null;
  strongest_keyword?: string | null;
  top_recommendation_title?: string | null;
  top_recommendation_action?: string | null;
};

type DashboardInsights = {
  ai?: AiSnapshot | null;
  photos?: { approved: number; pending: number; rejected: number };
  identityStatus?: string;
  supportOpen?: number;
  unreadNotifications?: number;
};

type GrowthResponse = {
  ok: boolean;
  profile: DashboardProfile;
  insights?: DashboardInsights;
};

function normalizeTravel(value: unknown): TravelEntry[] {
  return Array.isArray(value) ? (value.filter((item) => item && typeof item === "object") as TravelEntry[]) : [];
}

function isTravelCurrentOrUpcoming(trips: TravelEntry[]) {
  const today = new Date().toISOString().slice(0, 10);
  return trips.some((trip) => Boolean(trip.city && trip.end_date && trip.end_date >= today));
}

function StatusCard({
  title,
  description,
  icon: Icon,
  active,
  children,
}: {
  title: string;
  description: string;
  icon: typeof Zap;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
          </div>
        </div>
        {typeof active === "boolean" ? (
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
            {active ? "ON" : "OFF"}
          </span>
        ) : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function MetricCard({ label, value, detail, icon: Icon, href }: { label: string; value: string; detail: string; icon: typeof Zap; href?: string }) {
  const body = (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
        </div>
        <Icon className="h-5 w-5 text-slate-400" />
      </div>
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export default function ProDashboardPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<DashboardProfile | null>(null);
  const [insights, setInsights] = useState<DashboardInsights>({});
  const [saving, setSaving] = useState<string | null>(null);

  async function refresh() {
    const response = await fetch("/api/pro/growth");
    if (!response.ok) throw new Error("Failed to load dashboard");
    const data = (await response.json()) as GrowthResponse;
    setProfile(data.profile);
    setInsights(data.insights || {});
  }

  useEffect(() => {
    refresh()
      .catch((error) =>
        toast({
          title: "Could not load dashboard",
          description: error instanceof Error ? error.message : "Try again.",
          variant: "destructive",
        })
      )
      .finally(() => setLoading(false));
  }, [toast]);

  const trips = useMemo(() => normalizeTravel(profile?.travel_schedule), [profile?.travel_schedule]);
  const traveling = isTravelCurrentOrUpcoming(trips);
  const availableNow = Boolean(
    profile?.available_now && (!profile.available_now_expires || new Date(profile.available_now_expires).getTime() > Date.now())
  );
  const visible = profile?.is_active !== false && profile?.visibility_status !== "hidden";
  const displayName = profile?.display_name || profile?.full_name || "Your profile";
  const profileStatus = profile?.profile_status || "draft";
  const approved = profileStatus === "approved";
  const ai = insights.ai;

  async function toggleAvailableNow() {
    setSaving("available");
    try {
      const response = await fetch("/api/pro/available-now", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activate: !availableNow }),
      });
      if (!response.ok) throw new Error("Failed to update");
      await refresh();
      toast({ title: availableNow ? "Available Now turned off" : "Available Now activated" });
    } catch (error) {
      toast({
        title: "Could not update Available Now",
        description: error instanceof Error ? error.message : "Try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  }

  async function toggleVisibility() {
    setSaving("visibility");
    try {
      const response = await fetch("/api/pro/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: visible ? "hidden" : "available" }),
      });
      if (!response.ok) throw new Error("Failed to update");
      await refresh();
      toast({ title: visible ? "Profile hidden" : "Profile visible" });
    } catch (error) {
      toast({
        title: "Could not update profile visibility",
        description: error instanceof Error ? error.message : "Try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  }

  if (loading)
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
      </div>
    );

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 pb-28 md:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Provider dashboard</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-slate-900">{displayName}</h1>
          <p className="mt-1 text-sm text-slate-500">Live profile, visibility, growth and trust signals from your account.</p>
        </div>
        <Link href="/pro/listing" className={buttonVariants({ variant: "outline" })}>
          <Settings className="mr-2 h-4 w-4" />
          Edit listing
        </Link>
      </header>

      {!approved ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Profile status: {profileStatus}.</strong> Your data remains saved, but public directory discovery requires an approved profile.
        </div>
      ) : null}

      {!visible ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          Your profile is OFF and hidden from public discovery. Available Now, travel and mobile settings remain saved.
        </div>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <MetricCard label="Profile status" value={profileStatus.replace(/_/g, " ")} detail={visible ? "Visibility enabled" : "Visibility hidden"} icon={ShieldCheck} href="/pro/approval-status" />
        <MetricCard label="AI profile score" value={ai?.profile_score != null ? `${ai.profile_score}/100` : "—"} detail={ai?.top_recommendation_title || "Open AI Coach to generate a score"} icon={Sparkles} href="/pro/ai-coach" />
        <MetricCard label="Views · 7 days" value={String(ai?.profile_views_7d ?? 0)} detail={`${ai?.profile_views_30d ?? profile?.profile_views ?? 0} in 30 days`} icon={BarChart3} href="/pro/analytics" />
        <MetricCard label="Contact clicks · 7d" value={String(ai?.contact_clicks_7d ?? 0)} detail={ai?.contact_rate_pct != null ? `${Number(ai.contact_rate_pct).toFixed(1)}% contact rate` : "Contact activity"} icon={TrendingUp} href="/pro/analytics" />
        <MetricCard label="Local demand" value={ai?.local_demand_score != null ? String(ai.local_demand_score) : "—"} detail={ai?.local_demand_trend || ai?.strongest_keyword || "Demand Radar data"} icon={TrendingUp} href="/pro/demand-radar" />
        <MetricCard label="Profile completion" value={profile?.profile_completion_score != null ? `${profile.profile_completion_score}%` : "—"} detail="Production profile completeness" icon={Settings} href="/pro/listing" />
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Photos" value={`${insights.photos?.approved ?? 0} approved`} detail={`${insights.photos?.pending ?? 0} pending · ${insights.photos?.rejected ?? 0} rejected`} icon={Camera} href="/pro/photos" />
        <MetricCard label="Identity" value={(insights.identityStatus || "not_started").replace(/_/g, " ")} detail="Latest verification state" icon={ShieldCheck} />
        <MetricCard label="Support" value={String(insights.supportOpen ?? 0)} detail="Open or in progress tickets" icon={LifeBuoy} />
        <MetricCard label="Notifications" value={String(insights.unreadNotifications ?? 0)} detail="Unread account notifications" icon={Bell} />
      </section>

      {ai?.top_recommendation_action ? (
        <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">AI Coach next action</p>
          <h2 className="mt-2 font-semibold text-indigo-950">{ai.top_recommendation_title || "Improve your profile"}</h2>
          <p className="mt-1 text-sm leading-6 text-indigo-800">{ai.top_recommendation_action}</p>
          <Link href="/pro/ai-coach" className={buttonVariants({ size: "sm", variant: "primary" }) + " mt-4"}>Open AI Coach</Link>
        </section>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <StatusCard icon={Zap} title="Available Now" active={availableNow} description="Temporary live badge. This can be active at the same time as travel and mobile service.">
          <Button onClick={toggleAvailableNow} disabled={saving === "available"}>
            {saving === "available" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
            {availableNow ? "Turn off live badge" : "Activate Available Now"}
          </Button>
        </StatusCard>

        <StatusCard icon={Plane} title="Traveling" active={traveling} description="Travel dates surface approved profiles in destination city discovery.">
          <Link href="/pro/growth" className={buttonVariants({ variant: "outline" })}>
            <Plane className="mr-2 h-4 w-4" />
            Manage travel dates
          </Link>
        </StatusCard>

        <StatusCard icon={Car} title="Mobile / Outcall" description="Configure outcall service and radius separately from Available Now and travel.">
          <Link href="/pro/listing" className={buttonVariants({ variant: "outline" })}>
            <Car className="mr-2 h-4 w-4" />
            Configure mobile service
          </Link>
        </StatusCard>

        <StatusCard icon={visible ? Eye : EyeOff} title="Profile visibility" active={visible} description="Visibility controls discovery, while approval remains a separate trust state.">
          <Button variant={visible ? "outline" : "primary"} onClick={toggleVisibility} disabled={saving === "visibility"}>
            {saving === "visibility" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : visible ? (
              <EyeOff className="mr-2 h-4 w-4" />
            ) : (
              <Eye className="mr-2 h-4 w-4" />
            )}
            {visible ? "Turn profile OFF" : "Turn profile ON"}
          </Button>
        </StatusCard>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-display text-base font-semibold text-slate-900">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/pro/listing" className={buttonVariants({ variant: "outline" })}>Profile & pricing</Link>
          <Link href="/pro/growth" className={buttonVariants({ variant: "outline" })}>Travel & specials</Link>
          <Link href="/pro/photos" className={buttonVariants({ variant: "outline" })}>Photos</Link>
          <Link href="/pro/analytics" className={buttonVariants({ variant: "outline" })}>Analytics</Link>
          <Link href="/pro/ai-coach" className={buttonVariants({ variant: "outline" })}>AI Coach</Link>
          <Link href="/pro/subscription" className={buttonVariants({ variant: "outline" })}>Subscription</Link>
        </div>
      </section>
    </main>
  );
}
