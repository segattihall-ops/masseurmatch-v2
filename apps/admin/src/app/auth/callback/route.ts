import { createSessionClient } from "@masseurmatch/db/auth";
import { NextResponse, type NextRequest } from "next/server";

import { safeNext } from "@/lib/safe-next";

/**
 * Where Google sends an operator back to.
 *
 * A route handler rather than a page because only route handlers, server
 * actions and middleware may write cookies — a server component that "signs you
 * in" cannot actually set the cookie that does it.
 *
 * ---------------------------------------------------------------------------
 * Only the PKCE shape
 * ---------------------------------------------------------------------------
 * The dashboard's callback also has to accept `?token_hash=&type=`, because it
 * is where confirmation and recovery **emails** land and Supabase has shipped
 * two template shapes. This app sends no mail and has no sign-up, so `?code=`
 * from the OAuth round trip is the only thing that ever arrives here. Anything
 * else is a stray visit, and gets the same fixed notice as a failure.
 *
 * ---------------------------------------------------------------------------
 * No account setup, and no role
 * ---------------------------------------------------------------------------
 * The dashboard calls `ensureProviderAccount` here for arrivals it can prove
 * are new. Nothing of the sort happens in this app, by design — see the note in
 * `../oauth-actions.ts`. This handler exchanges a code for a session and stops.
 * Whether that session may see anything is decided afterwards, by
 * `requireAdmin()` in the admin layout, from `user_roles` on the server.
 *
 * ---------------------------------------------------------------------------
 * Why a non-admin is not signed out here
 * ---------------------------------------------------------------------------
 * It reads as the careful thing to do, but it would put the authorisation
 * decision in a second place. There is one home for it — `requireAdmin()` — and
 * a rule enforced twice is a rule that eventually disagrees with itself. The
 * password form does not sign a non-admin out either, and two sign-in methods
 * that leave the browser in different states is a difference someone would
 * later have to explain.
 *
 * Holding a session here grants nothing on its own: every admin route is behind
 * the guard, and the sign-in page bounces a signed-in non-admin to
 * `/not-authorized`, which offers signing out as a choice they make.
 *
 * Failures redirect to sign-in with a fixed notice **code**, never with text
 * from the URL: an attacker-authored sentence rendered on a sign-in page is a
 * phishing surface ("your session expired, email your password to…"), so the
 * query string may only select a message, never supply one.
 */

// Stated literally, not re-exported. Next reads route segment config
// statically — a re-export is invisible to it and silently yields the default.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const next = safeNext(url.searchParams.get("next"));

  const failed = () => NextResponse.redirect(new URL("/sign-in?notice=google-failed", url.origin));

  // Supabase redirects here with `error=` when the person cancelled at Google's
  // consent screen, or when the provider itself refused.
  if (url.searchParams.get("error")) return failed();

  const code = url.searchParams.get("code");
  if (!code) return failed();

  const { data, error } = await createSessionClient().auth.exchangeCodeForSession(code);
  if (error || !data.user) return failed();

  return NextResponse.redirect(new URL(next, url.origin));
}
