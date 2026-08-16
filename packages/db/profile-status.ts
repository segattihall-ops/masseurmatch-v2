/**
 * Profile lifecycle states.
 *
 * The moderation queue in phase 6 consumes exactly one of these values, so they
 * are defined once here and imported by both apps rather than being written as
 * string literals at each call site.
 *
 * The database column is currently `text` and nullable. Making it a real
 * Postgres enum is a separate, riskier change — see
 * `supabase/migrations/20260816020000_profile_status_enum.sql`. Nothing here
 * depends on that migration having run: these helpers narrow the generated
 * `string | null` to a union at the boundary, so application code is already
 * type-safe against the five states either way.
 */

/**
 * The five live states, in lifecycle order.
 *
 * `draft` was discovered in production when the enum migration refused to run:
 * it found rows outside the four states this file originally declared. It is
 * not noise — it is the state that keeps un-submitted profiles *out* of the
 * moderation queue, and omitting it was a real bug. Without it, a therapist who
 * merely signed in would have an empty profile queued for a reviewer.
 *
 *   draft      created, never submitted. Invisible to reviewers and the public.
 *   pending    submitted, awaiting review. This is what the queue reads.
 *   approved   live.
 *   rejected   reviewed and refused; the therapist may edit and resubmit.
 *   suspended  removed by an admin.
 */
export const PROFILE_STATUSES = ["draft", "pending", "approved", "rejected", "suspended"] as const;

export type ProfileStatus = (typeof PROFILE_STATUSES)[number];

/** States a reviewer should see. `draft` is deliberately absent. */
export const REVIEWABLE_STATUSES = ["pending"] as const satisfies readonly ProfileStatus[];

/** True when `value` is one of the five known states. */
export function isProfileStatus(value: unknown): value is ProfileStatus {
  return typeof value === "string" && (PROFILE_STATUSES as readonly string[]).includes(value);
}

/**
 * States the old application writes, mapped onto ours.
 *
 * The live CHECK constraint permits **eight** values, not five:
 *
 *   draft, pending, pending_approval, under_review,
 *   approved, suspended, rejected, changes_requested
 *
 * No row currently uses the extra three — but the old application is still
 * running against this same database until cutover completes, so it can write
 * one at any moment. Without these aliases such a row would fall through to
 * `draft`, which is the dangerous direction: a profile its owner submitted for
 * review would never appear in the moderation queue and would show its owner
 * "Draft" while it waited for a reviewer who could not see it.
 *
 * Mapping is deliberately conservative — an unreviewed profile stays
 * unreviewed, never approved.
 */
const LEGACY_ALIASES: Record<string, ProfileStatus> = {
  pending_approval: "pending",
  under_review: "pending",
  changes_requested: "rejected",
};

/**
 * The raw column values that mean "a reviewer needs to look at this", including
 * the legacy spellings. This is what the moderation queue must filter on — the
 * query runs in Postgres against the stored text, so it cannot use the
 * normalisation above.
 */
export const QUEUEABLE_COLUMN_VALUES = ["pending", "pending_approval", "under_review"] as const;

/**
 * Every raw column value that normalises to each status.
 *
 * Counting or filtering by status has to go through this: the query runs in
 * Postgres against stored text, so `.eq("profile_status", "pending")` silently
 * excludes the legacy spellings that `toProfileStatus` folds in.
 */
export const COLUMN_VALUES_FOR: Record<ProfileStatus, readonly string[]> = {
  draft: ["draft"],
  pending: QUEUEABLE_COLUMN_VALUES,
  approved: ["approved"],
  rejected: ["rejected", "changes_requested"],
  suspended: ["suspended"],
};

/**
 * Narrow a raw column value to a `ProfileStatus`.
 *
 * Rows predating the current lifecycle carry `null` or a legacy value. Those
 * become `draft`, not `pending`.
 *
 * `pending` was the original fallback, on the reasoning that an unrecognised
 * profile should be reviewed rather than published. That was wrong in practice:
 * it would sweep every null-status row into the moderation queue as though its
 * owner had asked for review. `draft` is equally safe — it is not publicly
 * listable either — without manufacturing work for a human.
 *
 * This narrowing never affects what the public site shows. That path filters on
 * the column directly (`.eq("profile_status", "approved")`), so a row's real
 * value governs visibility regardless of how it is displayed here.
 */
export function toProfileStatus(value: unknown): ProfileStatus {
  if (isProfileStatus(value)) return value;
  if (typeof value === "string") {
    const alias = LEGACY_ALIASES[value];
    if (alias) return alias;
  }
  return "draft";
}

/** Only `approved` profiles are eligible for the public directory. */
export function isPubliclyListable(status: unknown): boolean {
  return toProfileStatus(status) === "approved";
}

/** Human-readable labels, for the dashboard and the moderation queue. */
export const PROFILE_STATUS_LABELS: Record<ProfileStatus, string> = {
  draft: "Draft",
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
};
