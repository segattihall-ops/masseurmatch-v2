import "server-only";

import { createSessionClient } from "@masseurmatch/db/auth";

/**
 * Demand Radar data.
 *
 * Ported from the previous repo's `KeywordTrendsDashboard.tsx`. Two changes
 * worth naming:
 *
 * 1. **It is typed.** The original carried a comment explaining that
 *    `keyword_trends` and `keyword_insights` were absent from its generated
 *    types, so it cast the client to `SupabaseClient` and queried untyped. Both
 *    tables are in our generated types, so the casts are gone.
 *
 * 2. **It reads on the server.** The original queried Supabase from a client
 *    component, which means the query shape and the anon key both ship to the
 *    browser. `keyword_trends` is admin-only, so reading it server-side behind
 *    `requireAdmin()` is the only way that holds.
 */

export type TrendPoint = {
  keyword: string;
  date: string;
  score: number;
  week_avg: number | null;
  month_avg: number | null;
  peak_detected: boolean | null;
  week_over_week_change: number | null;
  city: string;
  state: string;
};

export type Insight = {
  id: string;
  keyword: string | null;
  insight_type: string | null;
  description: string | null;
  action_recommended: string | null;
  priority: string | null;
};

export type RadarData = {
  trends: TrendPoint[];
  insights: Insight[];
  keywords: string[];
  /** Rows keyed by date, one column per keyword — the shape recharts wants. */
  series: Record<string, string | number>[];
};

/**
 * Trends for the last `days` days, plus open insights.
 *
 * `days` is clamped: it reaches a `.gte()` on an indexed column, and an
 * unbounded value would let a URL parameter ask for the entire table.
 */
export async function getRadarData(days = 30): Promise<RadarData> {
  const supabase = createSessionClient();
  const window = Math.min(Math.max(Math.trunc(days), 7), 365);

  const since = new Date(Date.now() - window * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const { data: trendRows, error: trendError } = await supabase
    .from("keyword_trends")
    .select("keyword,date,score,week_avg,month_avg,peak_detected,week_over_week_change,city,state")
    .gte("date", since)
    .order("date", { ascending: true })
    .limit(5000);

  if (trendError) {
    throw new Error(`Could not load keyword trends: ${trendError.message}`);
  }

  const trends = (trendRows ?? []) as unknown as TrendPoint[];

  const { data: insightRows, error: insightError } = await supabase
    .from("keyword_insights")
    .select("id,keyword,insight_type,description,action_recommended,priority")
    .eq("status", "new")
    .order("created_at", { ascending: false })
    .limit(50);

  // Insights are supporting detail; the chart is the point. A failure here
  // should not blank the whole page.
  const insights = insightError ? [] : ((insightRows ?? []) as unknown as Insight[]);

  const keywords = [...new Set(trends.map((t) => t.keyword))].sort();

  const byDate = new Map<string, Record<string, string | number>>();
  for (const point of trends) {
    const row = byDate.get(point.date) ?? { date: point.date };
    row[point.keyword] = point.score;
    byDate.set(point.date, row);
  }

  return {
    trends,
    insights,
    keywords,
    series: [...byDate.values()].sort((a, b) => String(a.date).localeCompare(String(b.date))),
  };
}
