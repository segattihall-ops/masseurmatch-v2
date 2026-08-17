/**
 * Profile view analytics — turning rows into something worth showing.
 *
 * Pure functions. The database read lives in the dashboard; this decides what
 * the numbers mean, which is the part that is easy to get wrong and impossible
 * to test through a query.
 *
 * ---------------------------------------------------------------------------
 * Why this is careful about percentages
 * ---------------------------------------------------------------------------
 * A typical profile in this database has had a few dozen views. On numbers that
 * small a percentage is theatre: one view to four is "+300%", and a therapist
 * who reads that as a trend will change their profile for no reason. Worse, the
 * dashboard this replaces printed invented figures — "1,284 profile views, +12%
 * vs last week" — and a number on a dashboard reads as a fact.
 *
 * So a change is only expressed as a percentage when the baseline is large
 * enough for one to mean anything. Below that it is reported as a plain
 * difference, or as "too early to say".
 *
 * Nothing here touches `user_ip`. The column exists and this feature has no use
 * for it; aggregates answer every question the dashboard asks.
 */

/** One row, reduced to the fields that inform anything. */
export type ViewRow = {
  created_at: string;
  source: string | null;
  viewer_city: string | null;
  viewer_state: string | null;
  session_id: string | null;
};

/** Below this many views in the baseline period, a percentage is noise. */
export const MIN_BASELINE_FOR_PERCENT = 20;

export type Trend =
  | { kind: "percent"; change: number; up: boolean }
  | { kind: "count"; change: number; up: boolean }
  | { kind: "too-early" };

export type ViewStats = {
  /** Views in the reporting window. */
  total: number;
  /** Distinct sessions — closer to "people" than raw views. */
  people: number;
  /** The same window, one period earlier. */
  previous: number;
  trend: Trend;
  /** Most common sources, largest first. */
  topSources: { label: string; count: number }[];
  /** Where viewers were, largest first. */
  topPlaces: { label: string; count: number }[];
};

function daysAgo(now: Date, days: number): Date {
  return new Date(now.getTime() - days * 86_400_000);
}

/**
 * How the window compares with the one before it.
 *
 * `too-early` is a real answer, not a failure. It is what should be said when
 * there is not enough history to compare against, and saying it is better than
 * printing a number that cannot support the weight.
 */
export function trendOf(current: number, previous: number): Trend {
  if (previous < MIN_BASELINE_FOR_PERCENT) {
    if (previous === 0 && current === 0) return { kind: "too-early" };
    const change = current - previous;
    if (change === 0) return { kind: "count", change: 0, up: false };
    return { kind: "count", change: Math.abs(change), up: change > 0 };
  }

  const ratio = (current - previous) / previous;
  const percent = Math.round(Math.abs(ratio) * 100);
  if (percent === 0) return { kind: "percent", change: 0, up: false };
  return { kind: "percent", change: percent, up: ratio > 0 };
}

/** `up 24%` / `8 more than the week before` / `Too early to compare`. */
export function trendLabel(trend: Trend, windowDays: number): string {
  const period = windowDays === 7 ? "the week before" : `the previous ${windowDays} days`;

  switch (trend.kind) {
    case "too-early":
      return "Too early to compare";
    case "count":
      if (trend.change === 0) return `Same as ${period}`;
      return `${trend.change} ${trend.up ? "more" : "fewer"} than ${period}`;
    case "percent":
      if (trend.change === 0) return `Level with ${period}`;
      return `${trend.up ? "Up" : "Down"} ${trend.change}% on ${period}`;
  }
}

function tally(values: (string | null)[], limit: number): { label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const raw of values) {
    const label = raw?.trim();
    if (!label) continue;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return (
    [...counts.entries()]
      .map(([label, count]) => ({ label, count }))
      // Ties broken by name so the list is stable between renders — a card whose
      // rows reshuffle on every refresh looks broken.
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
      .slice(0, limit)
  );
}

function placeLabel(row: ViewRow): string | null {
  const city = row.viewer_city?.trim();
  const state = row.viewer_state?.trim();
  if (city && state) return `${city}, ${state}`;
  return city || state || null;
}

/**
 * Summarise a window of views.
 *
 * `rows` must already be scoped to one profile and cover **both** the current
 * window and the one before it — the comparison is computed here rather than in
 * two queries, so the two halves cannot be measured against different clocks.
 */
export function summariseViews(
  rows: ViewRow[],
  windowDays: number,
  now: Date = new Date(),
): ViewStats {
  const windowStart = daysAgo(now, windowDays);
  const previousStart = daysAgo(now, windowDays * 2);

  const current: ViewRow[] = [];
  let previous = 0;

  for (const row of rows) {
    const at = new Date(row.created_at);
    if (Number.isNaN(at.getTime())) continue;
    if (at >= windowStart) current.push(row);
    else if (at >= previousStart) previous += 1;
  }

  const sessions = new Set(
    current.map((r) => r.session_id?.trim()).filter((s): s is string => Boolean(s)),
  );

  return {
    total: current.length,
    // Rows without a session id cannot be grouped, so each counts as its own
    // visit rather than collapsing into one phantom person.
    people: sessions.size + current.filter((r) => !r.session_id?.trim()).length,
    previous,
    trend: trendOf(current.length, previous),
    topSources: tally(
      current.map((r) => r.source),
      4,
    ),
    topPlaces: tally(current.map(placeLabel), 4),
  };
}
