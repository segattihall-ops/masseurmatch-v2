import { describe, expect, it } from "vitest";

import {
  currentDemand,
  demandLabel,
  marketStanding,
  risingKeywords,
  type DemandRow,
} from "../demand";

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

  /*
   * This used to assert "Busy and picking up." for a score of 80, "Quiet" for
   * 20, and so on — an absolute bucketing of `score` at 70 and 40.
   *
   * No row in this database has ever looked like that. Measured across the 59
   * live readings: the range is 7 to 13, mean 9.3. So every real city fell
   * under 40 and the function called all of them "Quiet", while the page above
   * it rendered "10" beside the words "out of 100". The test passed the whole
   * time, because it tested three scores that do not occur.
   *
   * The label reads from the ranking now, so these exercise the scale the data
   * actually has.
   */
  it("describes a real score by where it ranks", () => {
    const reading = { score: 11, direction: "rising" as const, competition: null, weekStart: null };

    expect(demandLabel(reading, { rank: 3, total: 59, percentile: 96 })).toBe(
      "Among the busiest markets we collect — 3rd of 59 cities this week, and picking up.",
    );
    expect(demandLabel(reading, { rank: 30, total: 59, percentile: 50 })).toContain(
      "A middling market",
    );
    expect(demandLabel(reading, { rank: 58, total: 59, percentile: 2 })).toContain(
      "A quieter market",
    );
  });

  it("carries the direction through whatever the ranking says", () => {
    const cooling = { score: 9, direction: "cooling" as const, competition: null, weekStart: null };
    expect(demandLabel(cooling, { rank: 40, total: 59, percentile: 33 })).toContain("easing off");
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

describe("marketStanding", () => {
  // The scale this exists for: measured across the 59 live readings in this
  // database the range is 7 to 13, mean 9.3. An absolute bucketing of that —
  // `score >= 70 ? "Busy"` — labels every city in the country "Quiet", and a
  // page saying "10 out of 100" tells a therapist their market is dead.
  const live = [13, 11, 11, 10, 10, 10, 9, 8, 8, 7];

  it("ranks a score against the week's other cities", () => {
    expect(marketStanding(live, 13)).toEqual({ rank: 1, total: 10, percentile: 100 });
    expect(marketStanding(live, 7)).toEqual({ rank: 10, total: 10, percentile: 0 });
  });

  it("gives tied cities the same rank", () => {
    // Three cities on 10: all fourth, none told it trails a score it matches.
    expect(marketStanding(live, 10)?.rank).toBe(4);
    expect(marketStanding(live, 11)?.rank).toBe(2);
  });

  it("separates cities the absolute scale cannot", () => {
    // 13 and 7 are four points apart and both "Quiet" on a 0-100 bucketing.
    expect(marketStanding(live, 13)!.percentile).toBeGreaterThan(
      marketStanding(live, 7)!.percentile,
    );
  });

  it("calls a single-city week the top of its table", () => {
    expect(marketStanding([9], 9)).toEqual({ rank: 1, total: 1, percentile: 100 });
  });

  it("has nothing to say with nothing to compare against", () => {
    expect(marketStanding([], 9)).toBeNull();
  });
});

describe("demandLabel with a standing", () => {
  it("describes the market by where it ranks, not by the raw number", () => {
    const reading = { score: 10, direction: "rising" as const, competition: null, weekStart: null };
    const busy = demandLabel(reading, { rank: 2, total: 59, percentile: 98 });
    expect(busy).toContain("busiest");
    expect(busy).toContain("2nd of 59");

    const quiet = demandLabel(reading, { rank: 55, total: 59, percentile: 7 });
    expect(quiet).toContain("quieter");
  });

  it("still says something useful with no standing", () => {
    const reading = { score: 10, direction: "steady" as const, competition: null, weekStart: null };
    expect(demandLabel(reading, null)).toContain("Collected this week");
    expect(demandLabel(null, null)).toBe("No demand data for your city yet.");
  });
});
