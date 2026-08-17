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

/**
 * Columns that only exist once their migration has run
 * (`migrations/courtesy_tier_grants.sql`, `migrations/visibility_spikes.sql`).
 *
 * Optional so the site does not require a particular deploy order. Shipping the
 * code first would otherwise fail every query with `column profiles.… does not
 * exist` and take the whole build with it — and CI would not catch it, because
 * CI has no database credentials and skips these queries entirely. Green CI plus
 * a broken production build is worth a few lines to avoid.
 */
const OPTIONAL_COLUMNS = ["subscription_status", "tier_granted_until", "spike_until"];

/**
 * Which optional columns the database has told us are absent.
 *
 * Tracked one by one rather than as a group. The two migrations land
 * independently, and dropping `spike_until` because `tier_granted_until` is
 * missing would silently stop Spikes from ranking until an unrelated migration
 * ran — a bug with no error message anywhere.
 *
 * Process-lifetime: one failed query is enough to know, and re-probing every
 * request would double the load on a site that is already degraded. A deploy
 * after the migration starts a fresh process with this cleared.
 */
const missingColumns = new Set<string>();

function columnsFor(base: string[]): string {
  return base.filter((c) => !missingColumns.has(c)).join(",");
}

/**
 * The optional columns named in a PostgREST "does not exist" error.
 *
 * Empty when the error is about something else — a real failure must not be
 * quietly retried into an empty directory.
 *
 * Deliberately does NOT skip columns already known missing. Static generation
 * runs these concurrently, so by the time the second query fails the first has
 * already recorded the column; filtering here made that second query find
 * nothing to drop and throw. The set is for building the next SELECT, not for
 * deciding whether to retry.
 */
function missingOptionalColumns(message: string): string[] {
  if (!message.includes("does not exist")) return [];
  return OPTIONAL_COLUMNS.filter((c) => message.includes(c));
}

/** What stops working while `column` is absent. */
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
  // Free-form jsonb. Parsed defensively in `travel.ts` rather than trusted:
  // the dashboard, an admin CMS and (in the old system) a voice agent all
  // write to it, and this value reaches public pages.
  "travel_schedule",
  "updated_at",
];

const DETAIL_COLUMNS = [
  ...LISTING_COLUMNS,
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
];

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

/**
 * Run a profiles query, dropping the grant columns if the database lacks them.
 *
 * Retries exactly once, and only for that specific error. Anything else is a
 * real failure and is rethrown — a query that silently returns nothing would
 * empty the directory, which is far worse than a failed build.
 *
 * Without the grant columns, `resolveTier` sees no deadline on any row and
 * falls back to trusting `subscription_tier` — the behaviour that shipped
 * before this feature. Degrading to "as it was yesterday" is the right
 * direction while a migration is pending.
 */
async function selectProfiles<T>(
  columns: string[],
  build: (client: ReturnType<typeof createAnonClient>, select: string) => PromiseLike<QueryResult>,
): Promise<T[]> {
  const client = createAnonClient();

  for (const attempt of [0, 1]) {
    const { data, error } = await build(client, columnsFor(columns));
    if (!error) return (data ?? []) as unknown as T[];

    // Deliberately not gated on "have we already noticed?". Static generation
    // runs these queries concurrently: the first failure records the column,
    // and every other in-flight query has already failed by then. Gating on
    // that made exactly one call retry and the rest throw.
    const absent = attempt === 0 ? missingOptionalColumns(error.message) : [];
    if (absent.length > 0) {
      // Warn once per column, not once per concurrent query, or a 96-page
      // build prints the same line ninety-six times.
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

type QueryResult = { data: unknown; error: { message: string } | null };

async function fetchVisibleListings(): Promise<TherapistListing[]> {
  if (directoryUnavailable()) return [];

  const rows = await selectProfiles<TherapistListing>(LISTING_COLUMNS, (client, select) =>
    client
      .from("profiles")
      .select(select)
      .eq("profile_status", APPROVED)
      .eq("visibility_status", PUBLIC),
  );

  return rows.filter(isRoutable).sort(compareByRank);
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

  const rows = await selectProfiles<ProfileDetail>(DETAIL_COLUMNS, (c, select) =>
    c
      .from("profiles")
      .select(select)
      .eq("profile_status", APPROVED)
      .eq("visibility_status", PUBLIC)
      .eq("slug", slug)
      .limit(1),
  );

  const profile = rows[0];
  if (!profile) return null;

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
