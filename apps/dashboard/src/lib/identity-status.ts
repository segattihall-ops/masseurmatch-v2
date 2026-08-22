/**
 * Identity-verification status vocabulary used by the provider UI.
 *
 * The active verification path is manual review by a MasseurMatch admin.
 * Historical database rows may still contain older status synonyms, so reads
 * remain defensive without treating any retired provider as an active workflow.
 */

export type IdentityStatus =
  "not_started" | "pending" | "processing" | "requires_input" | "failed" | "canceled" | "verified";

/**
 * Collapse any stored status onto the values the provider UI understands.
 *
 * `approved`/`rejected`/`reviewing`/`expired` remain accepted as historical
 * synonyms. Anything unrecognised falls back to `not_started`; a false negative
 * can ask for another review, while a false positive could display a trust badge
 * that no admin approved.
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

/** Whether a stored manual-review status represents an approved identity. */
export function isIdentityVerified(value: unknown): boolean {
  return normalizeIdentityStatus(value) === "verified";
}
