import { describe, expect, it } from "vitest";

import { coachAdvice, type CoachSignals } from "../coach";

/**
 * Coach.
 *
 * The advice must be ordered by what is actually worth most, and every line
 * must name the number behind it — a coach that asserts without evidence is
 * indistinguishable from the invented figures this dashboard used to print.
 */

const base: CoachSignals = {
  scoreTotal: 100,
  scoreActions: [],
  views: 40,
  previousViews: 40,
  demand: null,
  keywords: [],
  cityPeers: 0,
  canSpike: false,
  availableNow: false,
};

describe("coachAdvice", () => {
  it("says nothing when there is nothing to say", () => {
    expect(coachAdvice(base)).toEqual([]);
  });

  it("puts profile gaps above everything else", () => {
    // Distribution cannot fix a thin profile; sending more people to it first
    // just shows more people the same gap.
    const advice = coachAdvice({
      ...base,
      scoreTotal: 60,
      scoreActions: [{ id: "photos", action: "Add 2 more photos.", href: "/onboarding", gap: 14 }],
      canSpike: true,
      demand: { score: 80, direction: "rising" },
      keywords: [{ keyword: "deep tissue", change: 20 }],
    });

    expect(advice[0]?.id).toBe("profile-photos");
  });

  it("orders profile gaps by what they are worth", () => {
    const advice = coachAdvice({
      ...base,
      scoreTotal: 50,
      scoreActions: [
        { id: "rates", action: "Add your outcall rate.", href: "/profile", gap: 5 },
        { id: "photos", action: "Add 3 more photos.", href: "/onboarding", gap: 21 },
      ],
    });

    expect(advice.map((a) => a.id)).toEqual(["profile-photos", "profile-rates"]);
  });

  it("only suggests a Spike when there is one to spend", () => {
    const rising = { score: 80, direction: "rising" as const };
    expect(
      coachAdvice({ ...base, demand: rising, canSpike: false }).map((a) => a.id),
    ).not.toContain("spike-rising-demand");
    expect(coachAdvice({ ...base, demand: rising, canSpike: true }).map((a) => a.id)).toContain(
      "spike-rising-demand",
    );
  });

  it("does not call a small swing in views a fall", () => {
    // 3 views against 5 is noise. Naming it invites a fix for nothing.
    expect(coachAdvice({ ...base, views: 3, previousViews: 5 }).map((a) => a.id)).not.toContain(
      "views-falling",
    );
    expect(coachAdvice({ ...base, views: 20, previousViews: 40 }).map((a) => a.id)).toContain(
      "views-falling",
    );
  });

  it("grounds every line in a number", () => {
    const advice = coachAdvice({
      ...base,
      scoreTotal: 60,
      scoreActions: [{ id: "bio", action: "Write more.", href: "/profile", gap: 12 }],
      demand: { score: 80, direction: "rising" },
      canSpike: true,
      keywords: [{ keyword: "sports", change: 18 }],
      cityPeers: 9,
      views: 10,
      previousViews: 40,
    });

    expect(advice.length).toBeGreaterThan(3);
    for (const item of advice) {
      expect(item.because, item.id).toMatch(/\d/);
    }
  });

  it("keeps the Available Now nudge below real problems", () => {
    const advice = coachAdvice({
      ...base,
      scoreTotal: 60,
      scoreActions: [{ id: "photos", action: "Add photos.", href: "/onboarding", gap: 20 }],
      demand: { score: 70, direction: "rising" },
      availableNow: false,
    });

    const ids = advice.map((a) => a.id);
    expect(ids.indexOf("available-now")).toBeGreaterThan(ids.indexOf("profile-photos"));
  });

  it("is deterministic when weights tie", () => {
    const signals = {
      ...base,
      scoreTotal: 50,
      scoreActions: [
        { id: "b", action: "B", href: "/profile", gap: 10 },
        { id: "a", action: "A", href: "/profile", gap: 10 },
      ],
    };
    expect(coachAdvice(signals).map((a) => a.id)).toEqual(coachAdvice(signals).map((a) => a.id));
    expect(coachAdvice(signals).map((a) => a.id)).toEqual(["profile-a", "profile-b"]);
  });
});
