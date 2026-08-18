import { createSessionClient } from "@masseurmatch/db/auth";
import { NextResponse, type NextRequest } from "next/server";

import { ensureProviderAccount } from "@/lib/account-setup";
import { isNewAccount } from "@/lib/oauth";
import { safeNext } from "@/lib/safe-next";

/**
 * Where a confirmation or magic-link email lands.
 *
 * The link carries a one-time credential; this exchanges it for a session
 * cookie and sends the person to their dashboard. A route handler rather than a
 * page because only route handlers, server actions and middleware may write
 * cookies — a server component that "signs you in" cannot actually set the
 * cookie that does it.
 *
 * Two shapes are accepted because Supabase has shipped both, and which one
 * arrives depends on the email template stored in the project rather than on
 * anything in this repository:
 *
 *   - `?code=…`        — PKCE. Exchanged for a session. The verifier lives in a
 *                        cookie set when the account was created, so the link
 *                        only works in the browser that signed up. That is a
 *                        property of PKCE, not a bug to route around.
 *   - `?token_hash=…&type=…` — the newer default template. Verified directly.
 *
 * Account setup runs only for an arrival that created an account. The same
 * handler is where a **password recovery** link lands, and running setup there
 * would mean an existing account with no `user_roles` row — which today
 * resolves to `client` — silently became a `provider` by resetting its
 * password. So sign-up marks its own link with `setup=1`, and nothing else is
 * trusted to imply it.
 *
 * Google is the exception that needs a second rule. "Sign up with Google" and
 * "Sign in with Google" are the same request, so its `setup=oauth` marker says
 * only *which flow* this was, not that anyone is new; whether the account is
 * actually new is decided from the auth user's `created_at`. See `@/lib/oauth`.
 *
 * Anything else, or a failure, goes back to sign-in with a fixed notice code.
 * Never with text from the URL: an attacker-authored sentence rendered on the
 * sign-in page is a phishing surface ("your session expired, email your
 * password to…"), so the query string may only select a message, never supply it.
 */

// Stated literally, not re-exported. Next reads route segment config
// statically — a re-export is invisible to it and silently yields the default.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The `type` values Supabase puts on an email link. */
const EMAIL_LINK_TYPES = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
] as const;

type EmailLinkType = (typeof EMAIL_LINK_TYPES)[number];

function emailLinkType(value: string | null): EmailLinkType | null {
  return EMAIL_LINK_TYPES.find((type) => type === value) ?? null;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const next = safeNext(url.searchParams.get("next"));

  const failed = (reason: string) =>
    NextResponse.redirect(new URL(`/sign-in?notice=${reason}`, url.origin));

  // Supabase redirects here with `error=` when the link has already been used
  // or has expired, before any exchange is attempted.
  if (url.searchParams.get("error")) return failed("link-expired");

  const supabase = createSessionClient();
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = emailLinkType(url.searchParams.get("type"));

  const result = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : null;

  if (!result) return failed("link-invalid");
  if (result.error || !result.data.user) return failed("link-expired");

  // The second attempt at account setup, for sign-up links only — see the note
  // about recovery links above. Sign-up already tried once; if that call failed
  // the account would otherwise be confirmed, signed in, and stranded on
  // /not-authorized with no way back. This is the repair, and it writes nothing
  // when the first attempt succeeded.
  const setup = url.searchParams.get("setup");
  const createdAnAccount =
    setup === "1" ||
    type === "signup" ||
    type === "invite" ||
    (setup === "oauth" && isNewAccount(result.data.user.created_at, Date.now()));

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
      console.error("[auth/callback] could not finish account setup", cause);
      return failed("setup-failed");
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
