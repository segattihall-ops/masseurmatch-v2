import { describe, expect, it } from "vitest";

import { currentDemand, demandLabel, risingKeywords, type DemandRow } from "../demand";

/**
 * Demand Radar.
 *
 * `demand_scores` holds real rows next to sample ones, and the sample rows are
 * already expired. Either reaching a therapist would be the same failure as the
 * invented figures this dashboard used to print.
 */

const NOW = new Date("2026-08-17T12:00:00Z");

const row = (over: Partial<DemandRow> = {}): DemandRow => ({
  city: "Denver",
  state: "CO",
  score: 60,
  trend: "steady",
  search_volume_index: null,
  competition_index: null,
  week_start: "2026-08-10",
  is_sample: false,
  expires_at: null,
  ...over,
});

describe("currentDemand", () => {
  it("never returns a sample row", () => {
    expect(currentDemand([row({ is_sample: true })], NOW)).toBeNull();
  });

  it("never returns an expired row", () => {
    expect(currentDemand([row({ expires_at: "2026-06-08T00:00:00Z" })], NOW)).toBeNull();
    expect(currentDemand([row({ expires_at: "2026-12-01T00:00:00Z" })], NOW)).not.toBeNull();
  });

  it("prefers a real row over a sample one for the same city", () => {
    const reading = currentDemand(
      [row({ is_sample: true, score: 99, week_start: "2026-08-17" }), row({ score: 42 })],
      NOW,
    );
    expect(reading?.score).toBe(42);
  });

  it("picks the most recent week without trusting the caller's order", () => {
    const reading = currentDemand(
      [row({ week_start: "2026-08-03", score: 10 }), row({ week_start: "2026-08-17", score: 80 })],
      NOW,
    );
    expect(reading?.score).toBe(80);
  });

  it("returns null for a city with nothing, rather than a zero", () => {
    // Most cities have no reading. A zero would read as "nobody wants you here".
    expect(currentDemand([], NOW)).toBeNull();
    expect(currentDemand([row({ score: null })], NOW)).toBeNull();
  });

  it("normalises whatever spelling the collector used", () => {
    expect(currentDemand([row({ trend: "rising" })], NOW)?.direction).toBe("rising");
    expect(currentDemand([row({ trend: "UP" })], NOW)?.direction).toBe("rising");
    expect(currentDemand([row({ trend: "cooling" })], NOW)?.direction).toBe("cooling");
    expect(currentDemand([row({ trend: "falling" })], NOW)?.direction).toBe("cooling");
    // Anything unrecognised claims the least.
    expect(currentDemand([row({ trend: "banana" })], NOW)?.direction).toBe("steady");
    expect(currentDemand([row({ trend: null })], NOW)?.direction).toBe("steady");
  });
});

describe("demandLabel", () => {
  it("says there is no data instead of implying zero demand", () => {
    expect(demandLabel(null)).toBe("No demand data for your city yet.");
  });

  it("reads like a sentence", () => {
    expect(
      demandLabel({ score: 80, direction: "rising", competition: null, weekStart: null }),
    ).toBe("Busy and picking up.");
    expect(
      demandLabel({ score: 50, direction: "steady", competition: null, weekStart: null }),
    ).toBe("Steady and level.");
    expect(
      demandLabel({ score: 20, direction: "cooling", competition: null, weekStart: null }),
    ).toBe("Quiet and easing off.");
  });
});

describe("risingKeywords", () => {
  it("keeps only what is actually rising", () => {
    const rising = risingKeywords([
      { keyword: "deep tissue", score: 80, week_over_week_change: 12, date: "2026-08-11" },
      { keyword: "sports", score: 70, week_over_week_change: -5, date: "2026-08-11" },
      { keyword: "swedish", score: 60, week_over_week_change: 0, date: "2026-08-11" },
    ]);
    expect(rising.map((k) => k.keyword)).toEqual(["deep tissue"]);
  });

  it("collapses the collector's daily rows to one per keyword", () => {
    // One row per keyword per day; without this the same word fills the list.
    const rising = risingKeywords([
      { keyword: "deep tissue", score: 70, week_over_week_change: 8, date: "2026-08-09" },
      { keyword: "deep tissue", score: 80, week_over_week_change: 15, date: "2026-08-11" },
      { keyword: "sports", score: 60, week_over_week_change: 10, date: "2026-08-11" },
    ]);
    expect(rising).toEqual([
      { keyword: "deep tissue", score: 80, change: 15 },
      { keyword: "sports", score: 60, change: 10 },
    ]);
  });

  it("ignores blank keywords and missing changes", () => {
    expect(
      risingKeywords([
        { keyword: "  ", score: 90, week_over_week_change: 40, date: null },
        { keyword: "reiki", score: 50, week_over_week_change: null, date: null },
      ]),
    ).toEqual([]);
  });

  it("respects the limit", () => {
    const rows = Array.from({ length: 10 }, (_, i) => ({
      keyword: `k${i}`,
      score: 50,
      week_over_week_change: i + 1,
      date: null,
    }));
    expect(risingKeywords(rows, 3)).toHaveLength(3);
  });
});
