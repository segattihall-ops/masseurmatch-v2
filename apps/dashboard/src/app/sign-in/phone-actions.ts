"use server";

import { verifyTurnstile } from "@masseurmatch/config/observability";
import { createSessionClient } from "@masseurmatch/db/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { isVerificationCode, toE164 } from "@/lib/phone";
import { clientAddress, LIMITS, rateLimit } from "@/lib/rate-limit";
import { safeNext } from "@/lib/safe-next";

import type { PhoneSignInState } from "./phone-state";

/**
 * Signing in with a code sent by SMS.
 *
 * `shouldCreateUser: false` is the load-bearing option. Left at its default,
 * this endpoint would mint an account for any number typed into it — an account
 * with no email, no role, and no profile, which then fails every guard on the
 * dashboard and cannot recover its own password. Signing in by phone is
 * therefore only possible for a number already verified from
 * `/verify-phone`, which is the right order anyway: the account proves it owns
 * the number while it is already signed in, not by receiving one SMS.
 *
 * The reply is the same whether the number has an account or not, for the same
 * reason the password form refuses vaguely — otherwise this is a way to ask
 * "does this person have a listing here" one number at a time.
 */
export async function signInWithPhone(
  _prev: PhoneSignInState,
  formData: FormData,
): Promise<PhoneSignInState> {
  const intent = String(formData.get("intent") ?? "send");
  const next = safeNext(formData.get("next"));

  if (intent === "send") {
    const e164 = toE164(String(formData.get("phone") ?? ""));
    if (!e164) {
      return {
        stage: "phone",
        error: "Enter your number with the area code, or start with + for a number outside the US.",
      };
    }

    const turnstile = await verifyTurnstile(
      String(formData.get("cf-turnstile-response") ?? "") || null,
      headers().get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    );
    if (turnstile.status === "failed") {
      return { stage: "phone", error: "We could not verify that you are human. Please try again." };
    }

    // Before Supabase: every accepted call here spends money at Twilio and
    // rings a phone belonging to whoever the caller typed.
    const limited = rateLimit(
      `smsin:${clientAddress(headers())}`,
      LIMITS.phoneCode.limit,
      LIMITS.phoneCode.windowMs,
    );
    if (!limited.ok) {
      return { stage: "phone", error: "Too many codes requested. Please wait a minute." };
    }

    await createSessionClient().auth.signInWithOtp({
      phone: e164,
      options: { shouldCreateUser: false },
    });

    // The error is deliberately not inspected. "No account for that number" and
    // "code sent" must be indistinguishable from out here.
    return { stage: "code", phone: e164 };
  }

  const phone = toE164(String(formData.get("phone") ?? ""));
  const token = String(formData.get("code") ?? "").trim();

  if (!phone) return { stage: "phone", error: "Start again with your number." };
  if (!isVerificationCode(token)) {
    return { stage: "code", phone, error: "The code is six digits." };
  }

  // A six-digit code is a million guesses, which is nothing at network speed.
  const limited = rateLimit(
    `smsincheck:${clientAddress(headers())}`,
    LIMITS.phoneCode.limit,
    LIMITS.phoneCode.windowMs,
  );
  if (!limited.ok) {
    return { stage: "code", phone, error: "Too many attempts. Please wait a minute." };
  }

  const { error } = await createSessionClient().auth.verifyOtp({ phone, token, type: "sms" });

  if (error) {
    return {
      stage: "code",
      phone,
      error: "That code did not match, or no account uses that number.",
    };
  }

  redirect(next);
}
