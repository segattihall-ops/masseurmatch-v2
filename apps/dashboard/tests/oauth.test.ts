import { describe, expect, it } from "vitest";

import { isNewAccount, NEW_ACCOUNT_WINDOW_MS } from "@/lib/oauth";

/**
 * The rule that decides whether a Google arrival gets the `provider` role.
 *
 * Worth testing precisely because both mistakes are silent: too strict and a
 * new therapist lands on /not-authorized, too loose and an existing account is
 * promoted by signing in.
 */

const NOW = Date.parse("2026-08-18T12:00:00.000Z");
const ago = (ms: number) => new Date(NOW - ms).toISOString();

describe("isNewAccount", () => {
  it("accepts an account created during the redirect to Google and back", () => {
    expect(isNewAccount(ago(0), NOW)).toBe(true);
    expect(isNewAccount(ago(30_000), NOW)).toBe(true);
    expect(isNewAccount(ago(NEW_ACCOUNT_WINDOW_MS), NOW)).toBe(true);
  });

  it("refuses a returning user", () => {
    expect(isNewAccount(ago(NEW_ACCOUNT_WINDOW_MS + 1), NOW)).toBe(false);
    expect(isNewAccount(ago(86_400_000), NOW)).toBe(false);
    expect(isNewAccount("2026-08-15T02:23:31.000Z", NOW)).toBe(false);
  });

  it("refuses rather than guesses when the timestamp is unusable", () => {
    expect(isNewAccount(undefined, NOW)).toBe(false);
    expect(isNewAccount(null, NOW)).toBe(false);
    expect(isNewAccount("", NOW)).toBe(false);
    expect(isNewAccount("not a date", NOW)).toBe(false);
  });

  it("refuses a future timestamp, which is clock skew and not a new account", () => {
    // Otherwise a server running behind the auth server would treat one
    // account as newly created for as long as the skew lasted.
    expect(isNewAccount(new Date(NOW + 60_000).toISOString(), NOW)).toBe(false);
  });
});
