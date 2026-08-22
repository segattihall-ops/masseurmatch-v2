/**
 * Types, constants and pure helpers for the public directory.
 *
 * Separate from `directory.ts` so pages can import types and helpers without
 * pulling in `server-only` or the Supabase client.
 */

import { spikeIsActive } from "../spikes";
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
  /** End of the current visibility Spike, or null. */
  spike_until: string | null;
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
  available_now: boolean | null;
  /** Read through `isAvailableNow` — the flag alone is not the answer. */
  available_now_expires: string | null;
  lgbtq_affirming: boolean | null;
  /** Raw `jsonb`. Read it through `parseTravelSchedule` — never index it directly. */
  travel_schedule: unknown;
  years_experience: number | null;
  /** Physical profile fields are public and searchable on the current site. */
  height_inches: number | null;
  weight_lb: number | null;
  body_type: string | null;
  start_year: number | null;
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
  languages: string[] | null;
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

/** How search results may be ordered. `recommended` is `compareByRank`. */
export type DirectorySort = "recommended" | "price" | "rating";

export const DIRECTORY_SORTS: DirectorySort[] = ["recommended", "price", "rating"];

export type DirectoryTier = "free" | "standard" | "pro" | "elite";
export const DIRECTORY_TIERS: DirectoryTier[] = ["free", "standard", "pro", "elite"];

export type DirectoryObjectiveId =
  "deep-recovery" | "sports-clinical" | "stress-relief" | "pre-natal";

export const DIRECTORY_OBJECTIVES: ReadonlyArray<{
  id: DirectoryObjectiveId;
  label: string;
  searchValue: string;
}> = [
  { id: "deep-recovery", label: "Deep Recovery", searchValue: "deep tissue" },
  { id: "sports-clinical", label: "Sports Clinical", searchValue: "sports" },
  { id: "stress-relief", label: "Stress Relief", searchValue: "swedish" },
  { id: "pre-natal", label: "Pre-Natal", searchValue: "prenatal" },
] as const;

export function isDirectoryObjective(value: string | undefined): value is DirectoryObjectiveId {
  return Boolean(value && DIRECTORY_OBJECTIVES.some((objective) => objective.id === value));
}

export function directoryObjectiveSearchValue(
  value: DirectoryObjectiveId | undefined,
): string | undefined {
  return DIRECTORY_OBJECTIVES.find((objective) => objective.id === value)?.searchValue;
}

/** Filters accepted by the search page, parsed from searchParams. */
export interface DirectoryFilters {
  /** URL-safe city slug. */
  city?: string;
  /** Two-letter state slug when known; keeps duplicate city names unambiguous. */
  state?: string;
  service?: string;
  query?: string;
  /** Current-site intent shortcut; applied in addition to free text. */
  goal?: DirectoryObjectiveId;
  /** Where the session happens. Omitted means either. */
  session?: "incall" | "outcall";
  /** Only therapists whose Available Now badge is on and unexpired. */
  availableNow?: boolean;
  /** Only identity- or profile-verified therapists. */
  verified?: boolean;
  /** Only therapists who marked their practice LGBTQ+ affirming. */
  lgbtq?: boolean;
  minPrice?: number;
  /** Keep listings whose cheapest offered session is at or under this. */
  maxPrice?: number;
  /** Effective tier, after paid-status/courtesy-grant expiry is resolved. */
  tier?: DirectoryTier;
  /** Experience threshold; the current site's "Master" filter maps to 10. */
  minExperienceYears?: number;
  sort?: DirectorySort;
  page?: number;
  pageSize?: number;
}

export interface DirectorySearchResult {
  items: TherapistListing[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * The cheapest session a listing offers, or null when it lists no prices.
 * A price only counts for a session type the therapist actually offers.
 */
export function startingPrice(listing: TherapistListing): number | null {
  const prices: number[] = [];
  if (listing.offers_incall !== false && typeof listing.incall_price === "number") {
    prices.push(listing.incall_price);
  }
  if (listing.offers_outcall !== false && typeof listing.outcall_price === "number") {
    prices.push(listing.outcall_price);
  }
  return prices.length > 0 ? Math.min(...prices) : null;
}

/** URL-safe city slug. `"Fort Lauderdale"` → `"fort-lauderdale"`. */
export function citySlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
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
    Number(spikeIsActive(b)) - Number(spikeIsActive(a)) ||
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
