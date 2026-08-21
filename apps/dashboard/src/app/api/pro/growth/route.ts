import { createSessionClient, getViewer } from "@masseurmatch/db/auth";
import { ANALYTICS_WINDOW_DAYS, getMyViewAnalytics } from "@/lib/analytics";
import { getOrCreateMyProfile } from "@/lib/profile";
import { getCityDemand } from "@/lib/demand";
import { scoreProfile, type ProfileScore } from "@masseurmatch/db/profile-score";
import { coachAdvice, type Advice } from "@masseurmatch/db/coach";
import { createServiceClient } from "@masseurmatch/db/client";

export const dynamic = "force-dynamic";

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

async function safe<T>(work: Promise<T>, fallback: T): Promise<T> {
  try {
    return await work;
  } catch {
    return fallback;
  }
}

export async function GET(): Promise<Response> {
  try {
    const viewer = await getViewer();
    if (!viewer) {
      return Response.json(
        { ok: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const userId = viewer.user.id;
    const session = createSessionClient();
    const service = createServiceClient();

    // Get profile
    const { profile } = await getOrCreateMyProfile(userId);

    // Get AI score and advice
    const score = await safe(
      scoreProfile(userId) as Promise<ProfileScore>,
      { profile_score: 0 } as ProfileScore
    );
    const advice = await safe(
      coachAdvice(userId) as Promise<Advice | null>,
      null
    );

    // Get analytics
    const analytics = await safe(getMyViewAnalytics(profile.id), {
      available: false,
      total: 0,
      people: 0,
      previous: 0,
      topSources: [],
      topPlaces: [],
      trend: "neutral",
    });

    // Get contact clicks (from service client for IP protection)
    const contactResult = await safe(
      service
        .from("contact_events")
        .select("id")
        .eq("profile_id", profile.id)
        .gte(
          "created_at",
          new Date(Date.now() - ANALYTICS_WINDOW_DAYS * 24 * 60 * 60 * 1000)
            .toISOString()
        ),
      { data: [] as any[], error: null }
    );
    const contactClicks = contactResult.error ? 0 : (contactResult.data?.length ?? 0);

    // Calculate contact rate
    let contactRate: number | null = null;
    if (analytics.available && analytics.total > 0) {
      contactRate = (contactClicks / analytics.total) * 100;
    }

    // Get demand
    const demand = await safe(getCityDemand(profile.city || ""), {
      score: null,
      direction: "",
    });

    // Get photos
    const { data: photos, error: photoError } = await safe(
      session
        .from("profile_photos")
        .select("moderation_status")
        .eq("profile_id", profile.id),
      { data: [] as any[] }
    );

    const photoCounts = {
      approved: photoError ? 0 : photos?.filter((p) => p.moderation_status === "approved").length ?? 0,
      pending: photoError ? 0 : photos?.filter((p) => p.moderation_status === "pending").length ?? 0,
      rejected: photoError ? 0 : photos?.filter((p) => p.moderation_status === "rejected").length ?? 0,
    };

    // Get identity status
    const { data: identity, error: identityError } = await safe(
      session
        .from("identity_verifications")
        .select("status")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
      { data: null }
    );
    const identityStatus = identityError ? "not_started" : identity?.status ?? "not_started";

    // Get support tickets
    const { data: tickets, error: ticketError } = await safe(
      session
        .from("support_tickets")
        .select("id")
        .eq("user_id", userId)
        .in("status", ["open", "in_progress", "pending", "awaiting_response"]),
      { data: [] as any[] }
    );
    const supportOpen = ticketError ? 0 : tickets?.length ?? 0;

    // Get notifications
    const { data: notifs, error: notifError } = await safe(
      session
        .from("notifications")
        .select("id")
        .eq("user_id", userId)
        .eq("is_read", false),
      { data: [] as any[] }
    );
    const unreadNotifications = notifError ? 0 : notifs?.length ?? 0;

    const dashboardProfile: DashboardProfile = {
      id: profile.id,
      display_name: profile.display_name,
      full_name: profile.full_name,
      city: profile.city,
      subscription_tier: profile.subscription_tier,
      available_now: profile.available_now,
      available_now_expires: profile.available_now_expires,
      travel_schedule: profile.travel_schedule,
      visibility_status: profile.visibility_status,
      profile_status: profile.profile_status,
      profile_completion_score: profile.profile_completion_score,
      profile_views: analytics.total,
      is_active: profile.visibility_status !== "hidden",
    };

    const aiSnapshot: AiSnapshot = {
      profile_score: score?.profile_score ?? null,
      visibility_score: score?.visibility_score ?? null,
      profile_views_7d: analytics.total,
      profile_views_30d: analytics.previous + analytics.total,
      contact_clicks_7d: contactClicks,
      contact_rate_pct: contactRate,
      local_demand_score: demand?.score ?? null,
      local_demand_trend: demand?.direction ?? null,
      strongest_keyword: null,
      top_recommendation_title: advice?.title ?? null,
      top_recommendation_action: advice?.action ?? null,
    };

    const insights: DashboardInsights = {
      ai: aiSnapshot,
      photos: photoCounts,
      identityStatus,
      supportOpen,
      unreadNotifications,
    };

    const response: GrowthResponse = {
      ok: true,
      profile: dashboardProfile,
      insights,
    };

    return Response.json(response);
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to load dashboard",
      },
      { status: 500 }
    );
  }
}
