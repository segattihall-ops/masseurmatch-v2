/**
 * POST /api/webhooks/paypal — the URL PayPal is already registered against.
 *
 * The live webhook `1VH31349P8377213N` points at
 * `https://www.masseurmatch.com/api/webhooks/paypal`, a path the old site
 * serves and v2 does not: v2 names it `/api/webhooks/billing` because the
 * handler is provider-agnostic. The day the domain moves to v2, every PayPal
 * delivery would 404 and billing would stop with no error anywhere we look.
 *
 * Repointing the webhook is not an option worth relying on. PayPal refuses to
 * register a URL that already exists on the account, so the fix would be
 * delete-then-recreate against live billing, and any delivery in that window is
 * simply lost. Serving both paths costs nothing and removes the cutover step
 * entirely.
 *
 * This is an alias, not a fork. It re-exports the billing handler rather than
 * repeating it, so signature verification, idempotency and the rate limit
 * cannot drift apart between the two URLs — a second copy of this logic is how
 * one of them ends up silently unverified.
 *
 * Safe to delete once PayPal is verified to be delivering to
 * `/api/webhooks/billing` and no other provider is registered here.
 */
export { POST } from "../billing/route";

/**
 * Restated, not re-exported.
 *
 * Next.js reads route segment config statically, so a re-exported `runtime`
 * is invisible to it — the build says so and silently falls back to the
 * default. That would have left this path on a different runtime from the
 * handler it shares, which is exactly the drift the alias exists to prevent:
 * verification needs `node:crypto`.
 *
 * These two must stay in step with `../billing/route`. They are the only
 * things in this file that can.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
