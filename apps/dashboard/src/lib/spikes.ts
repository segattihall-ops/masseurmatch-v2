import "server-only";

import { planFor } from "@masseurmatch/billing";
import { createServiceClient } from "@masseurmatch/db/client";
import {
  monthStart,
  spikeAllowance,
  spikeBlockedMessage,
  spikeEndsAt,
  type SpikeAllowance,
} from "@masseurmatch/db/spikes";
import { resolveTier } from "@masseurmatch/db/tier-grants";

/**
 * Spending and counting visibility Spikes.
 *
 * The quota is enforced here, on the server, and nowhere else. The dashboard
 * disables the button when there is nothing left, but a disabled button is a
 * suggestion — the check that matters is the one below, between reading the
 * count and writing the row.
 *
 * Reads and writes go through the service client because `profile_spikes` has
 * no insert policy: a client-side insert would let anyone holding the anon key
 * mint themselves unlimited lifts.
 */

/** Profile fields these functions need. */
export type SpikeProfile = {
  id: string;
  subscription_tier: string | null;
  subscription_status: string | null;
  tier_granted_until: string | null;
  spike_until: string | null;
};

/**
 * True when the Spike columns/tables are not in the database yet.
 *
 * Same reasoning as the directory: this ships before the migration can be
 * applied, and CI has no database to catch it. Missing schema degrades to
 * "Spikes are unavailable", never to a crash on the dashboard's main page.
 */
function isMissingSchema(message: string): boolean {
  return (
    (message.includes("spike_until") || message.includes("profile_spikes")) &&
    (message.includes("does not exist") || message.includes("schema cache"))
  );
}

/** How many quota Spikes this profile has started since the 1st. */
async function usedThisMonth(profileId: string, now: Date): Promise<number | null> {
  const { count, error } = await createServiceClient()
    .from("profile_spikes")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .eq("source", "quota")
    .gte("started_at", monthStart(now).toISOString());

  if (error) {
    if (isMissingSchema(error.message)) return null;
    throw new Error(`Could not read your Spike history: ${error.message}`);
  }
  return count ?? 0;
}

export type SpikeStatus = SpikeAllowance & {
  /** When the running Spike ends, if one is running. */
  activeUntil: string | null;
  /** False when the migration has not been applied yet. */
  available: boolean;
};

/** What this therapist can currently do with Spikes. */
export async function getSpikeStatus(
  profile: SpikeProfile,
  now: Date = new Date(),
): Promise<SpikeStatus> {
  const perMonth = planFor(resolveTier(profile, now)).spikesPerMonth;
  const used = await usedThisMonth(profile.id, now);

  if (used === null) {
    return {
      perMonth,
      usedThisMonth: 0,
      remaining: 0,
      canSpend: false,
      blockedBecause: null,
      activeUntil: null,
      available: false,
    };
  }

  const allowance = spikeAllowance({
    perMonth,
    usedThisMonth: used,
    spike_until: profile.spike_until,
    now,
  });

  return {
    ...allowance,
    activeUntil: allowance.blockedBecause === "already-active" ? profile.spike_until : null,
    available: true,
  };
}

export type SpendResult = { ok: true; endsAt: string } | { ok: false; reason: string };

/**
 * Spend one Spike.
 *
 * Re-reads the allowance immediately before writing rather than trusting
 * anything the caller passed in. Two tabs, or a double-clicked button, would
 * otherwise both pass a check made against the same stale count and spend two
 * credits for one lift.
 *
 * The history row is written first. If the profile update then fails, the
 * therapist has lost a credit without getting the lift — bad, but the opposite
 * order is worse: a lift with no record is a free one, and it would recur every
 * time the write half-failed.
 */
export async function spendSpike(
  profile: SpikeProfile,
  now: Date = new Date(),
): Promise<SpendResult> {
  const status = await getSpikeStatus(profile, now);

  if (!status.available) return { ok: false, reason: "Spikes are not available yet." };
  if (!status.canSpend) {
    // The reason codes are for branching, not for reading. Send the sentence.
    return {
      ok: false,
      reason: spikeBlockedMessage(status.blockedBecause) ?? "You cannot start a Spike right now.",
    };
  }

  const supabase = createServiceClient();
  const endsAt = spikeEndsAt(now);

  const { error: historyError } = await supabase.from("profile_spikes").insert({
    profile_id: profile.id,
    started_at: now.toISOString(),
    ends_at: endsAt.toISOString(),
    source: "quota",
  });

  if (historyError) {
    if (isMissingSchema(historyError.message)) {
      return { ok: false, reason: "Spikes are not available yet." };
    }
    return { ok: false, reason: "Could not start your Spike. Nothing was used." };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ spike_until: endsAt.toISOString() })
    .eq("id", profile.id);

  if (profileError) {
    // The credit is spent and the lift did not apply. Say so plainly rather
    // than reporting success — support can put it right, silence cannot.
    return {
      ok: false,
      reason: "Your Spike was recorded but the boost did not apply. Please contact support.",
    };
  }

  return { ok: true, endsAt: endsAt.toISOString() };
}
