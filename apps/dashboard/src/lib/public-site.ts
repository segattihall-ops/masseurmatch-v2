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
 * Absolute URL of a therapist's public page, or null when there is no public
 * page to open.
 *
 * The public directory only serves approved + public profiles. Callers normally
 * pass a complete dashboard profile, so checking those lifecycle fields here
 * prevents a draft, pending, suspended or hidden profile from receiving a
 * button that can only lead to a 404. They remain optional so this helper can
 * still be used with a slug-only object where visibility has already been
 * established by the caller.
 *
 * `/therapists/{slug}` is the stable compatibility URL: it is the profile URL
 * currently served by the live public site, and v2 keeps that route as a
 * permanent redirect to the canonical `/{state}/{city}/{slug}` page. Using the
 * compatibility URL keeps dashboard links working both before and after the
 * public-site cutover and does not require location fields to be populated.
 */
export function publicProfileUrl(profile: {
  slug: string | null;
  profile_status?: string | null;
  visibility_status?: string | null;
}): string | null {
  if (profile.profile_status !== undefined && profile.profile_status !== "approved") {
    return null;
  }
  if (profile.visibility_status !== undefined && profile.visibility_status !== "public") {
    return null;
  }

  const slug = profile.slug?.trim();
  if (!slug) return null;
  return `${publicSiteUrl()}/therapists/${encodeURIComponent(slug)}`;
}
