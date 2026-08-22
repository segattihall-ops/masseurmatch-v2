/**
 * The identity verification vocabulary, normalised.
 *
 * `identity_verifications.status` accepts eleven values by CHECK constraint,
 * spanning the Stripe Identity path this platform no longer uses and the manual
 * review path it does. Admin review writes **`verified`** on approval and
 * **`requires_input`** on rejection — not `approved`/`rejected`, which the
 * column also permits but which nothing actually sets.
 *
 * Branching on the wrong pair does not fail loudly: it reports a verified
 * therapist as unverified and an actionable rejection as "nothing here", which
 * is why every provider-facing read goes through this function rather than
 * comparing the raw column.
 */

export type IdentityStatus =
  "not_started" | "pending" | "processing" | "requires_input" | "failed" | "canceled" | "verified";

/**
 * Collapse any stored status onto the seven the provider UI understands.
 *
 * The synonyms are deliberate. `approved`/`rejected`/`reviewing`/`expired` are
 * all legal in the CHECK constraint, so a row could carry one — from an older
 * write or a future one — and an unmapped value must never read as "verified".
 * Anything unrecognised falls back to `not_started`, the only safe default: it
 * costs a therapist one repeated submission, where a wrong "verified" hands out
 * a trust badge nobody checked.
 */
export function normalizeIdentityStatus(value: unknown): IdentityStatus {
  const status = typeof value === "string" ? value.trim().toLowerCase() : "";

  if (status === "verified" || status === "approved") return "verified";
  if (status === "pending" || status === "reviewing") return "pending";
  if (status === "processing") return "processing";
  if (status === "requires_input" || status === "rejected") return "requires_input";
  if (status === "failed" || status === "expired") return "failed";
  if (status === "canceled" || status === "cancelled") return "canceled";
  return "not_started";
}

/** Whether a stored status entitles the verified badge. */
export function isIdentityVerified(value: unknown): boolean {
  return normalizeIdentityStatus(value) === "verified";
}
