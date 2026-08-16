/**
 * Profile visibility states.
 *
 * These are not a convention — they are enforced. `profiles` carries
 *
 *   CHECK (visibility_status = ANY (ARRAY['hidden','public','paused','suspended']))
 *
 * so a value outside this set is rejected by Postgres with `23514`, at write
 * time, in production. It is not a type error and no test that stubs the
 * database will catch it.
 *
 * This file exists because the code wrote `"private"` — a word that appears
 * nowhere in the schema — from five call sites, including the one that runs
 * when a therapist signs in for the first time. Every one of those writes
 * would have failed. The literal is now written once, here.
 *
 * `hidden` is the word the database uses for "not listed". There is no
 * `private`.
 */

export const VISIBILITY_STATUSES = ["hidden", "public", "paused", "suspended"] as const;

export type VisibilityStatus = (typeof VISIBILITY_STATUSES)[number];

/**
 * Listed in the public directory.
 *
 * Note the second, easily-missed constraint that rides along with this value:
 *
 *   CHECK (visibility_status IS DISTINCT FROM 'public'
 *          OR (city is non-empty AND (phone OR phone_number) is non-empty))
 *
 * A profile cannot go public without a city and a contact number. Onboarding
 * requires both, so the approve path satisfies it — but anything that sets
 * `public` on a row it did not validate will fail.
 */
export const PUBLIC: VisibilityStatus = "public";

/** Not listed: unsubmitted, rejected, or otherwise withheld. The default. */
export const HIDDEN: VisibilityStatus = "hidden";

/**
 * Temporarily unlisted, expected to return.
 *
 * Used when a subscription lapses. Deliberately distinct from `hidden`: the
 * profile was not withdrawn and was not moderated, it simply is not paid for.
 * Keeping the two apart means "why am I not listed?" has a truthful answer.
 */
export const PAUSED: VisibilityStatus = "paused";

/** Removed by an admin. Distinct from `hidden` so the reason survives. */
export const SUSPENDED: VisibilityStatus = "suspended";

/** True when `value` is one of the four states the database accepts. */
export function isVisibilityStatus(value: unknown): value is VisibilityStatus {
  return typeof value === "string" && (VISIBILITY_STATUSES as readonly string[]).includes(value);
}

/** Narrow a raw column value. Anything unrecognised is treated as unlisted. */
export function toVisibilityStatus(value: unknown): VisibilityStatus {
  return isVisibilityStatus(value) ? value : HIDDEN;
}
