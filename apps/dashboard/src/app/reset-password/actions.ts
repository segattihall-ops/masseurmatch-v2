"use server";

import { createSessionClient } from "@masseurmatch/db/auth";
import { redirect } from "next/navigation";

import { validatePassword } from "@/lib/credentials";
import { requireUser } from "@/lib/guards";

import type { ResetPasswordState } from "./form-state";

/**
 * Choosing a new password.
 *
 * The authorisation here is the session itself: the recovery link has already
 * been exchanged for one by `/auth/callback`, so `requireUser()` is what proves
 * the caller opened the email. Nothing about which account to change is taken
 * from the form — `updateUser` acts on the session's own user and cannot be
 * pointed at anyone else.
 */
export async function resetPassword(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  await requireUser("/reset-password");

  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const invalid = validatePassword(password, confirm);
  if (invalid) return { error: invalid };

  const { error } = await createSessionClient().auth.updateUser({ password });

  if (error) {
    // Supabase refuses a password it considers weak, or one identical to the
    // current one on projects with that check on. Both are about what was
    // typed, so both can be said plainly.
    return { error: "That password was rejected. Try a longer or less obvious one." };
  }

  redirect("/");
}
