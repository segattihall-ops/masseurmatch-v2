/** Canonical origin, used for metadata, canonicals, OpenGraph and the sitemap. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);

export const SITE_NAME = "MasseurMatch";

export const SITE_DESCRIPTION =
  "A premium directory of verified male massage therapists — real availability, honest pricing, no guesswork.";

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
