/**
 * Availability states — `profiles.current_status`.
 *
 * These are the six values the production `current_status` CHECK constraint
 * accepts. The constraint itself is not reproduced in this repository's
 * migrations, which is exactly why the literals belong in one file: nothing
 * here fails at typecheck if a call site invents a seventh, but Postgres will
 * reject the write with `23514` at runtime, in production, on a real
 * therapist's save. This is the same failure mode `visibility.ts` was written
 * to prevent, and the same remedy.
 *
 * **`current_status` is not `visibility_status`.** They are different columns
 * with different value sets and different owners, and conflating them is a
 * known defect in the legacy editor, which renders one and writes the other:
 *
 *   current_status     what the therapist is doing right now. Provider-editable.
 *   visibility_status  whether the listing is published at all. Platform state,
 *                      guarded by `prevent_sensitive_profile_mutation` — a
 *                      provider JWT cannot change it. See `visibility.ts`.
 *
 * A profile editor may offer the first and must not offer the second.
 */

export const CURRENT_STATUSES = [
  "available",
  "mobile",
  "traveling",
  "hidden",
  "active",
  "inactive",
] as const;

export type CurrentStatus = (typeof CURRENT_STATUSES)[number];

/** Wording shown to the therapist. The stored value is always the key. */
export const CURRENT_STATUS_LABELS: Record<CurrentStatus, string> = {
  available: "Available — taking bookings as normal",
  mobile: "Mobile — working out-call only",
  traveling: "Traveling — working away from my usual area",
  hidden: "Hidden — not showing an availability state",
  active: "Active — practising, no specific availability claim",
  inactive: "Inactive — not taking bookings at the moment",
};

/** True when `value` is one of the six states the database accepts. */
export function isCurrentStatus(value: unknown): value is CurrentStatus {
  return typeof value === "string" && (CURRENT_STATUSES as readonly string[]).includes(value);
}

/** Narrow a raw column value. Anything unrecognised reads as no claim made. */
export function toCurrentStatus(value: unknown): CurrentStatus {
  return isCurrentStatus(value) ? value : "hidden";
}
