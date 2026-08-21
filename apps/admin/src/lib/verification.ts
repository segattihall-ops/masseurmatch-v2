import "server-only";

import { createServiceClient } from "@masseurmatch/db/client";

/**
 * Recording that something about an account has been verified.
 *
 * ---------------------------------------------------------------------------
 * Why the service client
 * ---------------------------------------------------------------------------
 * A verification badge is a claim the platform makes to strangers, so the write
 * that sets it should not travel over the same permission the therapist uses to
 * edit their own bio. Going through the service client means the honest path
 * runs after the proof — a verified OTP, an approved document — rather than
 * alongside it.
 *
 * ---------------------------------------------------------------------------
 * What this does not fix, and someone should check
 * ---------------------------------------------------------------------------
 * `profiles` has an owner-update policy, and if it is column-blind then
 * `is_verified_phone` and `is_verified_identity` can be set by the account they
 * describe with a single PATCH to the REST API, whatever this file does. That
 * would make the badges self-granting and worth nothing.
 *
 * It is stated as unverified because it is: confirming it needs a therapist
 * login, which this environment does not have. The check is one request —
 * sign in as a test therapist and
 *
 *   PATCH /rest/v1/profiles?id=eq.<self>  {"is_verified_identity": true}
 *
 * A 200 means the badge is self-grantable and the fix is a column grant or a
 * policy `WITH CHECK` that pins these columns; a 403 or an unchanged row means
 * it is already handled.
 */

/** Marks the number verified on the profile after Supabase confirmed the code. */
export async function markPhoneVerified(userId: string, e164: string): Promise<void> {
  const { error } = await createServiceClient()
    .from("profiles")
    .update({
      phone: e164,
      is_verified_phone: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  // Deliberately thrown rather than swallowed. The auth user's phone is already
  // confirmed at this point, so a silent failure here leaves the account able
  // to sign in by SMS while the profile still says unverified — two sources of
  // truth disagreeing, with nothing on screen to say so.
  if (error) throw new Error(`Could not record the verified number: ${error.message}`);
}
