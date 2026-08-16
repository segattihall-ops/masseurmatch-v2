import "server-only";

/**
 * Canonical origin, used for metadata, canonicals, OpenGraph and the sitemap.
 *
 * Resolved once, in preference order:
 *
 *   1. `NEXT_PUBLIC_SITE_URL`          — the real public domain. Always wins.
 *   2. `VERCEL_PROJECT_PRODUCTION_URL` — the project's stable production
 *      domain. Set by Vercel on every deployment including previews, which is
 *      what we want: a preview should still declare the production URL as
 *      canonical rather than pointing search engines at itself.
 *   3. `VERCEL_URL`                    — this deployment's own hostname. Only
 *      reached before a production domain is assigned.
 *   4. `http://localhost:3000`         — local development.
 *
 * The Vercel variables are bare hostnames with no scheme, so https is added.
 *
 * This module is `server-only` on purpose. Steps 2–4 read non-`NEXT_PUBLIC_`
 * variables, which Next.js resolves to `undefined` in the browser bundle — a
 * client import would silently fall through to localhost and emit wrong
 * canonical URLs. The guard turns that into a build error instead.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit;

  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (productionHost) return `https://${productionHost}`;

  const deploymentHost = process.env.VERCEL_URL;
  if (deploymentHost) return `https://${deploymentHost}`;

  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl().replace(/\/$/, "");

export const SITE_NAME = "MasseurMatch";

export const SITE_DESCRIPTION =
  "A premium directory of verified male massage therapists — real availability, honest pricing, no guesswork.";

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
