import { NextResponse, type NextRequest } from "next/server";

import { normaliseReferralCode, REFERRAL_COOKIE, REFERRAL_COOKIE_MAX_AGE } from "@/lib/referrals";

/**
 * A referral link.
 *
 * `/r/<code>` remembers the code and sends the visitor to sign-up. A route
 * handler because only route handlers, server actions and middleware may write
 * cookies — a page cannot, and the cookie is the whole point: the sign-up flow
 * leaves the browser for an email and comes back with nothing of ours attached,
 * so the code has to be waiting when it returns.
 *
 * An unusable code still redirects. Someone who followed a mangled link should
 * land on sign-up, not on an error — the referral is worth less than the
 * signup, and telling a stranger their friend's code is malformed helps nobody.
 *
 * The cookie is `httpOnly` and `lax`: nothing in the browser needs to read it,
 * and it must not ride along on cross-site requests.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: NextRequest, { params }: { params: { code: string } }): NextResponse {
  const url = new URL(request.url);
  const response = NextResponse.redirect(new URL("/sign-up", url.origin));

  const code = normaliseReferralCode(params.code);
  if (code) {
    response.cookies.set({
      name: REFERRAL_COOKIE,
      value: code,
      httpOnly: true,
      sameSite: "lax",
      secure: url.protocol === "https:",
      path: "/",
      maxAge: REFERRAL_COOKIE_MAX_AGE,
    });
  }

  return response;
}
