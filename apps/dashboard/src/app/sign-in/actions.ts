"use server";

import { createSessionClient } from "@masseurmatch/db/auth";
import { redirect } from "next/navigation";

/**
 * Sign-in. A `"use server"` module may only export async functions, so the
 * form-state type lives in `./form-state`.
 */
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
