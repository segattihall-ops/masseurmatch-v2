import { Card } from "@masseurmatch/ui";
import type { Metadata } from "next";
import Link from "next/link";

import { getAdminAnalyticsOverview } from "@/lib/admin-insights";
import { requireAdmin } from "@/lib/guards";

export const metadata: Metadata = {
  title: "Analytics",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function percent(value: number | null): string {
  return value === null ? "—" : `${value.toFixed(1)}%`;
}

export default async function AnalyticsPage() {
  await requireAdmin("/analytics");
  const analytics = await getAdminAnalyticsOverview();

  const metrics = [
    ["Views · 7d", analytics.views7Days],
    ["Views · 30d", analytics.views30Days],
    ["Contacts · 7d", analytics.contacts7Days],
    ["Contacts · 30d", analytics.contacts30Days],
    ["Conversion · 7d", percent(analytics.conversion7Days)],
    ["Conversion · 30d", percent(analytics.conversion30Days)],
    ["New profiles · 30d", analytics.newProfiles30Days],
    ["Approved profiles", analytics.approvedProfiles],
  ] as const;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-wine">Operations</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Analytics</h1>
        <p className="mt-2 max-w-3xl text-sm text-ink/60">
          Real profile views and contact events from production. No synthetic traffic or estimated
          conversion is included.
        </p>
      </div>

      <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map(([label, value]) => (
          <Card key={label} className="p-4">
            <p className="text-xs text-ink/55">{label}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">{value}</p>
          </Card>
        ))}
      </section>

      <section className="mt-10">
        <div>
          <h2 className="text-lg font-semibold text-ink">Top approved profiles</h2>
          <p className="mt-1 text-sm text-ink/55">
            All-time profile counters, ordered by recorded views.
          </p>
        </div>

        <Card className="mt-3 overflow-x-auto">
          {analytics.topProfiles.length === 0 ? (
            <p className="p-8 text-center text-sm text-ink/55">No approved profiles yet.</p>
          ) : (
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/50">
                <tr>
                  <th className="px-4 py-3">Provider</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3 text-right">Views</th>
                  <th className="px-4 py-3 text-right">Contacts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {analytics.topProfiles.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3">
                      <Link
                        href={`/people/${row.id}`}
                        className="font-medium text-wine hover:underline"
                      >
                        {row.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink/60">
                      {[row.city, row.state].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.views}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.contacts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </section>
    </main>
  );
}
