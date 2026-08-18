"use server";

import { verifyTurnstile } from "@masseurmatch/config/observability";
import { createSessionClient } from "@masseurmatch/db/auth";
import { headers } from "next/headers";

import { dashboardUrl } from "@/lib/dashboard-url";
import { clientAddress, LIMITS, rateLimit } from "@/lib/rate-limit";

import type { ForgotPasswordState } from "./form-state";

/**
 * Sending a password-reset link.
 *
 * Exists because sign-in and sign-up without it are a trap: an account is
 * created, confirmed, and then one forgotten password away from being
 * unrecoverable without an administrator.
 *
 * The reply is identical for a known and an unknown address, and Supabase's own
 * response is not inspected for the difference either. It shares the sign-up
 * rate limit's reasoning — each accepted call sends mail to an address the
 * caller chose.
 */
export async function requestPasswordReset(
  _prev: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) return { status: "error", error: "Enter the email you signed up with." };

  const turnstile = await verifyTurnstile(
    String(formData.get("cf-turnstile-response") ?? "") || null,
    headers().get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
  );
  if (turnstile.status === "failed") {
    return { status: "error", error: "We could not verify that you are human. Please try again." };
  }

  const limited = rateLimit(
    `reset:${clientAddress(headers())}`,
    LIMITS.signUp.limit,
    LIMITS.signUp.windowMs,
  );
  if (!limited.ok) {
    return { status: "error", error: "Too many attempts. Please wait a moment and try again." };
  }

  // Deliberately no `setup=1`: this link must never grant a role. See the note
  // in /auth/callback.
  await createSessionClient().auth.resetPasswordForEmail(email, {
    redirectTo: `${dashboardUrl()}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
  });

  return { status: "sent", email };
}
