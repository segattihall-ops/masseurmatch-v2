import { getCities } from "@masseurmatch/db/actions/directory";
import { cityPath } from "@masseurmatch/db/actions/directory-config";

/**
 * Resolving an old city URL onto v2's `/{state}/{city}`.
 *
 * The old site had four shapes for the same page:
 *
 *   /{city}                          ← the only one in the sitemap
 *   /cities/{city}
 *   /states/{state}/cities/{city}
 *   /providers/{citySlug}
 *
 * Only the bare form carries measured search equity, but the other three may
 * hold inbound links from elsewhere, and a redirect costs nothing.
 *
 * Matching is against the live city list rather than a wildcard. That matters
 * for the bare `/{city}` form specifically: a catch-all at the site root would
 * shadow `/about`, `/faq`, `/search` and every future top-level page. Here the
 * check is "is this string a city we actually have", and anything else falls
 * through to a 404.
 */
export async function legacyCityTarget(slug: string): Promise<string | null> {
  const wanted = slug.trim().toLowerCase();
  if (!wanted) return null;

  const cities = await getCities();
  const match = cities.find((city) => city.citySlug === wanted);
  return match ? cityPath(match) : null;
}
