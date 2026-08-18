/**
 * This app's own public origin.
 *
 * Needed because the confirmation email Supabase sends has to point back here.
 * The chain mirrors `publicSiteUrl()` in `./public-site.ts` — explicit
 * variable, then Vercel's production host, then the local port — with one
 * deliberate omission: the request's own `Host` header is never consulted.
 *
 * A caller can set `Host` to anything. Feeding that into `emailRedirectTo`
 * would let someone request a confirmation email for their own address that
 * links to a host they control, carrying a real auth code. Supabase's redirect
 * allow-list would reject it, but relying on a setting in another product's
 * dashboard to prevent that is not a control this file should lean on.
 *
 * The cost is that preview deployments email a link to production. That is the
 * right trade: preview URLs are not in the Supabase allow-list either, so the
 * link would not work from them regardless. See docs/DEPLOY.md.
 */
export function dashboardUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_DASHBOARD_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (productionHost) return `https://${productionHost}`;

  // The dashboard runs on 3001 locally; the public site has 3000.
  return "http://localhost:3001";
}
