import { normaliseOrigin } from "@masseurmatch/config/origin";

/**
 * This app's own public origin.
 *
 * Needed because Google sign-in has to name, up front, where Supabase should
 * send the person back to. Mirrors `dashboardUrl()` in the dashboard app —
 * explicit variable, then Vercel's production host, then the local port — with
 * the same deliberate omission: **the request's own `Host` header is never
 * consulted.**
 *
 * That omission is the whole point of the function. A caller controls `Host`.
 * Feeding it into `redirectTo` would let someone start a sign-in that returns a
 * real auth code to a host they chose. Supabase's redirect allow-list would
 * refuse it, but "another product's dashboard is configured correctly" is not a
 * control this file should lean on.
 *
 * The cost is that a preview deployment sends its Google round-trip back to
 * production. That is the right trade: preview URLs are not in the Supabase
 * allow-list either, so the return leg would fail from them regardless.
 *
 * The variable is normalised rather than trusted — `NEXT_PUBLIC_DASHBOARD_URL`
 * was once set to a bare hostname with no scheme and three separate things
 * broke quietly. See `normaliseOrigin`.
 */
export function adminUrl(): string {
  const explicit = normaliseOrigin(process.env.NEXT_PUBLIC_ADMIN_URL);
  if (explicit) return explicit;

  const productionHost = normaliseOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  if (productionHost) return productionHost;

  // The public site runs on 3000 locally, the dashboard on 3001, admin on 3002.
  return "http://localhost:3002";
}
