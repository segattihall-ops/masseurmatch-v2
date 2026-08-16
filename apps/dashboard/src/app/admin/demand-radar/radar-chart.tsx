"use client";

import { Card } from "@masseurmatch/ui";
import * as React from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/**
 * Demand Radar chart and keyword filter.
 *
 * The data arrives as props from a server component — unlike the original,
 * which fetched from Supabase in the browser. Only the rendering is a client
 * concern.
 *
 * Line colours come from the design tokens rather than recharts' defaults, so
 * the chart reads as part of the product instead of a library drop-in.
 */

const LINE_COLORS = [
  "#8B1E2D", // wine
  "#A52538", // wineBright
  "#111111", // ink
  "#6E1521", // wineDark
  "#2B2B2B", // ink3
  "#5A1019", // wineDarker
];

export function RadarChart({
  keywords,
  series,
}: {
  keywords: string[];
  series: Record<string, string | number>[];
}) {
  // Default to the six busiest keywords: plotting forty lines is unreadable,
  // and an empty chart on first load looks broken.
  const [selected, setSelected] = React.useState<string[]>(() => keywords.slice(0, 6));

  function toggle(keyword: string) {
    setSelected((prev) =>
      prev.includes(keyword) ? prev.filter((k) => k !== keyword) : [...prev, keyword],
    );
  }

  if (series.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-ink/60">
          No keyword trend data in this window. The collector writes to{" "}
          <code className="text-ink/80">keyword_trends</code> under the service role.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <fieldset className="flex flex-wrap gap-2">
        <legend className="sr-only">Keywords to plot</legend>
        {keywords.map((keyword) => {
          const on = selected.includes(keyword);
          return (
            <button
              key={keyword}
              type="button"
              onClick={() => toggle(keyword)}
              aria-pressed={on}
              className={[
                "rounded-full px-3 py-1 text-sm transition-colors",
                on ? "bg-wine text-white" : "bg-ink/5 text-ink/60 hover:bg-ink/10",
              ].join(" ")}
            >
              {keyword}
            </button>
          );
        })}
      </fieldset>

      <Card className="p-4">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 8, right: 16, bottom: 8, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(17,17,17,0.08)" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="rgba(17,17,17,0.4)" />
              <YAxis tick={{ fontSize: 12 }} stroke="rgba(17,17,17,0.4)" />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid rgba(17,17,17,0.1)",
                  fontSize: 13,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {selected.map((keyword, i) => (
                <Line
                  key={keyword}
                  type="monotone"
                  dataKey={keyword}
                  stroke={LINE_COLORS[i % LINE_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
