/**
 * Profile lifecycle states.
 *
 * The moderation queue in phase 6 consumes exactly these four values, so they
 * are defined once here and imported by both apps rather than being written as
 * string literals at each call site.
 *
 * The database column is currently `text` and nullable. Making it a real
 * Postgres enum is a separate, riskier change — see
 * `supabase/migrations/20260816020000_profile_status_enum.sql`. Nothing here
 * depends on that migration having run: these helpers narrow the generated
 * `string | null` to a union at the boundary, so application code is already
 * type-safe against the four states either way.
 */

export const PROFILE_STATUSES = ["pending", "approved", "rejected", "suspended"] as const;

export type ProfileStatus = (typeof PROFILE_STATUSES)[number];

/** True when `value` is one of the four known states. */
export function isProfileStatus(value: unknown): value is ProfileStatus {
  return typeof value === "string" && (PROFILE_STATUSES as readonly string[]).includes(value);
}

/**
 * Narrow a raw column value to a `ProfileStatus`.
 *
 * Rows predating the current lifecycle carry `null` or a legacy value. Those
 * are treated as `pending` — the conservative direction, since an unrecognised
 * profile should be reviewed rather than published.
 */
export function toProfileStatus(value: unknown): ProfileStatus {
  return isProfileStatus(value) ? value : "pending";
}

/** Only `approved` profiles are eligible for the public directory. */
export function isPubliclyListable(status: unknown): boolean {
  return toProfileStatus(status) === "approved";
}

/** Human-readable labels, for the dashboard and the moderation queue. */
export const PROFILE_STATUS_LABELS: Record<ProfileStatus, string> = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
};
