import "server-only";

import { createServiceClient } from "@masseurmatch/db/client";
import {
  currentDemand,
  risingKeywords,
  type DemandReading,
  type DemandRow,
  type KeywordOpportunity,
  type TrendRow,
} from "@masseurmatch/db/demand";

/**
 * Demand Radar for one therapist's city.
 *
 * Reads through the service client because `keyword_trends` is admin-read-only
 * by policy — the Python collector writes it with the service key and nothing
 * client-side may read it. Reducing it to a score and a handful of keywords
 * here means a therapist gets the answer without the table being reachable.
 *
 * Every city is matched case-insensitively: `profiles.city` is free text typed
 * by therapists, while the collector writes its own spelling.
 */

export type CityDemand = {
  reading: DemandReading | null;
  keywords: KeywordOpportunity[];
  /** Other publicly listed therapists in the same city. */
  peers: number;
  /** False when nothing could be read at all — the card hides rather than lying. */
  available: boolean;
};

const EMPTY: CityDemand = { reading: null, keywords: [], peers: 0, available: false };

export async function getCityDemand(
  city: string | null,
  state: string | null,
  profileId: string,
  now: Date = new Date(),
): Promise<CityDemand> {
  if (!city?.trim() || !state?.trim()) return EMPTY;

  let supabase;
  try {
    supabase = createServiceClient();
  } catch {
    return EMPTY;
  }

  const since = new Date(now.getTime() - 21 * 86_400_000).toISOString().slice(0, 10);

  const [scores, trends, peers] = await Promise.all([
    supabase
      .from("demand_scores")
      .select(
        "city,state,score,trend,search_volume_index,competition_index,week_start,is_sample,expires_at",
      )
      .ilike("city", city.trim())
      .ilike("state", state.trim())
      .order("week_start", { ascending: false })
      .limit(20),
    supabase
      .from("keyword_trends")
      .select("keyword,score,week_over_week_change,date")
      .ilike("city", city.trim())
      .ilike("state", state.trim())
      .gte("date", since)
      .order("date", { ascending: false })
      .limit(200),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .ilike("city", city.trim())
      .ilike("state", state.trim())
      .neq("id", profileId)
      .eq("profile_status", "approved")
      .eq("visibility_status", "public"),
  ]);

  // A missing table or an absent key must never take down the dashboard home.
  if (scores.error && trends.error) return EMPTY;

  return {
    reading: currentDemand((scores.data ?? []) as unknown as DemandRow[], now),
    keywords: risingKeywords((trends.data ?? []) as unknown as TrendRow[]),
    peers: peers.count ?? 0,
    available: true,
  };
}
