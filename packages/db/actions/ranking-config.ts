import type { FunctionArgs, FunctionReturns } from "../index";

/**
 * Types and constants for the ranking action.
 *
 * Deliberately separate from `ranking.ts`: that module carries `"use server"`,
 * and Next.js only allows a server-action module to export async functions.
 * Constants and types live here so callers can still import them.
 */

/** One hour, in seconds. */
export const RANKING_REVALIDATE_SECONDS = 3600;

/** Cache tag for the whole ranking surface — `revalidateTag` to bust it. */
export const RANKING_CACHE_TAG = "ranking";

/** Row shape returned by `search_public_therapists`, straight from the schema. */
export type RankedTherapist = FunctionReturns<"search_public_therapists">[number];

/** Argument shape accepted by the RPC. */
export type RankingRpcArgs = FunctionArgs<"search_public_therapists">;

/** Filters accepted by `getRankedTherapists`. */
export interface RankingFilters {
  /** Search origin latitude. Pair with `longitude` for distance ranking. */
  latitude?: number;
  /** Search origin longitude. Pair with `latitude` for distance ranking. */
  longitude?: number;
  /** Radius around the search origin, in miles. */
  radiusMiles?: number;
  /** Page size. Defaults to the RPC's own default when omitted. */
  limit?: number;
  /** Offset for pagination. */
  offset?: number;
}

/** Cache key for one ranking query. Stable ordering keeps keys deduplicated. */
export function rankingCacheKey(citySlug: string, filters: RankingFilters): string[] {
  return [
    "ranking",
    citySlug,
    String(filters.latitude ?? ""),
    String(filters.longitude ?? ""),
    String(filters.radiusMiles ?? ""),
    String(filters.limit ?? ""),
    String(filters.offset ?? ""),
  ];
}

/** Map the action's camelCase filters onto the RPC's snake_case arguments. */
export function toRpcArgs(citySlug: string, filters: RankingFilters): RankingRpcArgs {
  return {
    search_city_slug: citySlug,
    ...(filters.latitude !== undefined ? { search_lat: filters.latitude } : {}),
    ...(filters.longitude !== undefined ? { search_lng: filters.longitude } : {}),
    ...(filters.radiusMiles !== undefined ? { radius_miles: filters.radiusMiles } : {}),
    ...(filters.limit !== undefined ? { result_limit: filters.limit } : {}),
    ...(filters.offset !== undefined ? { result_offset: filters.offset } : {}),
  };
}
