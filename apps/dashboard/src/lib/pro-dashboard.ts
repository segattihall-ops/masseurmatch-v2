import "server-only";

import { coachAdvice, type Advice } from "@masseurmatch/db/coach";
import { createSessionClient } from "@masseurmatch/db/auth";
import { createServiceClient } from "@masseurmatch/db/client";
import { isAvailableNow } from "@masseurmatch/db/available-now";
import { parseTravelSchedule, upcomingVisits } from "@masseurmatch/db/travel";
import { scoreProfile, type ProfileScore } from "@masseurmatch/db/profile-score";
import { PUBLIC } from "@masseurmatch/db/visibility";

import { ANALYTICS_WINDOW_DAYS, getMyViewAnalytics } from "./analytics";
import { photoLimitForProfile } from "./cloudinary";
import { getCityDemand } from "./demand";
import { getOrCreateMyProfile, type MyProfile } from "./profile";

/**
 * Everything the Pro dashboard prints, gathered once.
 *
 * The page is a grid of ten numbers over five tables. Fetching them from the
 * component tree would mean ten round trips serialised by React's rendering
 * order; gathering them here lets them go out together and keeps the page a
 * layout file.
 *
 * Every count is wrapped so a missing table or an absent service key costs one
 * card, not the dashboard. A therapist checking whether their profile is live
 * should never be shown a stack trace because the notifications table moved.
 */

/** The long window quoted underneath the seven-day view count. */
export const LONG_WINDOW_DAYS = 30;

/**
 * What "open" means for the support count.
 *
 * Production has written all four of these into `support_tickets.status` over
 * time, so matching only `open` would under-report a therapist who is mid
 * conversation with the team.
 */
const OPEN_TICKET_STATUSES = ["open", "in_progress", "pending", "awaiting_response"];

export type PhotoCounts = { approved: number; pending: number; rejected: number };

export type ProDashboardData = {
  profile: MyProfile;
  score: ProfileScore;
  /** The one thing the Coach would do next, or null when there is nothing. */
  nextAction: Advice | null;

  views: { window: number; long: number };
  contacts: { window: number; rate: number | null };
  demand: { score: number | null; direction: string };
  /**
   * Production's completeness figure, or null when it has never been computed.
   * Null is not zero, and the card must render it as "—" rather than "0%".
   */
  completion: number | null;
  photos: PhotoCounts;
  /** Latest manual identity-review state, or null when none was ever started. */
  identity: string | null;
  openTickets: number;
  unreadNotifications: number;

  toggles: {
    availableNow: boolean;
    traveling: boolean;
    /** Null when the profile has never been asked about outcall either way. */
    mobile: boolean | null;
    visible: boolean;
  };
};

/** Never let one absent table take the page down with it. */
async function safe<T>(work: Promise<T>, fallback: T): Promise<T> {
  try {
    return await work;
  } catch {
    return fallback;
  }
}

type CountResult = { count: number | null; error: unknown };

/**
 * A `head: true` count through the service client.
 *
 * Service-role rather than session because two of the four tables counted here
 * (`contact_events`, `profile_view_analytics`) hold no SELECT grant for
 * `authenticated` — they carry visitor IPs, and a browser-reachable key must
 * not be able to read them. Reducing each to a single integer on the server
 * gets the therapist their number without widening that grant.
 */
async function count(
  run: (db: ReturnType<typeof createServiceClient>) => PromiseLike<CountResult>,
): Promise<number> {
  let db;
  try {
    db = createServiceClient();
  } catch {
    return 0;
  }

  const { count: rows, error } = await run(db);
  return error ? 0 : (rows ?? 0);
}

/** Photos by moderation state. One read, bucketed here rather than three counts. */
async function photoCounts(profileId: string): Promise<PhotoCounts> {
  const empty: PhotoCounts = { approved: 0, pending: 0, rejected: 0 };

  const { data, error } = await createSessionClient()
    .from("profile_photos")
    .select("moderation_status")
    .eq("profile_id", profileId)
    .limit(500);

  if (error) return empty;

  return (data ?? []).reduce<PhotoCounts>((acc, row) => {
    const status = (row as { moderation_status: string | null }).moderation_status ?? "pending";
    if (status === "approved") acc.approved += 1;
    else if (status === "rejected") acc.rejected += 1;
    else acc.pending += 1;
    return acc;
  }, empty);
}

/** The most recent manual identity attempt. Retired provider rows are ignored. */
async function latestIdentityStatus(userId: string, profileId: string): Promise<string | null> {
  let supabase;
  try {
    supabase = createServiceClient();
  } catch {
    return null;
  }

  const { data, error } = await supabase
    .from("identity_verifications")
    .select("status,created_at,user_id,profile_id")
    .eq("provider", "manual")
    .or(`user_id.eq.${userId},profile_id.eq.${profileId}`)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error || !data?.length) return null;
  return (data[0] as { status: string | null }).status ?? null;
}

export async function getProDashboard(userId: string): Promise<ProDashboardData> {
  const { profile, photoCount } = await getOrCreateMyProfile(userId);
  const now = new Date();
  const windowStart = new Date(now.getTime() - ANALYTICS_WINDOW_DAYS * 86_400_000).toISOString();
  const longStart = new Date(now.getTime() - LONG_WINDOW_DAYS * 86_400_000).toISOString();

  const [analytics, demand, contactsWindow, longViews, photos, identity, tickets, notifications] =
    await Promise.all([
      safe(getMyViewAnalytics(profile.id, now), null),
      safe(getCityDemand(profile.city, profile.state, profile.id, now), null),
      safe(
        count((db) =>
          db
            .from("contact_events")
            .select("id", { count: "exact", head: true })
            .eq("profile_id", profile.id)
            .gte("created_at", windowStart),
        ),
        0,
      ),
      safe(
        count((db) =>
          db
            .from("profile_view_analytics")
            .select("id", { count: "exact", head: true })
            .eq("profile_id", profile.id)
            .gte("created_at", longStart),
        ),
        0,
      ),
      safe(photoCounts(profile.id), { approved: 0, pending: 0, rejected: 0 } as PhotoCounts),
      safe(latestIdentityStatus(userId, profile.id), null),
      safe(
        count((db) =>
          db
            .from("support_tickets")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .in("status", OPEN_TICKET_STATUSES),
        ),
        0,
      ),
      safe(
        count((db) =>
          db
            .from("notifications")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .eq("is_read", false),
        ),
        0,
      ),
    ]);

  const score = scoreProfile({
    headline: profile.headline,
    bio: profile.bio,
    service_categories: profile.service_categories,
    incall_price: profile.incall_price,
    outcall_price: profile.outcall_price,
    photoCount,
    photoLimit: photoLimitForProfile(profile),
  });

  const views = analytics?.total ?? 0;

  const advice = coachAdvice({
    scoreTotal: score.total,
    scoreActions: score.todo.map((check) => ({
      id: check.id,
      action: check.action,
      href: check.href,
      gap: check.possible - check.earned,
    })),
    views,
    previousViews: analytics?.previous ?? 0,
    demand: demand?.reading
      ? { score: demand.reading.score, direction: demand.reading.direction }
      : null,
    keywords: demand?.keywords.map((k) => ({ keyword: k.keyword, change: k.change })) ?? [],
    cityPeers: demand?.peers ?? 0,
    // Spikes have their own card and their own entitlement check. Claiming one
    // is available here without asking would put advice on the page that the
    // therapist cannot act on.
    canSpike: false,
    availableNow: isAvailableNow(profile as never, now),
  });

  const extras = profile as unknown as {
    profile_completeness?: number | null;
    completion_percentage?: number | null;
    offers_outcall?: boolean | null;
    outcall?: boolean | null;
    traveling?: boolean | null;
    travel_schedule?: unknown;
  };

  const trips = parseTravelSchedule(extras.travel_schedule);

  return {
    profile,
    score,
    nextAction: advice[0] ?? null,

    views: { window: views, long: longViews },
    contacts: {
      window: contactsWindow,
      // A rate needs a denominator. With no views in the window there is no
      // rate to report, and 0 % would read as "nobody contacts you".
      rate: views > 0 ? (contactsWindow / views) * 100 : null,
    },
    demand: {
      score: demand?.reading?.score ?? null,
      direction: demand?.reading?.direction ?? "stable",
    },
    completion: extras.profile_completeness ?? extras.completion_percentage ?? null,
    photos,
    identity,
    openTickets: tickets,
    unreadNotifications: notifications,

    toggles: {
      availableNow: isAvailableNow(profile as never, now),
      traveling: Boolean(extras.traveling) || upcomingVisits(trips, null, now).length > 0,
      mobile: extras.offers_outcall ?? extras.outcall ?? null,
      visible: profile.visibility_status === PUBLIC,
    },
  };
}
