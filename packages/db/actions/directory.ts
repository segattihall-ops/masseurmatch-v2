import "server-only";

import { unstable_cache } from "next/cache";

import { createAnonClient, hasSupabaseCredentials } from "../client";
import {
  DIRECTORY_CACHE_TAG,
  DIRECTORY_REVALIDATE_SECONDS,
  citySlug,
  compareByRank,
  type CityListing,
  type DirectoryFilters,
  type ProfileDetail,
  type TherapistListing,
} from "./directory-config";

/**
 * Public directory data access.
 *
 * Everything here reads through the **anon** client, so Postgres RLS is the
 * access control: a logged-out visitor and this code see exactly the same
 * rows. The explicit `profile_status`/`visibility_status` filters mirror the
 * live policy rather than replacing it — belt and braces, and they let the
 * same queries run under a service-role client without widening what ships.
 *
 * Why `profiles` and not the `public_therapists` view or the ranking RPC:
 * the anon role has no GRANT on that view (PostgREST returns 42501), and
 * `search_public_therapists` currently errors server-side. `profiles` and
 * `profile_photos` are the only relations anon can read today.
 */

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
  "avatar_url",
  "photo_url",
  "service_categories",
  "massage_techniques",
  "specialties",
  "subscription_tier",
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
  "updated_at",
].join(",");

const DETAIL_COLUMNS = [
  LISTING_COLUMNS,
  "bio",
  "tagline",
  "years_experience",
  "languages",
  "lgbtq_affirming",
  "website",
  "latitude",
  "longitude",
  "zip_code",
  "seo_title",
  "seo_description",
].join(",");

/**
 * The visibility gate, mirroring the live RLS policy on `profiles`:
 * approved + public, and neither suspended nor banned. RLS already enforces
 * this for the anon key; restating it keeps the intent legible and keeps the
 * queries correct if they are ever run with a service-role client.
 */
const APPROVED = "approved";
const PUBLIC = "public";

/** Rows without a slug can never have a URL, so they are not part of the site. */
function isRoutable(row: { slug: string | null }): boolean {
  return Boolean(row.slug);
}

let warnedAboutCredentials = false;

/**
 * Without credentials the directory is empty rather than fatal.
 *
 * A build with no database (CI, a fresh clone) then produces the site shell —
 * home, static pages, and a sitemap of static routes — instead of failing on
 * `generateStaticParams`. It is deliberately loud once, so an unconfigured
 * production deploy is obvious in the logs rather than silently blank.
 */
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

async function fetchVisibleListings(): Promise<TherapistListing[]> {
  if (directoryUnavailable()) return [];

  const { data, error } = await createAnonClient()
    .from("profiles")
    .select(LISTING_COLUMNS)
    .eq("profile_status", APPROVED)
    .eq("visibility_status", PUBLIC);

  if (error) throw new Error(`Failed to load directory: ${error.message}`);

  return ((data ?? []) as unknown as TherapistListing[]).filter(isRoutable).sort(compareByRank);
}

/** Every publicly visible, routable therapist. Cached for an hour. */
export const getVisibleTherapists = unstable_cache(fetchVisibleListings, ["directory", "all"], {
  revalidate: DIRECTORY_REVALIDATE_SECONDS,
  tags: [DIRECTORY_CACHE_TAG],
});

/**
 * Cities derived from the visible therapists.
 *
 * The `cities` table is not readable by anon (no GRANT), and every profile's
 * `canonical_city_slug` is currently null — so the city list is derived from
 * the profiles themselves. That also means a city page never exists with zero
 * therapists on it, which is what we want for SEO.
 */
export const getCities = unstable_cache(
  async (): Promise<CityListing[]> => {
    const therapists = await fetchVisibleListings();
    const byKey = new Map<string, CityListing>();

    for (const therapist of therapists) {
      if (!therapist.city || !therapist.state) continue;

      const state = therapist.state.toLowerCase();
      const city = citySlug(therapist.city);
      const key = `${state}/${city}`;
      const existing = byKey.get(key);

      if (existing) {
        existing.therapistCount += 1;
      } else {
        byKey.set(key, {
          citySlug: city,
          stateSlug: state,
          name: therapist.city,
          state: therapist.state,
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

/** Therapists in one city, already ranked. */
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

/** One city's metadata, or null when nothing is listed there. */
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

  const { data, error } = await client
    .from("profiles")
    .select(DETAIL_COLUMNS)
    .eq("profile_status", APPROVED)
    .eq("visibility_status", PUBLIC)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`Failed to load profile "${slug}": ${error.message}`);
  if (!data) return null;

  const profile = data as unknown as ProfileDetail;

  // Approved photos only — enforced by RLS, restated here for intent.
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

/** Search with optional city and service-category filters. */
export async function searchTherapists(filters: DirectoryFilters): Promise<TherapistListing[]> {
  let therapists = await getVisibleTherapists();

  if (filters.city) {
    const wanted = filters.city.toLowerCase();
    therapists = therapists.filter(
      (therapist) => therapist.city !== null && citySlug(therapist.city) === wanted,
    );
  }

  if (filters.service) {
    const wanted = filters.service.toLowerCase();
    therapists = therapists.filter((therapist) =>
      [...(therapist.service_categories ?? []), ...(therapist.massage_techniques ?? [])].some(
        (entry) => entry.toLowerCase() === wanted,
      ),
    );
  }

  if (filters.query) {
    const wanted = filters.query.toLowerCase();
    therapists = therapists.filter((therapist) =>
      [therapist.display_name, therapist.headline, therapist.city]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(wanted)),
    );
  }

  return therapists;
}

/** Distinct service categories across visible therapists, for the filter UI. */
export const getServiceCategories = unstable_cache(
  async (): Promise<string[]> => {
    const therapists = await fetchVisibleListings();
    const seen = new Set<string>();

    for (const therapist of therapists) {
      for (const entry of therapist.service_categories ?? []) {
        if (entry.trim()) seen.add(entry.trim());
      }
    }

    return [...seen].sort((a, b) => a.localeCompare(b));
  },
  ["directory", "services"],
  { revalidate: DIRECTORY_REVALIDATE_SECONDS, tags: [DIRECTORY_CACHE_TAG] },
);
