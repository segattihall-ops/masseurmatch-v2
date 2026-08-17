/**
 * Demand Radar — what is happening in a therapist's city.
 *
 * Pure functions over `demand_scores` and `keyword_trends`. The reads live in
 * the dashboard; this decides what the numbers are allowed to say.
 *
 * ---------------------------------------------------------------------------
 * Two filters that are not optional
 * ---------------------------------------------------------------------------
 * `demand_scores` carries an `is_sample` flag and an `expires_at`. Measured in
 * production: 74 real rows across 57 cities for the current week, and 21 sample
 * rows across 5 cities from June — every one of them already expired.
 *
 * Showing a sample row to a therapist as their city's demand is the same
 * failure this dashboard already had once, when it printed "1,284 profile
 * views, +12% vs last week" with nothing behind it. So sample rows and expired
 * rows are dropped here, in the one place both readers go through, rather than
 * being remembered at each call site.
 *
 * Most cities have no reading at all. That is a normal answer and the UI says
 * so; inventing a number for them would be worse than the silence.
 */

export type DemandRow = {
  city: string | null;
  state: string | null;
  score: number | null;
  trend: string | null;
  search_volume_index: number | null;
  competition_index: number | null;
  week_start: string | null;
  is_sample: boolean | null;
  expires_at: string | null;
};

export type TrendRow = {
  keyword: string | null;
  score: number | null;
  week_over_week_change: number | null;
  date: string | null;
};

export type DemandReading = {
  score: number;
  /** `rising` / `steady` / `cooling`, normalised from free text. */
  direction: "rising" | "steady" | "cooling";
  /** How crowded the city is, when the collector reported it. */
  competition: number | null;
  weekStart: string | null;
};

/** A keyword worth acting on, with the movement that earned it the place. */
export type KeywordOpportunity = {
  keyword: string;
  score: number;
  /** Week-over-week change, as reported by the collector. */
  change: number;
};

function usable(row: DemandRow, now: Date): boolean {
  if (row.is_sample) return false;
  if (row.score === null) return false;
  if (row.expires_at) {
    const expires = new Date(row.expires_at);
    if (!Number.isNaN(expires.getTime()) && expires.getTime() <= now.getTime()) return false;
  }
  return true;
}

/**
 * Normalise the collector's free-text trend.
 *
 * The column is `text` and has held several spellings over time. Anything
 * unrecognised becomes `steady`, which is the reading that claims least.
 */
function normaliseDirection(trend: string | null): DemandReading["direction"] {
  const value = (trend ?? "").trim().toLowerCase();
  if (value.startsWith("ris") || value.startsWith("up") || value === "growing") return "rising";
  if (value.startsWith("cool") || value.startsWith("down") || value === "falling") return "cooling";
  return "steady";
}

/**
 * The reading to show for a city, or null when there is none worth showing.
 *
 * Picks the most recent usable week rather than assuming the caller ordered the
 * rows — two collectors writing the same week is a real shape in this data.
 */
export function currentDemand(rows: DemandRow[], now: Date = new Date()): DemandReading | null {
  const candidates = rows.filter((row) => usable(row, now));
  if (candidates.length === 0) return null;

  const best = candidates.reduce((latest, row) =>
    (row.week_start ?? "") > (latest.week_start ?? "") ? row : latest,
  );

  return {
    score: best.score as number,
    direction: normaliseDirection(best.trend),
    competition: best.competition_index,
    weekStart: best.week_start,
  };
}

/** `Busy and rising` — one line, no jargon, no invented precision. */
export function demandLabel(reading: DemandReading | null): string {
  if (!reading) return "No demand data for your city yet.";

  const level = reading.score >= 70 ? "Busy" : reading.score >= 40 ? "Steady" : "Quiet";
  const movement =
    reading.direction === "rising"
      ? "and picking up"
      : reading.direction === "cooling"
        ? "and easing off"
        : "and level";

  return `${level} ${movement}.`;
}

/**
 * Keywords gaining ground, biggest movers first.
 *
 * Only rising ones. A therapist can act on "people are searching for this more
 * this week"; a list of things nobody wants is a page of bad news they cannot
 * do anything about.
 */
export function risingKeywords(rows: TrendRow[], limit = 5): KeywordOpportunity[] {
  const byKeyword = new Map<string, KeywordOpportunity>();

  for (const row of rows) {
    const keyword = row.keyword?.trim();
    const change = row.week_over_week_change;
    if (!keyword || change === null || change <= 0) continue;

    // Keep the strongest reading per keyword — the collector writes one row per
    // day, so without this the same word fills the whole list.
    const existing = byKeyword.get(keyword.toLowerCase());
    if (!existing || change > existing.change) {
      byKeyword.set(keyword.toLowerCase(), { keyword, score: row.score ?? 0, change });
    }
  }

  return [...byKeyword.values()]
    .sort((a, b) => b.change - a.change || a.keyword.localeCompare(b.keyword))
    .slice(0, limit);
}
