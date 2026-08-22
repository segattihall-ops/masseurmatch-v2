import "server-only";

import { unstable_cache } from "next/cache";

import { isAvailableNow } from "../available-now";
import { createAnonClient, hasSupabaseCredentials } from "../client";
import { resolveTier } from "../tier-grants";
import { travelVisit } from "../travel";
import {
  DIRECTORY_CACHE_TAG,
  DIRECTORY_REVALIDATE_SECONDS,
  citySlug,
  compareByRank,
  directoryObjectiveSearchValue,
  startingPrice,
  type CityListing,
  type DirectoryFilters,
  type DirectorySearchResult,
  type ProfileDetail,
  type TherapistListing,
} from "./directory-config";

/**
 * Public directory data access.
 *
 * Everything here reads through the **anon** client, so Postgres RLS is the
 * access control: a logged-out visitor and this code see exactly the same
 * rows. The explicit `profile_status`/`visibility_status` filters mirror the
 * live policy rather than replacing it.
 */

const OPTIONAL_COLUMNS = ["subscription_status", "tier_granted_until", "spike_until"];
const missingColumns = new Set<string>();

function columnsFor(base: string[]): string {
  return base.filter((column) => !missingColumns.has(column)).join(",");
}

function missingOptionalColumns(message: string): string[] {
  if (!message.includes("does not exist")) return [];
  return OPTIONAL_COLUMNS.filter((column) => message.includes(column));
}

function consequenceOf(column: string): string {
  return column === "spike_until"
    ? "Spikes will not lift a listing"
    : "courtesy tier grants will not expire";
}

/** Columns the public site needs. Explicit, so a schema change is visible. */
const LISTING_COLUMNS = [
  "id",
  "slug",
  "display_name",
  "full_name",
  "headline",
  "city",
  "state",
  "neighborhood",
  "latitude",
  "longitude",
  "avatar_url",
  "photo_url",
  "service_categories",
  "massage_techniques",
  "specialties",
  "subscription_tier",
  "subscription_status",
  "tier_granted_until",
  "spike_until",
  "is_featured",
  "boost_score",
  "rating_average",
  "review_count",
  "is_verified_identity",
  "is_verified_profile",
  "offers_incall",
  "offers_outcall",
  "incall_price",
  "outcall_price",
  "available_now",
  "available_now_expires",
  "lgbtq_affirming",
  "travel_schedule",
  "years_experience",
  "height_inches",
  "weight_lb",
  "body_type",
  "start_year",
  "updated_at",
  "promotions",
  "regular_discounts",
  "day_of_week_discount",
];

const DETAIL_COLUMNS = [
  ...LISTING_COLUMNS,
  "bio",
  "tagline",
  "languages",
  "website",
  "zip_code",
  "seo_title",
  "seo_description",
];

const APPROVED = "approved";
const PUBLIC = "public";

function isRoutable(row: { slug: string | null }): boolean {
  return Boolean(row.slug);
}

let warnedAboutCredentials = false;
let warnedAboutSearchRpc = false;

function directoryUnavailable(): boolean {
  if (hasSupabaseCredentials()) return false;
  if (!warnedAboutCredentials) {
    warnedAboutCredentials = true;
    console.warn(
      "[@masseurmatch/db] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set — " +
        "the directory will render empty. Set them to list therapists.",
    );
  }
  return true;
}

type QueryResult = { data: unknown; error: { message: string } | null };

async function selectProfiles<T>(
  columns: string[],
  build: (client: ReturnType<typeof createAnonClient>, select: string) => PromiseLike<QueryResult>,
): Promise<T[]> {
  const client = createAnonClient();

  for (const attempt of [0, 1]) {
    const { data, error } = await build(client, columnsFor(columns));
    if (!error) return (data ?? []) as unknown as T[];

    const absent = attempt === 0 ? missingOptionalColumns(error.message) : [];
    if (absent.length > 0) {
      for (const column of absent) {
        if (missingColumns.has(column)) continue;
        missingColumns.add(column);
        console.warn(
          `[@masseurmatch/db] profiles.${column} not found — run the matching ` +
            `migration in packages/db/migrations. Until then, ${consequenceOf(column)}.`,
        );
      }
      continue;
    }

    throw new Error(`Failed to load directory: ${error.message}`);
  }

  return [];
}

type CoordinateCarrier = {
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
};

type CityCoordinateRow = {
  slug: string | null;
  state: string | null;
  state_code: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
};

function coordinateNumber(value: number | string | null | undefined): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function stateMatches(row: CityCoordinateRow, state: string | null): boolean {
  if (!state) return true;
  const wanted = state.toLowerCase();
  return row.state_code?.toLowerCase() === wanted || row.state?.toLowerCase() === wanted;
}

async function hydrateCityCoordinates<T extends CoordinateCarrier>(rows: T[]): Promise<T[]> {
  if (rows.length === 0 || rows.every((row) => row.latitude !== null && row.longitude !== null)) {
    return rows;
  }

  const client = createAnonClient();
  const { data, error } = await client
    .from("cities")
    .select("slug,state,state_code,latitude,longitude");
  if (error || !data) return rows;

  const cities = data as unknown as CityCoordinateRow[];
  return rows.map((row) => {
    if (row.latitude !== null && row.longitude !== null) return row;
    if (!row.city) return row;
    const slug = citySlug(row.city);
    const city = cities.find((entry) => entry.slug === slug && stateMatches(entry, row.state));
    const latitude = coordinateNumber(city?.latitude);
    const longitude = coordinateNumber(city?.longitude);
    return latitude === null || longitude === null ? row : { ...row, latitude, longitude };
  });
}

async function fetchVisibleListings(): Promise<TherapistListing[]> {
  if (directoryUnavailable()) return [];

  const rows = await selectProfiles<TherapistListing>(LISTING_COLUMNS, (client, select) =>
    client
      .from("profiles")
      .select(select)
      .eq("profile_status", APPROVED)
      .eq("visibility_status", PUBLIC),
  );

  const hydrated = await hydrateCityCoordinates(rows);
  return hydrated.filter(isRoutable).sort(compareByRank);
}

/** Every publicly visible, routable therapist. Cached for an hour. */
export const getVisibleTherapists = unstable_cache(fetchVisibleListings, ["directory", "all"], {
  revalidate: DIRECTORY_REVALIDATE_SECONDS,
  tags: [DIRECTORY_CACHE_TAG],
});

type CityRow = { slug: string | null; city: string | null; state: string | null };

async function fetchVisibleCityRows(): Promise<CityRow[]> {
  if (directoryUnavailable()) return [];
  return selectProfiles<CityRow>(["slug", "city", "state"], (client, select) =>
    client
      .from("profiles")
      .select(select)
      .eq("profile_status", APPROVED)
      .eq("visibility_status", PUBLIC),
  );
}

export const getCities = unstable_cache(
  async (): Promise<CityListing[]> => {
    const rows = await fetchVisibleCityRows();
    const byKey = new Map<string, CityListing>();

    for (const row of rows) {
      if (!isRoutable(row) || !row.city || !row.state) continue;

      const state = row.state.toLowerCase();
      const city = citySlug(row.city);
      const key = `${state}/${city}`;
      const existing = byKey.get(key);

      if (existing) {
        existing.therapistCount += 1;
      } else {
        byKey.set(key, {
          citySlug: city,
          stateSlug: state,
          name: row.city,
          state: row.state,
          therapistCount: 1,
        });
      }
    }

    return [...byKey.values()].sort(
      (a, b) => b.therapistCount - a.therapistCount || a.name.localeCompare(b.name),
    );
  },
  ["directory", "cities"],
  { revalidate: DIRECTORY_REVALIDATE_SECONDS, tags: [DIRECTORY_CACHE_TAG] },
);

export async function getTherapistsByCity(
  stateSlug: string,
  city: string,
): Promise<TherapistListing[]> {
  const therapists = await getVisibleTherapists();
  return therapists.filter(
    (therapist) =>
      therapist.state?.toLowerCase() === stateSlug.toLowerCase() &&
      therapist.city !== null &&
      citySlug(therapist.city) === city.toLowerCase(),
  );
}

export async function getCity(stateSlug: string, city: string): Promise<CityListing | null> {
  const cities = await getCities();
  return (
    cities.find(
      (entry) =>
        entry.stateSlug === stateSlug.toLowerCase() && entry.citySlug === city.toLowerCase(),
    ) ?? null
  );
}

/** Full profile for the detail page, with its approved photos. */
export async function getProfileBySlug(slug: string): Promise<ProfileDetail | null> {
  if (directoryUnavailable()) return null;

  const client = createAnonClient();
  const rows = await selectProfiles<ProfileDetail>(DETAIL_COLUMNS, (candidate, select) =>
    candidate
      .from("profiles")
      .select(select)
      .eq("profile_status", APPROVED)
      .eq("visibility_status", PUBLIC)
      .eq("slug", slug)
      .limit(1),
  );

  const [profile] = await hydrateCityCoordinates(rows);
  if (!profile) return null;

  const { data: photos } = await client
    .from("profile_photos")
    .select("id,url,storage_path,is_primary,sort_order")
    .eq("profile_id", profile.id)
    .eq("moderation_status", "approved")
    .order("is_primary", { ascending: false })
    .order("sort_order", { ascending: true });

  profile.photos = (photos ?? [])
    .map((photo) => ({
      id: String(photo.id),
      url: photo.url ?? null,
      storagePath: photo.storage_path ?? null,
    }))
    .filter((photo) => photo.url || photo.storagePath);

  return profile;
}

function normalizeSearch(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const BODY_ALIASES: Record<string, string[]> = {
  slim: ["slim", "lean", "slender", "thin", "magro"],
  athletic: ["athletic", "fit", "toned", "atletico"],
  average: ["average", "regular build", "medium build", "medio", "normal"],
  muscular: ["muscular", "muscle", "buff", "built", "jacked", "musculoso", "forte"],
  stocky: ["stocky", "solid", "thick", "encorpado"],
  large: ["large", "big", "heavier", "heavyset", "bigger", "grande", "grandao", "maior"],
};

function physicalTerms(therapist: TherapistListing): string[] {
  const body = normalizeSearch(therapist.body_type);
  const bodyTerms = BODY_ALIASES[body] ?? (body ? [body] : []);
  const height = therapist.height_inches;
  const weight = therapist.weight_lb;
  const feet = typeof height === "number" && height > 0 ? Math.floor(height / 12) : null;
  const inches = typeof height === "number" && height > 0 ? Math.round(height) % 12 : null;

  return [
    ...bodyTerms,
    typeof height === "number" && height > 0 ? `${Math.round(height)} in` : "",
    feet !== null && inches !== null ? `${feet}'${inches}\"` : "",
    typeof weight === "number" && weight > 0 ? `${Math.round(weight)} lb` : "",
  ].filter(Boolean);
}

function searchableText(therapist: TherapistListing): string {
  return normalizeSearch(
    [
      therapist.display_name,
      therapist.full_name,
      therapist.headline,
      therapist.city,
      therapist.neighborhood,
      ...(therapist.specialties ?? []),
      ...(therapist.massage_techniques ?? []),
      ...(therapist.service_categories ?? []),
      ...physicalTerms(therapist),
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function cityMatches(therapist: TherapistListing, filters: DirectoryFilters): boolean {
  if (!filters.city) return true;
  const wantedCity = filters.city.toLowerCase();
  const wantedState = filters.state?.toLowerCase();

  const homeMatches =
    therapist.city !== null &&
    citySlug(therapist.city) === wantedCity &&
    (!wantedState || therapist.state?.toLowerCase() === wantedState);
  if (homeMatches) return true;

  const visit = travelVisit(therapist.travel_schedule, wantedCity);
  if (!visit) return false;
  return !wantedState || !visit.entry.state || visit.entry.state.toLowerCase() === wantedState;
}

type SearchOrigin = { latitude: number; longitude: number };

function distanceMiles(from: SearchOrigin, to: SearchOrigin): number {
  const radians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;
  const dLat = radians(to.latitude - from.latitude);
  const dLon = radians(to.longitude - from.longitude);
  const lat1 = radians(from.latitude);
  const lat2 = radians(to.latitude);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function hasOfferValue(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") return Object.keys(value).length > 0;
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}

async function searchOrigin(filters: DirectoryFilters): Promise<SearchOrigin | null> {
  if (!filters.city) return null;
  const client = createAnonClient();
  const { data, error } = await client
    .from("cities")
    .select("slug,state,state_code,latitude,longitude")
    .eq("slug", filters.city);
  if (error || !data) return null;
  const rows = data as unknown as CityCoordinateRow[];
  const row = rows.find((entry) => stateMatches(entry, filters.state ?? null)) ?? rows[0];
  const latitude = coordinateNumber(row?.latitude);
  const longitude = coordinateNumber(row?.longitude);
  return latitude === null || longitude === null ? null : { latitude, longitude };
}

function filterTherapistsInMemory(
  source: TherapistListing[],
  filters: DirectoryFilters,
  origin: SearchOrigin | null = null,
): TherapistListing[] {
  let therapists: TherapistListing[];

  if (filters.city && filters.radiusMiles && origin) {
    const wantedCity = filters.city.toLowerCase();
    therapists = source
      .map((therapist) => {
        const visit = travelVisit(therapist.travel_schedule, wantedCity);
        const distance = visit
          ? 0
          : therapist.latitude !== null && therapist.longitude !== null
            ? distanceMiles(origin, {
                latitude: therapist.latitude,
                longitude: therapist.longitude,
              })
            : null;
        return {
          ...therapist,
          distance_miles: distance === null ? null : Number(distance.toFixed(1)),
        };
      })
      .filter(
        (therapist) =>
          therapist.distance_miles !== null && therapist.distance_miles! <= filters.radiusMiles!,
      );
  } else {
    therapists = source.filter((therapist) => cityMatches(therapist, filters));
  }

  if (filters.service) {
    const wanted = normalizeSearch(filters.service);
    therapists = therapists.filter((therapist) =>
      [...(therapist.service_categories ?? []), ...(therapist.massage_techniques ?? [])].some(
        (entry) => normalizeSearch(entry) === wanted,
      ),
    );
  }

  if (filters.query) {
    const wanted = normalizeSearch(filters.query);
    therapists = therapists.filter((therapist) => searchableText(therapist).includes(wanted));
  }

  const goalSearch = directoryObjectiveSearchValue(filters.goal);
  if (goalSearch) {
    const wanted = normalizeSearch(goalSearch);
    therapists = therapists.filter((therapist) => searchableText(therapist).includes(wanted));
  }

  if (filters.session === "incall") {
    therapists = therapists.filter((therapist) => therapist.offers_incall === true);
  } else if (filters.session === "outcall") {
    therapists = therapists.filter((therapist) => therapist.offers_outcall === true);
  }

  if (filters.availableNow) {
    const now = new Date();
    therapists = therapists.filter((therapist) => isAvailableNow(therapist, now));
  }

  if (filters.verified) {
    therapists = therapists.filter(
      (therapist) =>
        therapist.is_verified_identity === true || therapist.is_verified_profile === true,
    );
  }

  if (filters.lgbtq) {
    therapists = therapists.filter((therapist) => therapist.lgbtq_affirming === true);
  }

  if (filters.featured) {
    therapists = therapists.filter((therapist) => therapist.is_featured === true);
  }

  if (filters.offers) {
    therapists = therapists.filter(
      (therapist) =>
        hasOfferValue(therapist.promotions) ||
        hasOfferValue(therapist.regular_discounts) ||
        hasOfferValue(therapist.day_of_week_discount),
    );
  }

  if (typeof filters.minPrice === "number" && Number.isFinite(filters.minPrice)) {
    const floor = filters.minPrice;
    therapists = therapists.filter((therapist) => {
      const price = startingPrice(therapist);
      return price !== null && price >= floor;
    });
  }

  if (typeof filters.maxPrice === "number" && Number.isFinite(filters.maxPrice)) {
    const cap = filters.maxPrice;
    therapists = therapists.filter((therapist) => {
      const price = startingPrice(therapist);
      return price !== null && price <= cap;
    });
  }

  if (filters.tier) {
    therapists = therapists.filter((therapist) => resolveTier(therapist) === filters.tier);
  }

  if (
    typeof filters.minExperienceYears === "number" &&
    Number.isFinite(filters.minExperienceYears)
  ) {
    const currentYear = new Date().getUTCFullYear();
    therapists = therapists.filter((therapist) => {
      const years =
        therapist.years_experience ??
        (therapist.start_year ? Math.max(0, currentYear - therapist.start_year) : 0);
      return years >= filters.minExperienceYears!;
    });
  }

  if (filters.sort === "distance") {
    therapists = [...therapists].sort(
      (a, b) =>
        (a.distance_miles ?? Number.MAX_SAFE_INTEGER) -
          (b.distance_miles ?? Number.MAX_SAFE_INTEGER) || compareByRank(a, b),
    );
  } else if (filters.sort === "featured") {
    therapists = [...therapists].sort(
      (a, b) =>
        Number(b.is_featured ?? false) - Number(a.is_featured ?? false) || compareByRank(a, b),
    );
  } else if (filters.sort === "reviews") {
    therapists = [...therapists].sort(
      (a, b) => (b.review_count ?? 0) - (a.review_count ?? 0) || compareByRank(a, b),
    );
  } else if (filters.sort === "price") {
    therapists = [...therapists].sort((a, b) => {
      const priceA = startingPrice(a);
      const priceB = startingPrice(b);
      if (priceA === null && priceB === null) return compareByRank(a, b);
      if (priceA === null) return 1;
      if (priceB === null) return -1;
      return priceA - priceB || compareByRank(a, b);
    });
  } else if (filters.sort === "rating") {
    therapists = [...therapists].sort(
      (a, b) =>
        (b.rating_average ?? 0) - (a.rating_average ?? 0) ||
        (b.review_count ?? 0) - (a.review_count ?? 0) ||
        compareByRank(a, b),
    );
  }

  return therapists;
}

/** Backwards-compatible unpaginated search used by SEO/service pages. */
export async function searchTherapists(filters: DirectoryFilters): Promise<TherapistListing[]> {
  const [source, origin] = await Promise.all([getVisibleTherapists(), searchOrigin(filters)]);
  return filterTherapistsInMemory(source, filters, origin);
}

type SearchRpcRow = TherapistListing & { total_count: number | null };

type RpcClient = {
  rpc: (name: string, args: Record<string, unknown>) => PromiseLike<QueryResult>;
};

function isMissingSearchRpc(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("search_directory_profiles_v2") ||
    (normalized.includes("schema cache") && normalized.includes("function"))
  );
}

/**
 * Production search path: filters, ranking, count and pagination happen in
 * Postgres. The v2 RPC is additive, so the current site's data path is not
 * changed during cutover. A fallback keeps deploy order safe.
 */
export async function searchTherapistsPage(
  filters: DirectoryFilters,
): Promise<DirectorySearchResult> {
  const page = Math.max(1, Math.trunc(filters.page ?? 1) || 1);
  const pageSize = Math.min(48, Math.max(1, Math.trunc(filters.pageSize ?? 24) || 24));

  if (directoryUnavailable()) return { items: [], total: 0, page, pageSize };

  const enhancedSearch =
    Boolean(filters.radiusMiles || filters.featured || filters.offers) ||
    filters.sort === "distance" ||
    filters.sort === "featured" ||
    filters.sort === "reviews";
  if (enhancedSearch) {
    const all = await searchTherapists(filters);
    const offset = (page - 1) * pageSize;
    return {
      items: all.slice(offset, offset + pageSize),
      total: all.length,
      page,
      pageSize,
    };
  }

  const client = createAnonClient();
  const rpcClient = client as unknown as RpcClient;
  const { data, error } = await rpcClient.rpc("search_directory_profiles_v2", {
    p_city_slug: filters.city ?? null,
    p_state_slug: filters.state ?? null,
    p_service: filters.service ?? null,
    p_query: filters.query ?? null,
    p_goal_search: directoryObjectiveSearchValue(filters.goal) ?? null,
    p_session: filters.session ?? null,
    p_available_now: filters.availableNow ?? false,
    p_verified: filters.verified ?? false,
    p_lgbtq: filters.lgbtq ?? false,
    p_min_price: filters.minPrice ?? null,
    p_max_price: filters.maxPrice ?? null,
    p_tier: filters.tier ?? null,
    p_min_experience: filters.minExperienceYears ?? null,
    p_sort: filters.sort ?? "recommended",
    p_limit: pageSize,
    p_offset: (page - 1) * pageSize,
  });

  if (!error) {
    const rows = (data ?? []) as SearchRpcRow[];
    const total = Number(rows[0]?.total_count ?? 0);
    const items = rows.map(({ total_count: _totalCount, ...row }) => row);
    return { items, total, page, pageSize };
  }

  if (!isMissingSearchRpc(error.message)) {
    throw new Error(`Failed to search directory: ${error.message}`);
  }

  if (!warnedAboutSearchRpc) {
    warnedAboutSearchRpc = true;
    console.warn(
      "[@masseurmatch/db] search_directory_profiles_v2 RPC is not available yet — " +
        "falling back to in-memory search until the additive migration is applied.",
    );
  }

  const all = await searchTherapists(filters);
  const offset = (page - 1) * pageSize;
  return {
    items: all.slice(offset, offset + pageSize),
    total: all.length,
    page,
    pageSize,
  };
}

type ServiceRow = {
  slug: string | null;
  service_categories: string[] | null;
  massage_techniques: string[] | null;
};

/** Distinct services/techniques across visible therapists, for the filter UI. */
export const getServiceCategories = unstable_cache(
  async (): Promise<string[]> => {
    if (directoryUnavailable()) return [];

    const rows = await selectProfiles<ServiceRow>(
      ["slug", "service_categories", "massage_techniques"],
      (client, select) =>
        client
          .from("profiles")
          .select(select)
          .eq("profile_status", APPROVED)
          .eq("visibility_status", PUBLIC),
    );
    const seen = new Set<string>();

    for (const row of rows) {
      if (!isRoutable(row)) continue;
      for (const entry of [...(row.service_categories ?? []), ...(row.massage_techniques ?? [])]) {
        if (entry.trim()) seen.add(entry.trim());
      }
    }

    return [...seen].sort((a, b) => a.localeCompare(b));
  },
  ["directory", "services"],
  { revalidate: DIRECTORY_REVALIDATE_SECONDS, tags: [DIRECTORY_CACHE_TAG] },
);
