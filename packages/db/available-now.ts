/**
 * Available Now — "I can take someone in the next couple of hours."
 *
 * Pure functions over `profiles.available_now` and `available_now_expires`.
 * No database access, so the dashboard toggle, the directory badge and any
 * future search filter cannot disagree about who is available.
 *
 * ---------------------------------------------------------------------------
 * One definition, because the old one had two
 * ---------------------------------------------------------------------------
 * The old repo checked this inline wherever it was needed, and the checks did
 * not match. `directory.ts` accepted a null expiry as available:
 *
 *     available_now && (available_now_expires == null || expires > now)
 *
 * while `explore.ts` and the Knotty ranker required a real future timestamp:
 *
 *     new Date(available_now_expires).getTime() > Date.now()
 *
 * So a row with `available_now = true` and no expiry was permanently "available
 * now" in the directory and never available anywhere else. A flag with no
 * deadline is one nobody can turn off, and it is the single worst thing this
 * feature can do: it teaches clients that the badge means nothing.
 *
 * This module fails closed. No expiry means not available.
 *
 * Expiry is evaluated on read, like Spikes and courtesy tier grants. There is no
 * job to sweep stale flags, because a job that fails silently leaves exactly
 * the state described above.
 */

/** Fields these functions need. */
export type AvailableNowFields = {
  available_now?: boolean | null;
  available_now_expires?: string | Date | null;
};

function expiryOf(profile: AvailableNowFields): Date | null {
  const raw = profile.available_now_expires;
  if (!raw) return null;
  const date = raw instanceof Date ? raw : new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Whether this profile is available right now.
 *
 * Both halves are required. `available_now` without a future expiry is treated
 * as off — see the note above.
 */
export function isAvailableNow(profile: AvailableNowFields, now: Date = new Date()): boolean {
  if (!profile.available_now) return false;
  const expires = expiryOf(profile);
  return expires !== null && expires.getTime() > now.getTime();
}

/** When the current window ends, or null when nothing is running. */
export function availableUntil(profile: AvailableNowFields, now: Date = new Date()): Date | null {
  return isAvailableNow(profile, now) ? expiryOf(profile) : null;
}

/**
 * True when the flag is set but the window has passed.
 *
 * Worth distinguishing: it is the state a therapist is in when they forgot to
 * turn it off, and the dashboard can say "that ended" rather than silently
 * showing the toggle as off.
 */
export function availableNowLapsed(profile: AvailableNowFields, now: Date = new Date()): boolean {
  return Boolean(profile.available_now) && !isAvailableNow(profile, now);
}

/** End of a window started now, for a plan that allows `hours`. */
export function availableNowEndsAt(hours: number, now: Date = new Date()): Date {
  const safe = Math.max(0, hours);
  return new Date(now.getTime() + safe * 3_600_000);
}

/** `Available for another 40 minutes` — what the dashboard shows while it runs. */
export function availableNowRemaining(
  profile: AvailableNowFields,
  now: Date = new Date(),
): string | null {
  const until = availableUntil(profile, now);
  if (!until) return null;

  const minutes = Math.max(1, Math.round((until.getTime() - now.getTime()) / 60_000));
  if (minutes < 60) return `Available for another ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (rest === 0) return `Available for another ${hours}h`;
  return `Available for another ${hours}h ${rest}m`;
}
