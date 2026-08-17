import { describe, expect, it } from "vitest";

import {
  monthStart,
  spikeAllowance,
  spikeBlockedMessage,
  spikeEndsAt,
  spikeIsActive,
  SPIKE_DURATION_HOURS,
} from "../spikes";

/**
 * Visibility Spikes.
 *
 * The failures that matter: lifting a listing nobody paid for, and refusing a
 * therapist a credit they are owed. `now` is injected everywhere so none of
 * these depend on wall-clock timing near a boundary.
 */

const NOW = new Date("2026-09-15T12:00:00Z");

describe("spikeIsActive", () => {
  it("is active until the timestamp passes, and not after", () => {
    expect(spikeIsActive({ spike_until: "2026-09-15T12:00:01Z" }, NOW)).toBe(true);
    expect(spikeIsActive({ spike_until: "2026-09-15T11:59:59Z" }, NOW)).toBe(false);
  });

  it("treats the exact expiry instant as over", () => {
    // Strictly greater than: at the stated end, the lift has ended.
    expect(spikeIsActive({ spike_until: "2026-09-15T12:00:00Z" }, NOW)).toBe(false);
  });

  it("is inactive with no timestamp, and never lifts on a bad one", () => {
    expect(spikeIsActive({}, NOW)).toBe(false);
    expect(spikeIsActive({ spike_until: null }, NOW)).toBe(false);
    expect(spikeIsActive({ spike_until: "whenever" }, NOW)).toBe(false);
  });

  it("accepts a Date as well as a string", () => {
    expect(spikeIsActive({ spike_until: new Date("2026-09-16T00:00:00Z") }, NOW)).toBe(true);
  });
});

describe("spikeEndsAt", () => {
  it("runs for exactly the stated duration", () => {
    const ends = spikeEndsAt(NOW);
    expect(ends.getTime() - NOW.getTime()).toBe(SPIKE_DURATION_HOURS * 3600 * 1000);
  });
});

describe("monthStart", () => {
  it("is the 1st at midnight UTC", () => {
    expect(monthStart(NOW).toISOString()).toBe("2026-09-01T00:00:00.000Z");
  });

  it("does not drift on the 1st itself", () => {
    expect(monthStart(new Date("2026-09-01T00:00:00Z")).toISOString()).toBe(
      "2026-09-01T00:00:00.000Z",
    );
  });

  it("handles January without rolling back a year", () => {
    expect(monthStart(new Date("2026-01-09T05:00:00Z")).toISOString()).toBe(
      "2026-01-01T00:00:00.000Z",
    );
  });
});

describe("spikeAllowance", () => {
  it("lets a Pro with none used spend one", () => {
    const a = spikeAllowance({ perMonth: 6, usedThisMonth: 0, now: NOW });
    expect(a.remaining).toBe(6);
    expect(a.canSpend).toBe(true);
    expect(a.blockedBecause).toBeNull();
  });

  it("refuses Free, and says it is a plan matter rather than a quota one", () => {
    const a = spikeAllowance({ perMonth: 0, usedThisMonth: 0, now: NOW });
    expect(a.canSpend).toBe(false);
    expect(a.blockedBecause).toBe("no-plan-allowance");
  });

  it("refuses once the month's credits are gone", () => {
    const a = spikeAllowance({ perMonth: 2, usedThisMonth: 2, now: NOW });
    expect(a.remaining).toBe(0);
    expect(a.blockedBecause).toBe("quota-spent");
  });

  it("refuses while one is already running, even with credits left", () => {
    // Stacking would let someone burn a month's allowance by accident.
    const a = spikeAllowance({
      perMonth: 12,
      usedThisMonth: 1,
      spike_until: "2026-09-15T18:00:00Z",
      now: NOW,
    });
    expect(a.remaining).toBe(11);
    expect(a.canSpend).toBe(false);
    expect(a.blockedBecause).toBe("already-active");
  });

  it("allows another once the running one has expired", () => {
    const a = spikeAllowance({
      perMonth: 12,
      usedThisMonth: 1,
      spike_until: "2026-09-15T11:00:00Z",
      now: NOW,
    });
    expect(a.canSpend).toBe(true);
  });

  it("never reports negative remaining, even if usage overran the plan", () => {
    // A downgrade mid-month can leave usage above the new allowance.
    const a = spikeAllowance({ perMonth: 2, usedThisMonth: 9, now: NOW });
    expect(a.remaining).toBe(0);
    expect(a.canSpend).toBe(false);
  });

  it("ignores nonsense inputs rather than trusting them", () => {
    const a = spikeAllowance({ perMonth: -5, usedThisMonth: -3, now: NOW });
    expect(a.perMonth).toBe(0);
    expect(a.usedThisMonth).toBe(0);
    expect(a.canSpend).toBe(false);
  });

  it("reports no-plan-allowance ahead of anything else", () => {
    // A Free profile with a stale active spike is still a plan problem, and
    // "upgrade" is the useful thing to say.
    const a = spikeAllowance({
      perMonth: 0,
      usedThisMonth: 0,
      spike_until: "2026-09-16T00:00:00Z",
      now: NOW,
    });
    expect(a.blockedBecause).toBe("no-plan-allowance");
  });
});

describe("spikeBlockedMessage", () => {
  it("explains every blocked reason and stays silent when allowed", () => {
    expect(spikeBlockedMessage("no-plan-allowance")).toMatch(/Standard/);
    expect(spikeBlockedMessage("quota-spent")).toMatch(/1st/);
    expect(spikeBlockedMessage("already-active")).toMatch(/running/i);
    expect(spikeBlockedMessage(null)).toBeNull();
  });
});
