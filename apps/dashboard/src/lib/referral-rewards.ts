import "server-only";

import { createSessionClient } from "@masseurmatch/db/auth";
import { createServiceClient } from "@masseurmatch/db/client";

import { normaliseReferralCode } from "./referrals";

/**
 * The referral programme's reads and writes.
 *
 * ---------------------------------------------------------------------------
 * Why the code is issued rather than looked up
 * ---------------------------------------------------------------------------
 * The referrals page used to `select` from `referral_codes` and, finding
 * nothing, tell every therapist "no referral code on this account yet. One is
 * issued with your first paid month." Nothing in this repository — or in the
 * database, outside this function — ever issued one. The sentence described a
 * process that did not exist, so the page was permanently empty and the whole
 * feature was unreachable.
 *
 * `ensure_referral_code(p_user_id)` is already in the schema and already
 * returns the row it creates. Calling it means a therapist has a code the first
 * time they open the page, which is the only moment the code is worth anything.
 *
 * ---------------------------------------------------------------------------
 * Service client, not session
 * ---------------------------------------------------------------------------
 * POLICIES.md: "awards are written by `service_role` so rewards cannot be
 * self-granted". `referral_codes` rows are owner-readable, but *creating* one
 * is a write, and the RPC's grants are not something this app should depend on.
 * Both calls here run server-side after the caller has been authorised, with
 * the user id taken from the session rather than from any input.
 */

export type ReferralCode = {
  code: string;
  referral_count: number;
  premium_months_earned: number;
};

export type ReferralSignup = {
  id: string;
  payment_status: string;
  reward_months: number;
  qualified_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

/**
 * This therapist's code, creating one if they have none.
 *
 * Falls back to a plain read when the RPC is missing, so a database that has
 * not had the function applied still shows an existing code rather than an
 * error. Returns null only when there is genuinely nothing to show.
 */
export async function getMyReferralCode(userId: string): Promise<ReferralCode | null> {
  let supabase;
  try {
    supabase = createServiceClient();
  } catch {
    return null;
  }

  const issued = await supabase.rpc("ensure_referral_code", { p_user_id: userId });

  if (!issued.error) {
    const row = (issued.data ?? [])[0] as ReferralCode | undefined;
    if (row?.code) return row;
  }

  const existing = await supabase
    .from("referral_codes")
    .select("code,referral_count,premium_months_earned")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing.error || !existing.data) return null;
  return existing.data as unknown as ReferralCode;
}

/** Who signed up with it. Read through the caller's own session — RLS scopes it. */
export async function listMyReferralSignups(userId: string): Promise<ReferralSignup[]> {
  const { data, error } = await createSessionClient()
    .from("referral_signups")
    .select("id,payment_status,reward_months,qualified_at,revoked_at,created_at")
    .eq("referrer_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  return error ? [] : ((data ?? []) as unknown as ReferralSignup[]);
}

/**
 * Attribute a new account to whoever referred it.
 *
 * Best effort by design, and never allowed to fail a sign-up: a person who has
 * just created an account must land in their dashboard whether or not the
 * referral bookkeeping worked. `claim_referral_signup` decides the rest — an
 * unknown code, a second claim or a self-referral all come back `false`, which
 * is an answer rather than an error.
 */
export async function claimReferralSignup(
  code: string | null | undefined,
  referredUserId: string,
): Promise<boolean> {
  const referralCode = normaliseReferralCode(code);
  if (!referralCode) return false;

  try {
    const { data, error } = await createServiceClient().rpc("claim_referral_signup", {
      p_referral_code: referralCode,
      p_referred_user_id: referredUserId,
    });
    return !error && data === true;
  } catch {
    return false;
  }
}
