"use server";

import { verifyTurnstile } from "@masseurmatch/config/observability";
import { createSessionClient } from "@masseurmatch/db/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { ensureProviderAccount } from "@/lib/account-setup";
import { validateCredentials } from "@/lib/credentials";
import { dashboardUrl } from "@/lib/dashboard-url";
import { clientAddress, LIMITS, rateLimit } from "@/lib/rate-limit";
import { safeNext } from "@/lib/safe-next";

import type { SignUpState } from "./form-state";

/**
 * Creating a therapist account.
 *
 * Mirrors the sign-in action's defences — Turnstile, a rate limit taken before
 * anything expensive, and a `?next=` that can only be a same-origin path — and
 * adds the two things sign-in does not have to think about: which role the new
 * account gets, and the fact that it cannot be used yet.
 *
 * **Confirmation is on.** Measured against this project rather than assumed:
 * `/auth/v1/settings` reports `mailer_autoconfirm: false`, so `signUp` returns
 * a user and **no session**. There is nothing to redirect into at this point —
 * the person is not signed in. So the form says to check their email, and the
 * redirect into the dashboard happens in `/auth/callback` once they click the
 * link. If confirmation is ever switched off, Supabase returns a session here
 * and the branch below sends them straight in, no code change needed.
 */
export async function signUp(_prev: SignUpState, formData: FormData): Promise<SignUpState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const next = safeNext(formData.get("next"));

  const invalid = validateCredentials({ email, password, confirm });
  if (invalid) return { status: "error", error: invalid };

  const turnstile = await verifyTurnstile(
    String(formData.get("cf-turnstile-response") ?? "") || null,
    headers().get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
  );
  if (turnstile.status === "failed") {
    return { status: "error", error: "We could not verify that you are human. Please try again." };
  }

  // Before Supabase is touched: each call here sends an email, and an
  // unbounded caller would otherwise be able to use this form to deliver
  // confirmation mail to addresses that never asked for it.
  const limited = rateLimit(
    `signup:${clientAddress(headers())}`,
    LIMITS.signUp.limit,
    LIMITS.signUp.windowMs,
  );
  if (!limited.ok) {
    return { status: "error", error: "Too many attempts. Please wait a moment and try again." };
  }

  const { data, error } = await createSessionClient().auth.signUp({
    email,
    password,
    options: {
      // Where the confirmation link lands. `next` rides along so the person
      // ends up where they were headed rather than always at the dashboard
      // home — the same contract sign-in already honours.
      // `setup=1` is what tells the callback this link created an account, so
      // it may grant the `provider` role. A recovery link never carries it.
      emailRedirectTo: `${dashboardUrl()}/auth/callback?setup=1&next=${encodeURIComponent(next)}`,
      data: fullName ? { full_name: fullName } : undefined,
    },
  });

  if (error) {
    // Supabase's own rate limiter, which is per-address and stricter than ours.
    if (error.status === 429) {
      return { status: "error", error: "Too many attempts. Please wait a moment and try again." };
    }
    // A rejected password is a fact about what they typed, not about who else
    // has an account here, so it can be said plainly.
    if (/password/i.test(error.message)) {
      return {
        status: "error",
        error: "That password was rejected. Try a longer one, or add numbers and symbols.",
      };
    }
    return { status: "error", error: "We could not create that account. Please try again." };
  }

  // An address that is already registered comes back as success with an empty
  // `identities` array and no second email. Nothing to set up, and the reply
  // must be identical to a real signup's — see the `check-email` doc.
  const alreadyRegistered = (data.user?.identities ?? []).length === 0;

  if (data.user && !alreadyRegistered) {
    try {
      await ensureProviderAccount(data.user.id, { fullName, email });
    } catch (cause) {
      // The auth account now exists but has no role, which would strand them on
      // /not-authorized after confirming. Said out loud rather than swallowed —
      // and /auth/callback retries the same setup, so a transient failure here
      // repairs itself when they click the link.
      console.error("[sign-up] could not finish account setup", cause);
    }
  }

  // Only reachable if email confirmation is turned off in Supabase. Kept
  // because that is a switch someone can flip, and the flow should not quietly
  // start telling people to check an email that will never arrive.
  if (data.session) redirect(next);

  return { status: "check-email", email };
}
