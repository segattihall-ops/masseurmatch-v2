"use server";

import { createSessionClient } from "@masseurmatch/db/auth";
import { redirect } from "next/navigation";

import { adminUrl } from "@/lib/admin-url";
import { safeNext } from "@/lib/safe-next";

import type { OAuthState } from "./oauth-state";

/**
 * Starting a Google sign-in for an operator.
 *
 * Google is already enabled on this Supabase project — the dashboard app has
 * signed therapists in with it since launch — so nothing here needs a new
 * credential, and the OAuth client in Google Cloud needs no new redirect URI
 * either: it points at Supabase's `/auth/v1/callback`, not at us. What *does*
 * need adding once, per host, is `https://<this app>/auth/callback` in
 * Supabase's redirect allow-list. See docs/DEPLOY.md.
 *
 * ---------------------------------------------------------------------------
 * What this deliberately does not do
 * ---------------------------------------------------------------------------
 * The dashboard's version of this action marks its callback `setup=oauth`, so
 * that a brand-new Google account gets a `provider` role written for it. There
 * is no equivalent here and there must not be: **the admin app never creates an
 * account and never grants a role.** Signing in with Google proves who someone
 * is; it says nothing about whether they may be here. Authorisation stays where
 * it already is — `requireAdmin()` reading `user_roles` on the server — so a
 * Google account with no admin row authenticates successfully and still sees
 * nothing. Adding a role grant to this flow would turn "anyone with a Google
 * account" into "anyone who can reach the admin sign-in page".
 *
 * `prompt: "select_account"` matters more here than on the dashboard. An
 * operator's browser is normally signed into a personal Google account already,
 * and without this Google silently reuses it — so the first thing a new admin
 * would see is an access-denied page for an address they never meant to use.
 *
 * No rate limit, for the same reason as the dashboard: this costs us nothing —
 * it is a redirect to Google that sends no mail and tests no password — and the
 * limiter's key would be an address shared by everyone behind one NAT.
 */
export async function startGoogleSignIn(
  _prev: OAuthState,
  formData: FormData,
): Promise<OAuthState> {
  const next = safeNext(formData.get("next"));

  const { data, error } = await createSessionClient().auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${adminUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
      queryParams: { prompt: "select_account" },
    },
  });

  if (error || !data?.url) {
    return { error: "We could not reach Google just now. Try again, or use your email." };
  }

  redirect(data.url);
}
