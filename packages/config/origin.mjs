/**
 * Turning a configured origin into one a browser and an email client can follow.
 *
 * ---------------------------------------------------------------------------
 * Why this exists
 * ---------------------------------------------------------------------------
 * `NEXT_PUBLIC_DASHBOARD_URL` was set in production as
 *
 *     dashboard.masseurmatch.com
 *
 * with no scheme, which is how anyone would naturally type a hostname. Nothing
 * rejected it, and three things quietly broke:
 *
 *   - `${origin}/sign-up` in an `href` became a *relative* path, so the public
 *     site's "Create your account" button resolved to
 *     `masseurmatch-v2.vercel.app/dashboard.masseurmatch.com/sign-up`.
 *   - The same string in a Next.js redirect destination did the same thing —
 *     observed, not theorised: `/signup` returned a 307 to that exact URL.
 *   - Worst of the three: it goes into `emailRedirectTo` on sign-up, where a
 *     value that is not an absolute URL cannot be matched against Supabase's
 *     allow-list, so the confirmation link in the email has nowhere valid to go.
 *
 * A hostname with no scheme is the single most likely way to get this variable
 * wrong, so it is now normalised rather than trusted. `https` is assumed because
 * every deployment of this project is https; a value that already names a scheme
 * — including `http://localhost:3000` — is left exactly as it is.
 */

/**
 * Normalise a configured origin, or return null when there is nothing usable.
 *
 * Returns null for an empty or whitespace-only value so callers can keep
 * treating "not configured" as its own case rather than as an empty string.
 *
 * @param {string | undefined | null} value
 * @returns {string | null}
 */
export function normaliseOrigin(value) {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return null;

  // Any scheme, not just http(s): a deployment behind something unusual should
  // keep whatever it was given rather than have `https://` prepended to it.
  const withScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;

  return withScheme.replace(/\/+$/, "");
}
