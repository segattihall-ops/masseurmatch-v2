import "server-only";

import { summariseViews, type ViewRow, type ViewStats } from "@masseurmatch/db/analytics";
import { createServiceClient } from "@masseurmatch/db/client";

/**
 * Reading a therapist's own view analytics.
 *
 * Goes through the service client, and that is deliberate rather than lazy.
 * `profile_view_analytics` stores `user_ip` and `session_id` for every visitor,
 * and `anon`/`authenticated` hold **no SELECT grant** on it — only INSERT. So
 * there is no client-side read path today, and giving one would mean granting a
 * browser-reachable role access to a table of visitor IP addresses in order to
 * show a therapist a count.
 *
 * Reading here instead, filtered to the caller's own profile id and reduced to
 * aggregates before it leaves the server, gets the same answer without ever
 * putting that table within reach of a key that ships to a browser.
 *
 * (The table does carry a policy reading `auth.role() = 'authenticated'`, which
 * looks like a broad grant. It is inert: RLS is only consulted after the table
 * grant allows the operation, and there is no SELECT grant. Worth knowing
 * before anyone "fixes" it by adding one.)
 */

/** How far back the card looks, and the window its comparison uses. */
export const ANALYTICS_WINDOW_DAYS = 7;

export type ProfileAnalytics = ViewStats & {
  /** False when the table cannot be read — the card hides rather than lying. */
  available: boolean;
};

const EMPTY: ProfileAnalytics = {
  total: 0,
  people: 0,
  previous: 0,
  trend: { kind: "too-early" },
  topSources: [],
  topPlaces: [],
  available: false,
};

export async function getMyViewAnalytics(
  profileId: string,
  now: Date = new Date(),
): Promise<ProfileAnalytics> {
  // Both windows in one read, so the halves of the comparison cannot be
  // measured against two different clocks.
  const since = new Date(now.getTime() - ANALYTICS_WINDOW_DAYS * 2 * 86_400_000);

  const { data, error } = await createServiceClient()
    .from("profile_view_analytics")
    // Never `user_ip`. This feature has no use for it and the column should not
    // travel further than the row it lives in.
    .select("created_at,source,viewer_city,viewer_state,session_id")
    .eq("profile_id", profileId)
    .gte("created_at", since.toISOString())
    .limit(5000);

  if (error) {
    // The dashboard's main page must not fall over because an analytics table
    // is missing or a key is absent. Same reasoning as the Spike card.
    return EMPTY;
  }

  const rows = (data ?? []) as unknown as ViewRow[];
  return { ...summariseViews(rows, ANALYTICS_WINDOW_DAYS, now), available: true };
}
