import { describe, expect, it } from "vitest";

import {
  MIN_BASELINE_FOR_PERCENT,
  summariseViews,
  trendLabel,
  trendOf,
  type ViewRow,
} from "../analytics";

/**
 * View analytics.
 *
 * The dashboard this replaces printed "1,284 profile views, +12% vs last week"
 * with nothing behind it. The failure to guard against now is subtler: real
 * numbers, presented so small a sample reads as a trend.
 */

const NOW = new Date("2026-08-17T12:00:00Z");
const at = (daysBack: number, extra: Partial<ViewRow> = {}): ViewRow => ({
  created_at: new Date(NOW.getTime() - daysBack * 86_400_000).toISOString(),
  source: null,
  viewer_city: null,
  viewer_state: null,
  session_id: null,
  ...extra,
});

describe("trendOf", () => {
  it("refuses a percentage when the baseline is too small to carry one", () => {
    // 1 view to 4 is "+300%", which is a sentence about nothing.
    const trend = trendOf(4, 1);
    expect(trend.kind).toBe("count");
    if (trend.kind === "count") expect(trend.change).toBe(3);
  });

  it("uses a percentage once the baseline can support it", () => {
    const trend = trendOf(60, 50);
    expect(trend.kind).toBe("percent");
    if (trend.kind === "percent") {
      expect(trend.change).toBe(20);
      expect(trend.up).toBe(true);
    }
  });

  it("switches mode exactly at the threshold, not near it", () => {
    expect(trendOf(10, MIN_BASELINE_FOR_PERCENT - 1).kind).toBe("count");
    expect(trendOf(10, MIN_BASELINE_FOR_PERCENT).kind).toBe("percent");
  });

  it("says too early rather than inventing a comparison from nothing", () => {
    expect(trendOf(0, 0).kind).toBe("too-early");
  });

  it("reports a fall as a fall", () => {
    const trend = trendOf(30, 50);
    expect(trend.kind).toBe("percent");
    if (trend.kind === "percent") expect(trend.up).toBe(false);
  });
});

describe("trendLabel", () => {
  it("reads like a sentence a person would say", () => {
    expect(trendLabel(trendOf(0, 0), 7)).toBe("Too early to compare");
    expect(trendLabel(trendOf(4, 1), 7)).toBe("3 more than the week before");
    expect(trendLabel(trendOf(1, 4), 7)).toBe("3 fewer than the week before");
    expect(trendLabel(trendOf(60, 50), 7)).toBe("Up 20% on the week before");
    expect(trendLabel(trendOf(50, 50), 30)).toBe("Level with the previous 30 days");
    expect(trendLabel(trendOf(3, 3), 7)).toBe("Same as the week before");
  });
});

describe("summariseViews", () => {
  it("splits the window from the one before it", () => {
    const stats = summariseViews([at(1), at(3), at(6), at(9), at(12), at(20)], 7, NOW);
    // Days 1, 3 and 6 are this week; 9 and 12 are the week before; 20 is
    // outside both windows and must not be counted anywhere.
    expect(stats.total).toBe(3);
    expect(stats.previous).toBe(2);
  });

  it("counts people by session, not by page load", () => {
    const stats = summariseViews(
      [at(1, { session_id: "a" }), at(1, { session_id: "a" }), at(2, { session_id: "b" })],
      7,
      NOW,
    );
    expect(stats.total).toBe(3);
    expect(stats.people).toBe(2);
  });

  it("does not collapse rows with no session into one phantom person", () => {
    // Old rows have no session id. Treating them as a single visitor would
    // under-report by an order of magnitude on exactly the historical data
    // this feature first shows.
    const stats = summariseViews([at(1), at(2), at(3)], 7, NOW);
    expect(stats.people).toBe(3);
  });

  it("ranks sources and places, ignoring blanks", () => {
    const stats = summariseViews(
      [
        at(1, { source: "search", viewer_city: "Denver", viewer_state: "CO" }),
        at(1, { source: "search", viewer_city: "Denver", viewer_state: "CO" }),
        at(2, { source: "direct", viewer_city: "  ", viewer_state: null }),
        at(2, { source: "  ", viewer_city: null, viewer_state: null }),
      ],
      7,
      NOW,
    );

    expect(stats.topSources).toEqual([
      { label: "search", count: 2 },
      { label: "direct", count: 1 },
    ]);
    expect(stats.topPlaces).toEqual([{ label: "Denver, CO", count: 2 }]);
  });

  it("orders ties by name so the card does not reshuffle on refresh", () => {
    const stats = summariseViews([at(1, { source: "zeta" }), at(1, { source: "alpha" })], 7, NOW);
    expect(stats.topSources.map((s) => s.label)).toEqual(["alpha", "zeta"]);
  });

  it("survives unparseable timestamps rather than reporting NaN", () => {
    const stats = summariseViews([at(1), { ...at(1), created_at: "not a date" }], 7, NOW);
    expect(stats.total).toBe(1);
  });

  it("reports zeros for a profile nobody has viewed", () => {
    const stats = summariseViews([], 7, NOW);
    expect(stats).toMatchObject({ total: 0, people: 0, previous: 0 });
    expect(stats.trend.kind).toBe("too-early");
    expect(stats.topSources).toEqual([]);
  });
});
