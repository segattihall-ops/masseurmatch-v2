import { Card } from "@masseurmatch/ui";
import type { Metadata } from "next";
import Link from "next/link";

import { getRadarData } from "@/lib/demand-radar";
import { requireAdmin } from "@/lib/guards";

import { RadarChart } from "./radar-chart";

export const metadata: Metadata = {
  title: "Demand Radar",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const RANGES = [7, 30, 90] as const;

export default async function DemandRadarPage({
  searchParams,
}: {
  searchParams: { days?: string };
}) {
  await requireAdmin("/admin/demand-radar");

  const days = Number(searchParams.days ?? 30);
  const data = await getRadarData(Number.isFinite(days) ? days : 30);
  const active = RANGES.includes(days as (typeof RANGES)[number]) ? days : 30;

  const highPriority = data.insights.filter((i) => i.priority === "high");
  const peaks = data.trends.filter((t) => t.peak_detected);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-ink">Demand Radar</h1>
          <p className="mt-1 text-sm text-ink/60">
            Search interest by keyword, from <code className="text-ink/80">keyword_trends</code>.
          </p>
        </div>
        <nav className="flex gap-1" aria-label="Date range">
          {RANGES.map((range) => (
            <Link
              key={range}
              href={`/admin/demand-radar?days=${range}`}
              className={[
                "rounded-full px-3 py-1 text-sm",
                range === active ? "bg-wine text-white" : "bg-ink/5 text-ink/60 hover:bg-ink/10",
              ].join(" ")}
            >
              {range}d
            </Link>
          ))}
        </nav>
      </header>

      {highPriority.length > 0 ? (
        <Card className="mb-6 border-wineSoft bg-wineSoft/40 p-4">
          <h2 className="mb-2 text-sm font-semibold text-wineDark">
            {highPriority.length} high-priority insight{highPriority.length === 1 ? "" : "s"}
          </h2>
          <ul className="space-y-2">
            {highPriority.map((insight) => (
              <li key={insight.id} className="text-sm text-wineDark">
                <strong className="font-medium">{insight.keyword ?? "—"}</strong>
                {insight.description ? ` — ${insight.description}` : null}
                {insight.action_recommended ? (
                  <span className="block text-wineDark/80">→ {insight.action_recommended}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <RadarChart keywords={data.keywords} series={data.series} />

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-ink/60">Keywords tracked</p>
          <p className="font-stat text-ds-32 text-ink">{data.keywords.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-ink/60">Data points</p>
          <p className="font-stat text-ds-32 text-ink">{data.trends.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-ink/60">Peaks detected</p>
          <p className="font-stat text-ds-32 text-ink">{peaks.length}</p>
        </Card>
      </section>
    </main>
  );
}
