"use server";

import { createSessionClient } from "@masseurmatch/db/auth";
import { redirect } from "next/navigation";

import { dashboardUrl } from "@/lib/dashboard-url";
import { safeNext } from "@/lib/safe-next";

import type { OAuthState } from "./oauth-state";

/**
 * Starting a Google sign-in.
 *
 * Google is already enabled on this Supabase project — `/auth/v1/settings`
 * reports `google: true`, and the old site used it — so nothing here needs a
 * new credential. What it needs is the same `/auth/callback` the email links
 * use, which is why the redirect lands there and not on a second handler.
 *
 * `setup=oauth` rather than `setup=1`: the callback must treat a Google arrival
 * differently, because unlike a confirmation link it cannot assume the account
 * is new. See `@/lib/oauth`.
 *
 * No rate limit. This costs us nothing — it is a redirect to Google, sends no
 * mail and touches no password — and the limiter's key would be an address
 * shared by everyone behind one NAT.
 */
export async function startGoogleSignIn(
  _prev: OAuthState,
  formData: FormData,
): Promise<OAuthState> {
  const next = safeNext(formData.get("next"));

  const { data, error } = await createSessionClient().auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${dashboardUrl()}/auth/callback?setup=oauth&next=${encodeURIComponent(next)}`,
      // Without this, a browser signed into several Google accounts silently
      // reuses the last one — which for a therapist with a personal and a work
      // address is how you end up with two listings and no idea why.
      queryParams: { prompt: "select_account" },
    },
  });

  if (error || !data?.url) {
    return { error: "We could not reach Google just now. Try again, or use your email." };
  }

  redirect(data.url);
}
