/**
 * Courtesy tier grants.
 *
 * `profiles.subscription_tier` is not a statement that anyone paid. Measured in
 * production on 2026-08-17: 26 profiles carried a paid tier while
 * `therapist_subscriptions` and `billing_events` were both empty and no profile
 * had a `subscription_status` at all. The one PayPal subscription that ever
 * existed expired without being approved. Those tiers were set by hand.
 *
 * They are being wound down with notice rather than revoked outright, so each
 * grant carries a deadline in `profiles.tier_granted_until`.
 *
 * This module owns the *expiry* rule only — whether the claimed tier still
 * applies. Mapping a tier name to photo limits and prices belongs to
 * `@masseurmatch/billing`, which depends on this package; putting the rule
 * there instead would make the dependency circular, and duplicating it in both
 * would let the two drift into disagreeing about who is entitled to what.
 */

/** Statuses that mean a real subscription is paying for the tier. */
const PAID_STATUSES = new Set(["active", "trialing"]);

export type TierGrantFields = {
  subscription_tier?: string | null;
  subscription_status?: string | null;
  tier_granted_until?: string | Date | null;
};

/**
 * The tier that currently applies, as a raw string.
 *
 * Returns `"free"` rather than null so callers cannot forget to handle the
 * revoked case. Resolution order:
 *
 *   1. A live subscription — paid for, so no deadline applies to it.
 *   2. A courtesy grant whose deadline is still in the future.
 *   3. Otherwise `"free"`.
 *
 * Evaluated on read, deliberately. A scheduled job that rewrites rows can fail
 * silently and leave someone on a tier they should have lost; resolving here
 * means the grant stops applying everywhere the moment it lapses, with nothing
 * to operate and nothing to re-run.
 */
export function resolveTier(profile: TierGrantFields, now: Date = new Date()): string {
  const claimed = (profile.subscription_tier ?? "").trim().toLowerCase();
  if (!claimed || claimed === "free") return "free";

  const status = (profile.subscription_status ?? "").trim().toLowerCase();
  if (PAID_STATUSES.has(status)) return claimed;

  const until = profile.tier_granted_until;
  if (!until) return "free";

  const deadline = until instanceof Date ? until : new Date(until);
  // An unparseable date must not silently grant the top tier forever.
  if (Number.isNaN(deadline.getTime())) return "free";

  return deadline.getTime() > now.getTime() ? claimed : "free";
}

/** True while a profile holds an unpaid tier that carries a deadline. */
export function isCourtesyGrant(profile: TierGrantFields): boolean {
  const claimed = (profile.subscription_tier ?? "").trim().toLowerCase();
  if (!claimed || claimed === "free") return false;
  const status = (profile.subscription_status ?? "").trim().toLowerCase();
  if (PAID_STATUSES.has(status)) return false;
  return Boolean(profile.tier_granted_until);
}

/** Whether a courtesy grant has already lapsed. False for paid subscribers. */
export function grantHasLapsed(profile: TierGrantFields, now: Date = new Date()): boolean {
  return isCourtesyGrant(profile) && resolveTier(profile, now) === "free";
}
