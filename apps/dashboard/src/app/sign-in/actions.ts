"use server";

import { verifyTurnstile } from "@masseurmatch/config/observability";
import { createSessionClient } from "@masseurmatch/db/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Sign-in. A `"use server"` module may only export async functions, so the
 * form-state type lives in `./form-state`.
 */
import { clientAddress, LIMITS, rateLimit } from "@/lib/rate-limit";

import type { SignInState } from "./form-state";

/** Only allow same-origin relative paths, so `?next=` cannot become an open redirect. */
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  // Turnstile, when it is configured. `not_configured` is allowed through and
  // `failed` is not — so the check is either genuinely enforced or genuinely
  // absent, never silently passing. See packages/config/observability.ts.
  const turnstile = await verifyTurnstile(
    String(formData.get("cf-turnstile-response") ?? "") || null,
    headers().get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
  );
  if (turnstile.status === "failed") {
    return { error: "We could not verify that you are human. Please try again." };
  }

  // Rate limit before touching Supabase Auth: an unbounded caller can otherwise
  // use this form to guess passwords as fast as the network allows.
  const limited = rateLimit(
    `signin:${clientAddress(headers())}`,
    LIMITS.signIn.limit,
    LIMITS.signIn.windowMs,
  );
  if (!limited.ok) {
    return { error: "Too many attempts. Please wait a moment and try again." };
  }

  const { error } = await createSessionClient().auth.signInWithPassword({ email, password });

  if (error) {
    // Deliberately vague: distinguishing "no such account" from "wrong
    // password" turns the form into an account-enumeration oracle.
    return { error: "Those details did not match an account." };
  }

  redirect(next);
}

export async function signOut(): Promise<void> {
  await createSessionClient().auth.signOut();
  redirect("/sign-in");
}
