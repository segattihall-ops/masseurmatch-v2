"use server";

import { createSessionClient } from "@masseurmatch/db/auth";
import { redirect } from "next/navigation";

import { ensureProviderAccount } from "@/lib/account-setup";
import { emailLinkType } from "@/lib/email-links";
import { safeNext } from "@/lib/safe-next";

/**
 * The POST half of the email-link interstitial — see the page for why the
 * verification cannot happen on GET.
 *
 * The token proves control of the inbox regardless of which form submitted it,
 * so nothing here needs a signed-in session. `setup=1` carries the same
 * meaning, and the same trust, it had when the callback route handled this
 * directly: it may only cause provider setup after `verifyOtp` has accepted
 * the token, never before.
 */
export async function confirmEmailLink(formData: FormData): Promise<void> {
  const tokenHash = String(formData.get("token_hash") ?? "");
  const type = emailLinkType(String(formData.get("type") ?? ""));
  const next = safeNext(formData.get("next"));
  const setup = String(formData.get("setup") ?? "");

  if (!tokenHash || !type) redirect("/sign-in?notice=link-invalid");

  const supabase = createSessionClient();
  const result = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });

  if (result.error || !result.data.user) redirect("/sign-in?notice=link-expired");

  // Same repair the callback route performs for sign-up links: if setup failed
  // when the account was created, the person would otherwise be confirmed,
  // signed in, and stranded on /not-authorized. Recovery links never carry
  // `setup=1`, so resetting a password cannot mint a provider role.
  const createdAnAccount = setup === "1" || type === "signup" || type === "invite";

  if (createdAnAccount) {
    try {
      await ensureProviderAccount(result.data.user.id, {
        fullName:
          (result.data.user.user_metadata?.full_name as string | undefined) ??
          (result.data.user.user_metadata?.name as string | undefined) ??
          null,
        email: result.data.user.email ?? null,
      });
    } catch (cause) {
      console.error("[auth/confirm] could not finish account setup", cause);
      redirect("/sign-in?notice=setup-failed");
    }
  }

  redirect(next);
}
