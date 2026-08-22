import "server-only";

import { PLANS, type PlanId } from "@masseurmatch/billing";
import { createServiceClient } from "@masseurmatch/db/client";

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

function dollars(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export type AdminBillingSubscription = {
  id: string;
  profileId: string | null;
  profileName: string;
  email: string | null;
  plan: PlanId | "unknown";
  planLabel: string;
  advertisedPrice: string;
  status: string;
  provider: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
};

export type AdminBillingOverview = {
  active: number;
  trialing: number;
  pastDue: number;
  canceled: number;
  providerRows: number;
  billingEvents30Days: number;
  billingErrors30Days: number;
  subscriptions: AdminBillingSubscription[];
  recentEvents: Array<{
    id: string;
    kind: string;
    provider: string | null;
    occurredAt: string | null;
    error: string | null;
  }>;
};

export async function getAdminBillingOverview(): Promise<AdminBillingOverview> {
  const db = createServiceClient();
  const since30 = isoDaysAgo(30);

  const [plansResult, subscriptionsResult, eventsResult, eventCountResult, errorCountResult] =
    await Promise.all([
      db.from("subscription_plans").select("id,code"),
      db
        .from("therapist_subscriptions")
        .select(
          "id,profile_id,plan_id,status,provider,provider_subscription_id,current_period_end,cancel_at_period_end,created_at",
        )
        .order("created_at", { ascending: false })
        .limit(100),
      db
        .from("billing_events")
        .select("id,kind,provider,occurred_at,error")
        .order("occurred_at", { ascending: false })
        .limit(30),
      db
        .from("billing_events")
        .select("id", { count: "exact", head: true })
        .gte("occurred_at", since30),
      db
        .from("billing_events")
        .select("id", { count: "exact", head: true })
        .gte("occurred_at", since30)
        .not("error", "is", null),
    ]);

  if (plansResult.error)
    throw new Error(`Could not load billing plans: ${plansResult.error.message}`);
  if (subscriptionsResult.error) {
    throw new Error(`Could not load subscriptions: ${subscriptionsResult.error.message}`);
  }
  if (eventsResult.error)
    throw new Error(`Could not load billing events: ${eventsResult.error.message}`);
  if (eventCountResult.error) {
    throw new Error(`Could not count billing events: ${eventCountResult.error.message}`);
  }
  if (errorCountResult.error) {
    throw new Error(`Could not count billing errors: ${errorCountResult.error.message}`);
  }

  const planByUuid = new Map<string, PlanId>();
  for (const row of plansResult.data ?? []) {
    const code = row.code;
    if (code && Object.prototype.hasOwnProperty.call(PLANS, code)) {
      planByUuid.set(row.id, code as PlanId);
    }
  }

  const rawSubscriptions = subscriptionsResult.data ?? [];
  const profileIds = [
    ...new Set(
      rawSubscriptions.map((row) => row.profile_id).filter((id): id is string => Boolean(id)),
    ),
  ];

  const profiles = new Map<string, { name: string; email: string | null }>();
  if (profileIds.length > 0) {
    const { data, error } = await db
      .from("profiles")
      .select("id,display_name,full_name,email")
      .in("id", profileIds);
    if (error) throw new Error(`Could not load subscription profiles: ${error.message}`);
    for (const profile of data ?? []) {
      profiles.set(profile.id, {
        name: profile.display_name ?? profile.full_name ?? profile.email ?? "Unnamed provider",
        email: profile.email,
      });
    }
  }

  const subscriptions: AdminBillingSubscription[] = rawSubscriptions.map((row) => {
    const plan = row.plan_id ? (planByUuid.get(row.plan_id) ?? "unknown") : "unknown";
    const catalog = plan === "unknown" ? null : PLANS[plan];
    const profile = row.profile_id ? profiles.get(row.profile_id) : null;

    return {
      id: row.id,
      profileId: row.profile_id,
      profileName: profile?.name ?? "Unknown provider",
      email: profile?.email ?? null,
      plan,
      planLabel: catalog?.name ?? "Unknown plan",
      advertisedPrice: catalog ? dollars(catalog.priceCents) : "—",
      status: row.status ?? "none",
      provider: row.provider,
      currentPeriodEnd: row.current_period_end,
      cancelAtPeriodEnd: row.cancel_at_period_end ?? false,
      createdAt: row.created_at,
    };
  });

  const countStatus = (status: string) =>
    subscriptions.filter((row) => row.status === status).length;

  return {
    active: countStatus("active"),
    trialing: countStatus("trialing"),
    pastDue: countStatus("past_due"),
    canceled: countStatus("canceled"),
    providerRows: subscriptions.filter((row) => Boolean(row.provider)).length,
    billingEvents30Days: eventCountResult.count ?? 0,
    billingErrors30Days: errorCountResult.count ?? 0,
    subscriptions,
    recentEvents: (eventsResult.data ?? []).map((row) => ({
      id: row.id,
      kind: row.kind ?? "unknown",
      provider: row.provider,
      occurredAt: row.occurred_at,
      error: row.error,
    })),
  };
}

export type AdminAnalyticsOverview = {
  views7Days: number;
  views30Days: number;
  contacts7Days: number;
  contacts30Days: number;
  conversion7Days: number | null;
  conversion30Days: number | null;
  newProfiles30Days: number;
  approvedProfiles: number;
  topProfiles: Array<{
    id: string;
    name: string;
    city: string | null;
    state: string | null;
    views: number;
    contacts: number;
  }>;
};

export async function getAdminAnalyticsOverview(): Promise<AdminAnalyticsOverview> {
  const db = createServiceClient();
  const since7 = isoDaysAgo(7);
  const since30 = isoDaysAgo(30);

  const [views7, views30, contacts7, contacts30, newProfiles, approved, topResult] =
    await Promise.all([
      db
        .from("profile_view_analytics")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since7),
      db
        .from("profile_view_analytics")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since30),
      db
        .from("contact_events")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since7),
      db
        .from("contact_events")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since30),
      db.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", since30),
      db
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("profile_status", "approved"),
      db
        .from("profiles")
        .select(
          "id,display_name,full_name,email,city,state,profile_views,view_count,contact_clicks",
        )
        .eq("profile_status", "approved")
        .order("profile_views", { ascending: false, nullsFirst: false })
        .limit(12),
    ]);

  for (const result of [views7, views30, contacts7, contacts30, newProfiles, approved]) {
    if (result.error) throw new Error(`Could not load analytics: ${result.error.message}`);
  }
  if (topResult.error) throw new Error(`Could not load top profiles: ${topResult.error.message}`);

  const views7Days = views7.count ?? 0;
  const views30Days = views30.count ?? 0;
  const contacts7Days = contacts7.count ?? 0;
  const contacts30Days = contacts30.count ?? 0;

  return {
    views7Days,
    views30Days,
    contacts7Days,
    contacts30Days,
    conversion7Days: views7Days > 0 ? (contacts7Days / views7Days) * 100 : null,
    conversion30Days: views30Days > 0 ? (contacts30Days / views30Days) * 100 : null,
    newProfiles30Days: newProfiles.count ?? 0,
    approvedProfiles: approved.count ?? 0,
    topProfiles: (topResult.data ?? []).map((row) => ({
      id: row.id,
      name: row.display_name ?? row.full_name ?? row.email ?? "Unnamed provider",
      city: row.city,
      state: row.state,
      views: row.profile_views ?? row.view_count ?? 0,
      contacts: row.contact_clicks ?? 0,
    })),
  };
}
