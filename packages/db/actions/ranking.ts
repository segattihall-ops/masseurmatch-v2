"use server";

import { unstable_cache } from "next/cache";

import { createAnonClient } from "../client";
import {
  RANKING_CACHE_TAG,
  RANKING_REVALIDATE_SECONDS,
  rankingCacheKey,
  toRpcArgs,
  type RankedTherapist,
  type RankingFilters,
} from "./ranking-config";

/**
 * Ranking server action.
 *
 * Wraps the existing `search_public_therapists` RPC, which does the ranking in
 * Postgres: it returns rows already ordered by `priority_rank` (subscription
 * tier and learning score) and then by distance from the search point.
 *
 * The RPC runs through the **anon** client, so RLS still applies — this action
 * can never return a profile a logged-out visitor could not read directly.
 *
 * Results are cached for an hour. Ranking inputs (tiers, learning scores,
 * profile status) change on the order of hours, not seconds, and the directory
 * is the hottest read path on the site.
 *
 * Note: this module may only export async functions — it is a `"use server"`
 * boundary. Constants and types live in `./ranking-config`.
 */

async function fetchRankedTherapists(
  citySlug: string,
  filters: RankingFilters,
): Promise<RankedTherapist[]> {
  const { data, error } = await createAnonClient().rpc(
    "search_public_therapists",
    toRpcArgs(citySlug, filters),
  );

  if (error) {
    throw new Error(`search_public_therapists failed for "${citySlug}": ${error.message}`);
  }

  return data ?? [];
}

/**
 * Ranked, RLS-filtered therapists for a city.
 *
 * @param citySlug Canonical city slug, e.g. `"los-angeles-ca"`.
 * @param filters  Optional geo and pagination filters.
 * @returns Profiles ordered by `priority_rank`, then distance.
 */
export async function getRankedTherapists(
  citySlug: string,
  filters: RankingFilters = {},
): Promise<RankedTherapist[]> {
  const cached = unstable_cache(
    () => fetchRankedTherapists(citySlug, filters),
    rankingCacheKey(citySlug, filters),
    { revalidate: RANKING_REVALIDATE_SECONDS, tags: [RANKING_CACHE_TAG] },
  );

  return cached();
}
