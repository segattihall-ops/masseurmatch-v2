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

const LINE_COLORS = ["#8B1E2D", "#A52538", "#111111", "#6E1521", "#2B2B2B", "#5A1019"];

export function RadarChart({
  keywords,
  series,
}: {
  keywords: string[];
  series: Record<string, string | number>[];
}) {
  const [selected, setSelected] = React.useState<string[]>(() => keywords.slice(0, 6));

  function toggle(keyword: string) {
    setSelected((previous) =>
      previous.includes(keyword)
        ? previous.filter((item) => item !== keyword)
        : [...previous, keyword],
    );
  }

  if (series.length === 0) {
    return (
      <Card className="p-6 text-center sm:p-8">
        <p className="text-sm leading-6 text-ink/60">
          No keyword trend data in this window. The collector writes to{" "}
          <code className="text-ink/80">keyword_trends</code> under the service role.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <fieldset className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
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
                "min-h-10 shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors",
                on ? "bg-wine text-white" : "bg-ink/5 text-ink/60 hover:bg-ink/10",
              ].join(" ")}
            >
              {keyword}
            </button>
          );
        })}
      </fieldset>

      <Card className="overflow-hidden p-2 sm:p-4">
        <div className="h-72 min-w-0 w-full sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 8, right: 8, bottom: 8, left: -24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(17,17,17,0.08)" />
              <XAxis
                dataKey="date"
                minTickGap={24}
                tick={{ fontSize: 10 }}
                stroke="rgba(17,17,17,0.4)"
              />
              <YAxis width={34} tick={{ fontSize: 10 }} stroke="rgba(17,17,17,0.4)" />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid rgba(17,17,17,0.1)",
                  fontSize: 13,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {selected.map((keyword, index) => (
                <Line
                  key={keyword}
                  type="monotone"
                  dataKey={keyword}
                  stroke={LINE_COLORS[index % LINE_COLORS.length]}
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
