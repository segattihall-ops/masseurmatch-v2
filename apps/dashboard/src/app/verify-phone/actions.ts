"use server";

import { createSessionClient } from "@masseurmatch/db/auth";
import { headers } from "next/headers";

import { requireUser } from "@/lib/guards";
import { isVerificationCode, toE164 } from "@/lib/phone";
import { clientAddress, LIMITS, rateLimit } from "@/lib/rate-limit";
import { markPhoneVerified } from "@/lib/verification";

import type { VerifyPhoneState } from "./form-state";

/**
 * Verifying the therapist's own phone number.
 *
 * Two stages in one action, branching on `intent`, because they are one
 * conversation: the number typed in stage one is what stage two confirms, and
 * splitting them across two actions means passing it back and forth anyway.
 *
 * `updateUser({ phone })` is what sends the code — Supabase treats it as a
 * phone *change* on an existing account, which is exactly what this is. The
 * account keeps its email; the number is added to it. That ordering matters
 * later: `signInWithOtp` will only reach an account whose number got here.
 */
export async function verifyPhone(
  _prev: VerifyPhoneState,
  formData: FormData,
): Promise<VerifyPhoneState> {
  const viewer = await requireUser("/verify-phone");
  const intent = String(formData.get("intent") ?? "send");

  if (intent === "send") {
    const e164 = toE164(String(formData.get("phone") ?? ""));
    if (!e164) {
      return {
        stage: "phone",
        error: "Enter your number with the area code, or start with + for a number outside the US.",
      };
    }

    // Keyed on the account, not the address: this needs a session, and an
    // IP-shaped key would throttle everyone in one building together. Checked
    // before Supabase, because past this point an SMS has been paid for.
    const limited = rateLimit(
      `sms:${viewer.user.id}`,
      LIMITS.phoneCode.limit,
      LIMITS.phoneCode.windowMs,
    );
    if (!limited.ok) {
      return { stage: "phone", error: "Too many codes requested. Please wait a minute." };
    }

    const { error } = await createSessionClient().auth.updateUser({ phone: e164 });

    if (error) {
      // Supabase's own limiter is per number and stricter than ours.
      if (error.status === 429) {
        return { stage: "phone", error: "Too many codes requested. Please wait a minute." };
      }
      return {
        stage: "phone",
        error: "We could not send a code to that number. Check it and try again.",
      };
    }

    return { stage: "code", phone: e164 };
  }

  const phone = toE164(String(formData.get("phone") ?? ""));
  const token = String(formData.get("code") ?? "").trim();

  if (!phone) return { stage: "phone", error: "Start again with your number." };
  if (!isVerificationCode(token)) {
    return { stage: "code", phone, error: "The code is six digits." };
  }

  // Rate limited too: without it this is an oracle for guessing a six-digit
  // code, which is 10^6 tries and no time at all at network speed.
  const limited = rateLimit(
    `smscheck:${viewer.user.id}:${clientAddress(headers())}`,
    LIMITS.phoneCode.limit,
    LIMITS.phoneCode.windowMs,
  );
  if (!limited.ok) {
    return { stage: "code", phone, error: "Too many attempts. Please wait a minute." };
  }

  const { error } = await createSessionClient().auth.verifyOtp({
    phone,
    token,
    type: "phone_change",
  });

  if (error) {
    return { stage: "code", phone, error: "That code did not match, or it has expired." };
  }

  await markPhoneVerified(viewer.user.id, phone);

  return { stage: "done", phone };
}
