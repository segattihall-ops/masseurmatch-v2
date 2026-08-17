/**
 * Types, constants and pure helpers for the public directory.
 *
 * Separate from `directory.ts` so pages can import types and helpers without
 * pulling in `server-only` or the Supabase client.
 */

import { resolveTier, type TierGrantFields } from "../tier-grants";

/** One hour, matching the ISR revalidate on the public pages. */
export const DIRECTORY_REVALIDATE_SECONDS = 3600;

/** Cache tag for the whole directory surface — `revalidateTag` to bust it. */
export const DIRECTORY_CACHE_TAG = "directory";

/** A therapist as shown in a list. */
export interface TherapistListing {
  id: string;
  slug: string;
  display_name: string | null;
  full_name: string | null;
  headline: string | null;
  city: string | null;
  state: string | null;
  neighborhood: string | null;
  avatar_url: string | null;
  photo_url: string | null;
  service_categories: string[] | null;
  massage_techniques: string[] | null;
  specialties: string[] | null;
  subscription_tier: string | null;
  /** Set when the tier is a courtesy grant rather than a paid subscription. */
  subscription_status: string | null;
  tier_granted_until: string | null;
  is_featured: boolean | null;
  boost_score: number | null;
  rating_average: number | null;
  review_count: number | null;
  is_verified_identity: boolean | null;
  is_verified_profile: boolean | null;
  offers_incall: boolean | null;
  offers_outcall: boolean | null;
  incall_price: number | null;
  outcall_price: number | null;
  updated_at: string | null;
}

/** A photo attached to a profile. */
export interface ProfilePhoto {
  id: string;
  url: string | null;
  storagePath: string | null;
}

/** A therapist as shown on their own page. */
export interface ProfileDetail extends TherapistListing {
  bio: string | null;
  tagline: string | null;
  years_experience: number | null;
  languages: string[] | null;
  lgbtq_affirming: boolean | null;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
  zip_code: string | null;
  seo_title: string | null;
  seo_description: string | null;
  photos: ProfilePhoto[];
}

/** A city derived from the visible therapists. */
export interface CityListing {
  citySlug: string;
  stateSlug: string;
  name: string;
  state: string;
  therapistCount: number;
}

/** Filters accepted by the search page, parsed from searchParams. */
export interface DirectoryFilters {
  city?: string;
  service?: string;
  query?: string;
}

/** URL-safe city slug. `"Fort Lauderdale"` → `"fort-lauderdale"`. */
export function citySlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Human label for a therapist, falling back through the name columns. */
export function therapistName(therapist: {
  display_name: string | null;
  full_name: string | null;
  slug: string;
}): string {
  return therapist.display_name?.trim() || therapist.full_name?.trim() || therapist.slug;
}

/** Ranking weight per subscription tier. Higher sorts first. */
const TIER_WEIGHT: Record<string, number> = { elite: 3, pro: 2, standard: 1, free: 0 };

/**
 * Weight for the tier a listing is *entitled* to, not the one its row claims.
 *
 * `subscription_tier` is set by hand for some profiles with nothing paid behind
 * it, so ranking straight off the column sells top placement for free. Going
 * through `resolveTier` means a courtesy grant stops lifting a listing the day
 * its deadline passes, with nothing scheduled to make that happen.
 */
function tierWeight(listing: TierGrantFields): number {
  return TIER_WEIGHT[resolveTier(listing)] ?? 0;
}

/**
 * Directory ordering: subscription tier, then boost, then rating, then review
 * volume, then name. Fully deterministic, so ISR output is stable between
 * builds and two therapists never swap places at random.
 */
export function compareByRank(a: TherapistListing, b: TherapistListing): number {
  return (
    tierWeight(b) - tierWeight(a) ||
    Number(b.is_featured ?? false) - Number(a.is_featured ?? false) ||
    (b.boost_score ?? 0) - (a.boost_score ?? 0) ||
    (b.rating_average ?? 0) - (a.rating_average ?? 0) ||
    (b.review_count ?? 0) - (a.review_count ?? 0) ||
    therapistName(a).localeCompare(therapistName(b))
  );
}

/** Path to a therapist's page, or null when they have no city to route under. */
export function profilePath(therapist: {
  slug: string;
  city: string | null;
  state: string | null;
}): string | null {
  if (!therapist.city || !therapist.state) return null;
  return `/${therapist.state.toLowerCase()}/${citySlug(therapist.city)}/${therapist.slug}`;
}

/** Path to a city page. */
export function cityPath(city: Pick<CityListing, "stateSlug" | "citySlug">): string {
  return `/${city.stateSlug}/${city.citySlug}`;
}
