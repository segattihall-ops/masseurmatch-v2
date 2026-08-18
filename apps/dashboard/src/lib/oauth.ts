/**
 * Telling a brand-new OAuth account from a returning one.
 *
 * ---------------------------------------------------------------------------
 * Why this is needed at all
 * ---------------------------------------------------------------------------
 * Password sign-up knows it created an account, so it marks its confirmation
 * link `setup=1` and the callback grants the `provider` role on the strength of
 * that. Google has no such distinction: "Sign up with Google" and "Sign in with
 * Google" are the same request, and Supabase answers both with a session.
 *
 * Granting a role on every Google sign-in would be wrong in one specific way.
 * `ensureProviderAccount` never overwrites an existing row, so an admin or an
 * existing provider is safe — but an account with *no* `user_roles` row resolves
 * to `client` today, and signing in with Google would silently promote it to
 * `provider`. That is the same mistake the password-recovery link nearly made.
 *
 * `created_at` on the auth user settles it: a returning user's is old. The
 * window is generous because it spans a redirect to Google and back, including
 * a first-time consent screen, on a slow connection — and it costs nothing to
 * be generous, since the only thing on the other side of it is a role the
 * account would have been given at sign-up anyway.
 */

/** How recently the auth user must have been created to count as new. */
export const NEW_ACCOUNT_WINDOW_MS = 10 * 60 * 1000;

/**
 * Was this auth user created moments ago?
 *
 * Returns false for anything unparseable rather than true: the failure mode of
 * a wrong `false` is a new therapist landing on /not-authorized once and asking
 * why, and of a wrong `true` is handing out a role to an existing account.
 * Those are not equally bad.
 */
export function isNewAccount(createdAt: string | null | undefined, now: number): boolean {
  if (!createdAt) return false;
  const created = Date.parse(createdAt);
  if (Number.isNaN(created)) return false;
  // Also refuses a timestamp in the future, which is not a fresh account but a
  // clock disagreement, and would otherwise pass for as long as the skew lasts.
  const age = now - created;
  return age >= 0 && age <= NEW_ACCOUNT_WINDOW_MS;
}
