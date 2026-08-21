import { profilePath } from "@masseurmatch/db/actions/directory-config";

/**
 * Links back to the public site (`apps/web`).
 *
 * Mirrors the fallback chain in `apps/web/src/lib/site.ts` so the two apps
 * agree on the origin: explicit env first, then Vercel's own production URL,
 * then localhost. The dashboard runs on 3001 and the site on 3000, so the local
 * fallback differs — getting that wrong sends "view public profile" to a page
 * on the dashboard's own port that does not exist.
 */
export function publicSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (productionHost) return `https://${productionHost}`;

  return "http://localhost:3000";
}

/**
 * Absolute URL of a therapist's public page, or null when it has none yet.
 *
 * Returns null unless slug, city and state are all present — the public route
 * is `/[state]/[city]/[slug]`, so a partial profile has no page to link to and
 * a "preview" button pointing at a 404 is worse than no button.
 */
export function publicProfileUrl(profile: {
  slug: string | null;
  city: string | null;
  state: string | null;
}): string | null {
  if (!profile.slug) return null;
  const path = profilePath({ ...profile, slug: profile.slug });
  return path ? `${publicSiteUrl()}${path}` : null;
}
