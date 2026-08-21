import { createSessionClient, getViewer } from "@masseurmatch/db/auth";
import { ANALYTICS_WINDOW_DAYS, getMyViewAnalytics, type ProfileAnalytics } from "@/lib/analytics";
import { getOrCreateMyProfile } from "@/lib/profile";
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

    // Get analytics
    let analytics: ProfileAnalytics = {
      available: false,
      total: 0,
      people: 0,
      previous: 0,
      topSources: [],
      topPlaces: [],
      trend: { kind: "too-early" },
    };
    try {
      analytics = await getMyViewAnalytics(profile.id);
    } catch (e) {
      console.error("Analytics fetch error:", e);
    }

    // Get contact clicks (from service client for IP protection)
    let contactClicks = 0;
    try {
      const { data } = await service
        .from("contact_events")
        .select("id")
        .eq("profile_id", profile.id)
        .gte(
          "created_at",
          new Date(Date.now() - ANALYTICS_WINDOW_DAYS * 24 * 60 * 60 * 1000)
            .toISOString()
        );
      contactClicks = data?.length ?? 0;
    } catch (e) {
      console.error("Contact events fetch error:", e);
    }

    // Calculate contact rate
    let contactRate: number | null = null;
    if (analytics.available && analytics.total > 0) {
      contactRate = (contactClicks / analytics.total) * 100;
    }

    // Get photos
    let photos: any[] = [];
    try {
      const { data } = await session
        .from("profile_photos")
        .select("moderation_status")
        .eq("profile_id", profile.id);
      photos = data ?? [];
    } catch (e) {
      console.error("Photos fetch error:", e);
    }

    const photoCounts = {
      approved: photos?.filter((p) => p.moderation_status === "approved").length ?? 0,
      pending: photos?.filter((p) => p.moderation_status === "pending").length ?? 0,
      rejected: photos?.filter((p) => p.moderation_status === "rejected").length ?? 0,
    };

    // Get identity status
    let identityStatus = "not_started";
    try {
      const { data } = await session
        .from("identity_verifications")
        .select("status")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      identityStatus = data?.status ?? "not_started";
    } catch (e) {
      console.error("Identity status fetch error:", e);
    }

    // Get support tickets
    let supportOpen = 0;
    try {
      const { data } = await session
        .from("support_tickets")
        .select("id")
        .eq("user_id", userId)
        .in("status", ["open", "in_progress", "pending", "awaiting_response"]);
      supportOpen = data?.length ?? 0;
    } catch (e) {
      console.error("Support tickets fetch error:", e);
    }

    // Get notifications
    let unreadNotifications = 0;
    try {
      const { data } = await session
        .from("notifications")
        .select("id")
        .eq("user_id", userId)
        .eq("is_read", false);
      unreadNotifications = data?.length ?? 0;
    } catch (e) {
      console.error("Notifications fetch error:", e);
    }

    const dashboardProfile: DashboardProfile = {
      id: profile.id,
      display_name: profile.display_name,
      full_name: profile.full_name,
      city: profile.city,
      subscription_tier: profile.subscription_tier,
      available_now: (profile as any).available_now ?? null,
      available_now_expires: (profile as any).available_now_expires ?? null,
      travel_schedule: (profile as any).travel_schedule ?? null,
      visibility_status: profile.visibility_status,
      profile_status: profile.profile_status,
      profile_completion_score: (profile as any).profile_completion_score ?? null,
      profile_views: analytics.total,
      is_active: profile.visibility_status !== "hidden",
    };

    const aiSnapshot: AiSnapshot = {
      profile_score: null,
      visibility_score: null,
      profile_views_7d: analytics.total,
      profile_views_30d: analytics.previous + analytics.total,
      contact_clicks_7d: contactClicks,
      contact_rate_pct: contactRate,
      local_demand_score: null,
      local_demand_trend: null,
      strongest_keyword: null,
      top_recommendation_title: null,
      top_recommendation_action: null,
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
