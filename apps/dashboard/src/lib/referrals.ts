/**
 * Referral links, as rules rather than as database access.
 *
 * Pure so the link format and the code check can be tested directly, and so the
 * short-link route, the sign-up flow and the referrals page all agree without
 * importing each other. The reads and writes live in `./referral-rewards.ts`.
 */

/**
 * Where a referred therapist's code is kept between clicking the link and
 * confirming their email.
 *
 * A cookie rather than a query parameter carried through the flow, because the
 * flow leaves the browser: sign-up sends a confirmation email, and the link in
 * it comes back to `/auth/callback` with nothing of ours on it. Anything not
 * stored client-side is lost at that hop, which is how a referral programme
 * ends up attributing nobody.
 */
export const REFERRAL_COOKIE = "mm_ref";

/** Thirty days. Long enough to read an email; short enough not to follow someone around. */
export const REFERRAL_COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

/**
 * A referral code, or null.
 *
 * `make_referral_code()` in the database decides the real format, so this only
 * enforces what any of them must be: short, and made of characters that are
 * safe in a path segment. Deliberately not upper-cased — a code that differs
 * only in case is still a different code, and normalising here would send
 * credit to the wrong account.
 */
export function normaliseReferralCode(value: string | null | undefined): string | null {
  const code = (value ?? "").trim();
  if (code.length < 3 || code.length > 40) return null;
  return /^[A-Za-z0-9_-]+$/.test(code) ? code : null;
}

/**
 * The link a therapist shares.
 *
 * `/r/<code>` rather than `/sign-up?ref=<code>`: the short route is a request
 * we handle, so it can drop the code into a cookie before anyone signs up. That
 * is what makes "Sign up with Google" attribute too — the OAuth round trip
 * carries no form fields of ours, so a query parameter on the sign-up page
 * would only ever work for the email-and-password path.
 */
export function referralSignUpUrl(origin: string, code: string): string {
  return `${origin.replace(/\/$/, "")}/r/${encodeURIComponent(code)}`;
}
