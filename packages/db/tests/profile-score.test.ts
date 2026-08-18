import { describe, expect, it } from "vitest";

import { scoreProfile, scoreSummary, type ProfileScoreInput } from "../profile-score";

/**
 * Profile Score.
 *
 * The failures that matter are a score that punishes someone for upgrading, a
 * score that cannot reach 100 on the plan the therapist actually has, and a
 * "what to do next" list whose first item is not the most valuable one.
 */

/** A profile that has just cleared onboarding: live, but bare. */
const minimal: ProfileScoreInput = {
  headline: "Deep tissue",
  bio: "x".repeat(50),
  service_categories: ["Swedish"],
  incall_price: 120,
  outcall_price: null,
  photoCount: 1,
  photoLimit: 3,
};

/** Everything filled in, on the Free plan. */
const complete: ProfileScoreInput = {
  headline: "y".repeat(60),
  bio: "z".repeat(400),
  service_categories: ["Swedish", "Deep tissue", "Sports"],
  incall_price: 120,
  outcall_price: 160,
  photoCount: 3,
  photoLimit: 3,
};

describe("scoreProfile", () => {
  it("never exceeds 100 or drops below 0", () => {
    const empty: ProfileScoreInput = {
      headline: null,
      bio: null,
      service_categories: null,
      incall_price: null,
      outcall_price: null,
      photoCount: 0,
      photoLimit: 3,
    };

    expect(scoreProfile(empty).total).toBe(0);
    expect(scoreProfile(complete).total).toBe(100);
  });

  it("reaches 100 on every plan, Free included", () => {
    // The score measures whether you used what you have. A Free profile that
    // cannot ever show a full score would read as a permanent nag to upgrade.
    for (const photoLimit of [3, 6, 9, 12]) {
      const filled = { ...complete, photoLimit, photoCount: Math.min(photoLimit, 5) };
      expect(scoreProfile(filled).total, `limit ${photoLimit}`).toBe(100);
    }
  });

  it("does not drop when a plan is upgraded", () => {
    // Scoring photos against the raw plan limit would take a therapist from 100
    // to 65 the moment they paid for more slots. Nothing about their profile
    // changed, so nothing about the score should.
    const onFree = scoreProfile({ ...complete, photoLimit: 3, photoCount: 3 });
    const sameProfileOnElite = scoreProfile({ ...complete, photoLimit: 12, photoCount: 3 });

    expect(onFree.total).toBe(100);
    expect(sameProfileOnElite.total).toBeGreaterThanOrEqual(onFree.total - 14);
    // And more photos never hurts.
    expect(scoreProfile({ ...complete, photoLimit: 12, photoCount: 5 }).total).toBe(100);
  });

  it("gives partial credit rather than all-or-nothing", () => {
    // The old implementation scored `Boolean(profile.bio)`, so a one-character
    // bio counted the same as a written one. Half a bio should be half the
    // marks, or the score cannot distinguish a thin profile from a full one.
    const half = scoreProfile({ ...complete, bio: "z".repeat(150) });
    const full = scoreProfile(complete);

    expect(half.total).toBeLessThan(full.total);
    expect(half.checks.find((c) => c.id === "bio")?.earned).toBe(13);
  });

  it("orders the to-do list by points still available", () => {
    const score = scoreProfile(minimal);

    expect(score.todo.length).toBeGreaterThan(0);
    // Photos carry the most weight and this profile has one of three.
    expect(score.todo[0]?.id).toBe("photos");

    const gaps = score.todo.map((c) => c.possible - c.earned);
    expect(gaps).toEqual([...gaps].sort((a, b) => b - a));
  });

  it("leaves nothing to do at 100", () => {
    const score = scoreProfile(complete);
    expect(score.todo).toEqual([]);
    expect(score.checks.every((c) => c.action === null)).toBe(true);
  });

  it("names the rate that is missing, not just 'rates'", () => {
    const noOutcall = scoreProfile({ ...complete, outcall_price: null });
    const noIncall = scoreProfile({ ...complete, incall_price: null });

    expect(noOutcall.checks.find((c) => c.id === "rates")?.action).toContain("outcall");
    expect(noIncall.checks.find((c) => c.id === "rates")?.action).toContain("incall");
    // Half the marks for half the rates.
    expect(noOutcall.checks.find((c) => c.id === "rates")?.earned).toBe(5);
  });

  it("ignores blank entries in service_categories", () => {
    // The column is a free-text array; empty strings would otherwise buy points.
    const padded = scoreProfile({ ...complete, service_categories: ["Swedish", "", "   "] });
    expect(padded.checks.find((c) => c.id === "services")?.earned).toBe(5);
  });

  it("survives nonsense photo limits without dividing by zero", () => {
    for (const photoLimit of [0, -3]) {
      const score = scoreProfile({ ...complete, photoLimit, photoCount: 1 });
      expect(Number.isFinite(score.total), `limit ${photoLimit}`).toBe(true);
      expect(score.total).toBeLessThanOrEqual(100);
    }
  });

  it("counts every check toward exactly 100 possible points", () => {
    // A weight added without adjusting the others would silently make 100
    // unreachable, and nothing else would fail.
    const total = scoreProfile(complete).checks.reduce((sum, c) => sum + c.possible, 0);
    expect(total).toBe(100);
  });

  it("gives every check somewhere to go", () => {
    for (const check of scoreProfile(minimal).checks) {
      expect(check.href, check.id).toMatch(/^\/(profile|onboarding)/);
    }
  });
});

describe("scoreSummary", () => {
  it("does not grade the therapist", () => {
    // No badges, no tiers. The number plus the next action is the whole product.
    const summaries = [0, 40, 60, 85, 100].map((total) =>
      scoreSummary({ total, checks: [], todo: [] }),
    );

    for (const line of summaries) {
      expect(line).not.toMatch(/bronze|silver|gold|platinum|grade|rank/i);
    }
    expect(new Set(summaries).size).toBeGreaterThan(1);
  });
});
