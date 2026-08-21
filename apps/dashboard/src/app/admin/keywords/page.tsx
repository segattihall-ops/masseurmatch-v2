import { Card } from "@masseurmatch/ui";
import type { Metadata } from "next";

import { getKeywordConsole } from "@/lib/admin-secondary";
import { requireAdmin } from "@/lib/guards";

export const metadata: Metadata = {
  title: "Keyword intelligence",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminKeywordsPage() {
  await requireAdmin("/admin/keywords");
  const { keywords, trends } = await getKeywordConsole();
  const latestDate = trends[0]?.date ?? null;
  const latest = latestDate ? trends.filter((row) => row.date === latestDate).slice(0, 30) : [];

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold text-ink">Keyword intelligence</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink/60">
        Live keyword inventory and collected trend measurements. This replaces the OLD duplicate
        keyword manager and keyword-trends dashboard with one source-backed view.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-ink/55">Tracked keywords</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{keywords.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-ink/55">Trend rows loaded</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{trends.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-ink/55">Latest collection date</p>
          <p className="mt-2 text-lg font-semibold text-ink">{latestDate ?? "No data"}</p>
        </Card>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-ink">Latest signals</h2>
        <Card className="mt-4 overflow-x-auto p-0">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/50">
                <th className="px-4 py-3">Keyword</th>
                <th className="px-4 py-3">Market</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">7d avg</th>
                <th className="px-4 py-3">30d avg</th>
                <th className="px-4 py-3">WoW</th>
                <th className="px-4 py-3">Direction</th>
              </tr>
            </thead>
            <tbody>
              {latest.map((row) => (
                <tr key={row.id} className="border-b border-ink/5 last:border-b-0">
                  <td className="px-4 py-3 font-medium text-ink">{row.keyword}</td>
                  <td className="px-4 py-3 text-ink/65">
                    {row.city}, {row.state}
                  </td>
                  <td className="px-4 py-3 text-ink/65">{row.score}</td>
                  <td className="px-4 py-3 text-ink/65">{row.week_avg ?? "—"}</td>
                  <td className="px-4 py-3 text-ink/65">{row.month_avg ?? "—"}</td>
                  <td className="px-4 py-3 text-ink/65">
                    {row.week_over_week_change == null ? "—" : `${row.week_over_week_change}%`}
                  </td>
                  <td className="px-4 py-3 capitalize text-ink/65">
                    {row.trend_direction ?? (row.peak_detected ? "peak" : "—")}
                  </td>
                </tr>
              ))}
              {latest.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-ink/50">
                    No keyword trend measurements are available.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </Card>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-ink">Keyword inventory</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {keywords.map((row) => (
            <span key={row.id} className="rounded-full bg-ink/5 px-3 py-1.5 text-sm text-ink/70">
              {row.label?.trim() || row.keyword?.trim() || row.slug?.trim() || "Unnamed"}
              {row.category ? ` · ${row.category}` : ""}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
