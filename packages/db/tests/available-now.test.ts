import { describe, expect, it } from "vitest";

import {
  availableNowEndsAt,
  availableNowLapsed,
  availableNowRemaining,
  availableUntil,
  isAvailableNow,
} from "../available-now";

/**
 * Available Now.
 *
 * The failure that matters is a badge nobody can turn off. In the old repo the
 * directory accepted a null expiry as "available", while every other reader
 * required a future timestamp — so a row with the flag set and no expiry was
 * permanently available in the one place clients look.
 */

const NOW = new Date("2026-08-17T12:00:00Z");
const inHours = (h: number) => new Date(NOW.getTime() + h * 3_600_000).toISOString();

describe("isAvailableNow", () => {
  it("requires a future expiry, not just the flag", () => {
    expect(isAvailableNow({ available_now: true, available_now_expires: null }, NOW)).toBe(false);
    expect(isAvailableNow({ available_now: true, available_now_expires: undefined }, NOW)).toBe(
      false,
    );
    expect(isAvailableNow({ available_now: true, available_now_expires: inHours(1) }, NOW)).toBe(
      true,
    );
  });

  it("is false once the window has passed", () => {
    expect(isAvailableNow({ available_now: true, available_now_expires: inHours(-1) }, NOW)).toBe(
      false,
    );
  });

  it("is false when the flag is off, whatever the expiry says", () => {
    expect(isAvailableNow({ available_now: false, available_now_expires: inHours(5) }, NOW)).toBe(
      false,
    );
    expect(isAvailableNow({}, NOW)).toBe(false);
  });

  it("treats an unparseable expiry as not available", () => {
    expect(isAvailableNow({ available_now: true, available_now_expires: "whenever" }, NOW)).toBe(
      false,
    );
  });

  it("accepts a Date as well as a string", () => {
    expect(
      isAvailableNow({ available_now: true, available_now_expires: new Date(inHours(2)) }, NOW),
    ).toBe(true);
  });
});

describe("availableUntil", () => {
  it("returns the end of a running window and nothing otherwise", () => {
    expect(
      availableUntil(
        { available_now: true, available_now_expires: inHours(2) },
        NOW,
      )?.toISOString(),
    ).toBe(inHours(2));
    expect(availableUntil({ available_now: true, available_now_expires: null }, NOW)).toBeNull();
  });
});

describe("availableNowLapsed", () => {
  it("distinguishes 'forgot to turn it off' from 'never on'", () => {
    expect(
      availableNowLapsed({ available_now: true, available_now_expires: inHours(-1) }, NOW),
    ).toBe(true);
    expect(
      availableNowLapsed({ available_now: true, available_now_expires: inHours(1) }, NOW),
    ).toBe(false);
    expect(availableNowLapsed({ available_now: false }, NOW)).toBe(false);
  });
});

describe("availableNowEndsAt", () => {
  it("adds the plan's hours", () => {
    expect(availableNowEndsAt(2, NOW).toISOString()).toBe(inHours(2));
  });

  it("never goes backwards on a nonsense duration", () => {
    // Free is zero hours, and a negative would put the expiry in the past —
    // which reads as "available" for exactly as long as it takes to notice.
    expect(availableNowEndsAt(0, NOW).getTime()).toBe(NOW.getTime());
    expect(availableNowEndsAt(-5, NOW).getTime()).toBe(NOW.getTime());
  });
});

describe("availableNowRemaining", () => {
  it("says something a person would say", () => {
    const at = (mins: number) => ({
      available_now: true,
      available_now_expires: new Date(NOW.getTime() + mins * 60_000).toISOString(),
    });

    expect(availableNowRemaining(at(40), NOW)).toBe("Available for another 40 min");
    expect(availableNowRemaining(at(120), NOW)).toBe("Available for another 2h");
    expect(availableNowRemaining(at(95), NOW)).toBe("Available for another 1h 35m");
    expect(availableNowRemaining({ available_now: false }, NOW)).toBeNull();
  });
});
