import "server-only";

import { createSessionClient } from "@masseurmatch/db/auth";
import { toProfileStatus, type ProfileStatus } from "@masseurmatch/db/profile-status";

/**
 * Admin data layer.
 *
 * Reads and writes go through the *session* client, so RLS applies to admins
 * too. The service-role client is deliberately not used anywhere here: an admin
 * UI that bypasses RLS cannot be tested against the policies it is supposed to
 * respect, and every bug in it becomes a full-table bug.
 */

const QUEUE_COLUMNS =
  "id,user_id,display_name,full_name,headline,bio,city,state,slug," +
  "service_categories,additional_services,avatar_url,photo_url," +
  "profile_status,visibility_status,moderation_status,moderation_notes,updated_at";

export type QueueProfile = {
  id: string;
  user_id: string | null;
  display_name: string | null;
  full_name: string | null;
  headline: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;
  slug: string | null;
  service_categories: string[] | null;
  additional_services: string[] | null;
  avatar_url: string | null;
  photo_url: string | null;
  profile_status: string | null;
  visibility_status: string | null;
  moderation_status: string | null;
  moderation_notes: string | null;
  updated_at: string;
};

export type QueueItem = {
  profile: QueueProfile;
  status: ProfileStatus;
  /** Why it is in the queue: a first submission, or an edit to a live profile. */
  kind: "new" | "edited";
  photos: { id: string; url: string | null; moderation_status: string | null }[];
};

/**
 * The moderation queue.
 *
 * Two populations, deliberately in one list:
 *
 *   new     — `profile_status = 'pending'`, never approved, not yet public.
 *   edited  — already approved, but a sensitive field changed since, so
 *             `moderation_status = 'pending_review'` (set by phase 5's
 *             `saveProfile`). These are **live** while they wait; see
 *             `apps/dashboard/src/app/profile/actions.ts` for why.
 *
 * Ordered oldest first. A queue sorted newest-first quietly starves its tail,
 * which for a moderation queue means the oldest unreviewed profile is the last
 * one anybody looks at.
 */
export async function getModerationQueue(limit = 50): Promise<QueueItem[]> {
  const supabase = createSessionClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(QUEUE_COLUMNS)
    .or("profile_status.eq.pending,moderation_status.eq.pending_review")
    .order("updated_at", { ascending: true })
    .limit(limit);

  if (error) throw new Error(`Could not load the moderation queue: ${error.message}`);

  const profiles = (data ?? []) as unknown as QueueProfile[];
  if (profiles.length === 0) return [];

  const { data: photoRows, error: photoError } = await supabase
    .from("profile_photos")
    .select("id,url,moderation_status,profile_id")
    .in(
      "profile_id",
      profiles.map((p) => p.id),
    );

  if (photoError) throw new Error(`Could not load queue photos: ${photoError.message}`);

  const byProfile = new Map<string, QueueItem["photos"]>();
  for (const row of (photoRows ?? []) as unknown as {
    id: string;
    url: string | null;
    moderation_status: string | null;
    profile_id: string | null;
  }[]) {
    if (!row.profile_id) continue;
    byProfile.set(row.profile_id, [
      ...(byProfile.get(row.profile_id) ?? []),
      { id: row.id, url: row.url, moderation_status: row.moderation_status },
    ]);
  }

  return profiles.map((profile) => ({
    profile,
    status: toProfileStatus(profile.profile_status),
    kind: profile.moderation_status === "pending_review" ? "edited" : "new",
    photos: byProfile.get(profile.id) ?? [],
  }));
}

/* -------------------------------------------------------------------------- */

export type AdminMetrics = {
  approved: number;
  /** Started but never submitted. Not in the queue, and not a reviewer's problem. */
  draft: number;
  pending: number;
  rejected: number;
  suspended: number;
  signupsLast30Days: number;
  byCity: { city: string; count: number }[];
};

/** Dashboard metrics. Each is a `head: true` count, so no rows cross the wire. */
export async function getAdminMetrics(): Promise<AdminMetrics> {
  const supabase = createSessionClient();

  const statusCount = async (status: ProfileStatus) => {
    const { count, error } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("profile_status", status);
    if (error) throw new Error(`Could not count ${status} profiles: ${error.message}`);
    return count ?? 0;
  };

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [approved, draft, pending, rejected, suspended] = await Promise.all([
    statusCount("approved"),
    statusCount("draft"),
    statusCount("pending"),
    statusCount("rejected"),
    statusCount("suspended"),
  ]);

  const { count: signups, error: signupError } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .gte("created_at", since);
  if (signupError) throw new Error(`Could not count signups: ${signupError.message}`);

  // City breakdown is computed here rather than in SQL: PostgREST has no
  // GROUP BY, and adding an RPC for a dashboard card is not worth production
  // DDL. Bounded to approved profiles, which is the population that matters
  // and is small.
  const { data: cityRows, error: cityError } = await supabase
    .from("profiles")
    .select("city")
    .eq("profile_status", "approved")
    .limit(1000);
  if (cityError) throw new Error(`Could not load city breakdown: ${cityError.message}`);

  const counts = new Map<string, number>();
  for (const row of (cityRows ?? []) as unknown as { city: string | null }[]) {
    const city = row.city?.trim();
    if (!city) continue;
    counts.set(city, (counts.get(city) ?? 0) + 1);
  }

  return {
    approved,
    draft,
    pending,
    rejected,
    suspended,
    signupsLast30Days: signups ?? 0,
    byCity: [...counts.entries()]
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city))
      .slice(0, 10),
  };
}
