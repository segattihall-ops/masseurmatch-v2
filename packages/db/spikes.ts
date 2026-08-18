/**
 * Visibility Spikes.
 *
 * A Spike is *distribution*: a therapist spends one of their monthly credits
 * and their listing is lifted in the directory for a day. It is not the same
 * thing as a demand spike *score*, which is intelligence — "is this city
 * heating up right now?". Two different products that share a word, so the
 * word is kept apart deliberately: everything here says Spike and means the
 * credit.
 *
 * Two rules, and both are evaluated on read rather than by a scheduled job:
 *
 *   active   — `profiles.spike_until` is in the future
 *   quota    — how many were started this calendar month, against the plan
 *
 * A cron that expires spikes could fail silently and leave a listing lifted
 * for free, or double-fire. Reading the timestamp means a spike ends exactly
 * when it says it does, with nothing to operate.
 */

/** How long one Spike lifts a listing. */
export const SPIKE_DURATION_HOURS = 24;

/**
 * Quota resets on the 1st, in UTC.
 *
 * A calendar month is what the pricing page says ("6 per month"), so it is
 * what this counts — not a rolling 30 days. A rolling window is defensible but
 * it makes "how many do I have left?" impossible for a therapist to predict,
 * and an allowance nobody can predict does not get used.
 */
export function monthStart(now: Date = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

/** Whether a listing is currently lifted by a Spike. */
export function spikeIsActive(
  profile: { spike_until?: string | Date | null },
  now: Date = new Date(),
): boolean {
  const until = profile.spike_until;
  if (!until) return false;

  const ends = until instanceof Date ? until : new Date(until);
  // An unparseable timestamp must not lift a listing forever.
  if (Number.isNaN(ends.getTime())) return false;

  return ends.getTime() > now.getTime();
}

/** When a Spike started now would end. */
export function spikeEndsAt(now: Date = new Date()): Date {
  return new Date(now.getTime() + SPIKE_DURATION_HOURS * 60 * 60 * 1000);
}

export type SpikeAllowance = {
  /** Included in the plan each month. */
  perMonth: number;
  /** Started since the 1st of this month. */
  usedThisMonth: number;
  /** What is left. Never negative, even if usage somehow exceeded the plan. */
  remaining: number;
  /** Whether one can be spent right now. */
  canSpend: boolean;
  /** Why not, when `canSpend` is false. Null when it is true. */
  blockedBecause: "no-plan-allowance" | "quota-spent" | "already-active" | null;
};

/**
 * What a therapist can do with Spikes right now.
 *
 * Deliberately refuses while one is already running. Stacking two credits into
 * 48 hours would be a reasonable product too, but it is not what "6 per month"
 * suggests, and letting someone burn their whole allowance on one long lift by
 * accident is the kind of surprise that generates a refund request.
 */
export function spikeAllowance(input: {
  perMonth: number;
  usedThisMonth: number;
  spike_until?: string | Date | null;
  now?: Date;
}): SpikeAllowance {
  const now = input.now ?? new Date();
  const perMonth = Math.max(0, Math.trunc(input.perMonth));
  const usedThisMonth = Math.max(0, Math.trunc(input.usedThisMonth));
  const remaining = Math.max(0, perMonth - usedThisMonth);

  let blockedBecause: SpikeAllowance["blockedBecause"] = null;
  if (perMonth === 0) blockedBecause = "no-plan-allowance";
  else if (spikeIsActive({ spike_until: input.spike_until }, now))
    blockedBecause = "already-active";
  else if (remaining === 0) blockedBecause = "quota-spent";

  return {
    perMonth,
    usedThisMonth,
    remaining,
    canSpend: blockedBecause === null,
    blockedBecause,
  };
}

/** Plain-language reason, for the dashboard. */
export function spikeBlockedMessage(reason: SpikeAllowance["blockedBecause"]): string | null {
  switch (reason) {
    case "no-plan-allowance":
      return "Spikes come with Standard and above.";
    case "quota-spent":
      return "You have used all of this month's Spikes. They reset on the 1st.";
    case "already-active":
      return "A Spike is running. You can start another when it ends.";
    default:
      return null;
  }
}
