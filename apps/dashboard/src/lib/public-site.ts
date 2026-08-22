const LIVE_PUBLIC_SITE_URL = "https://www.masseurmatch.com";

/**
 * Links back to the public site.
 *
 * `VERCEL_PROJECT_PRODUCTION_URL` cannot be used here: in the dashboard project
 * it points at the dashboard itself, not the public website. That produced URLs
 * such as `dashboard-host/tx/dallas/slug`, which have no matching route.
 *
 * An explicit public-site origin always wins. Local development falls back to
 * the web app on port 3000; deployed/production dashboard builds fall back to
 * the current canonical public domain.
 */
export function publicSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  if (process.env.VERCEL_ENV || process.env.NODE_ENV === "production") {
    return LIVE_PUBLIC_SITE_URL;
  }

  return "http://localhost:3000";
}

/**
 * Absolute URL of a therapist's public page, or null when it has no slug yet.
 *
 * `/therapists/{slug}` is the stable compatibility URL: it is the profile URL
 * currently served by the live public site, and v2 keeps that route as a
 * permanent redirect to the canonical `/{state}/{city}/{slug}` page. Using the
 * compatibility URL keeps dashboard links working both before and after the
 * public-site cutover and does not require location fields to be populated.
 */
export function publicProfileUrl(profile: { slug: string | null }): string | null {
  const slug = profile.slug?.trim();
  if (!slug) return null;
  return `${publicSiteUrl()}/therapists/${encodeURIComponent(slug)}`;
}
