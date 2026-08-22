import { Card } from "@masseurmatch/ui";
import type { Metadata } from "next";
import Link from "next/link";

import { listAdminCityCoverage, publicCityPath } from "@/lib/admin-cities";
import { requireAdmin } from "@/lib/guards";

export const metadata: Metadata = {
  title: "Cities",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CitiesPage() {
  await requireAdmin("/cities");
  const cities = await listAdminCityCoverage();
  const totals = cities.reduce(
    (summary, city) => ({
      profiles: summary.profiles + city.total,
      public: summary.public + city.public,
      pending: summary.pending + city.pending,
      suspended: summary.suspended + city.suspended,
    }),
    { profiles: 0, public: 0, pending: 0, suspended: 0 },
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-wine">Directory coverage</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Cities</h1>
        <p className="mt-2 max-w-3xl text-sm text-ink/60">
          Live coverage derived from provider profiles. This replaces the legacy file-backed city
          editor, which is not a source of truth in the V2 directory.
        </p>
      </header>

      <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Metric label="Cities" value={cities.length} />
        <Metric label="Profiles" value={totals.profiles} />
        <Metric label="Public" value={totals.public} />
        <Metric label="Pending" value={totals.pending} />
        <Metric label="Suspended" value={totals.suspended} />
      </section>

      <Card className="mt-8 overflow-x-auto">
        {cities.length === 0 ? (
          <p className="p-8 text-center text-sm text-ink/55">No city data found.</p>
        ) : (
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/45">
              <tr>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3">Profiles</th>
                <th className="px-4 py-3">Public</th>
                <th className="px-4 py-3">Approved</th>
                <th className="px-4 py-3">Pending</th>
                <th className="px-4 py-3">Suspended</th>
                <th className="px-4 py-3">Directory</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {cities.map((city) => (
                <tr key={city.key}>
                  <td className="px-4 py-3 font-medium text-ink">{city.city}</td>
                  <td className="px-4 py-3 text-ink/60">{city.state}</td>
                  <td className="px-4 py-3 tabular-nums">{city.total}</td>
                  <td className="px-4 py-3 tabular-nums">{city.public}</td>
                  <td className="px-4 py-3 tabular-nums">{city.approved}</td>
                  <td className="px-4 py-3 tabular-nums">{city.pending}</td>
                  <td className="px-4 py-3 tabular-nums">{city.suspended}</td>
                  <td className="px-4 py-3">
                    {city.public > 0 ? (
                      <a
                        href={`https://www.masseurmatch.com${publicCityPath(city.city, city.state)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-wine hover:underline"
                      >
                        Open ↗
                      </a>
                    ) : (
                      <span className="text-xs text-ink/35">Not public</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <p className="mt-5 text-xs text-ink/45">
        Need to change a provider&apos;s city or status? Use <Link href="/people" className="font-medium text-wine hover:underline">People</Link> so the underlying profile remains the source of truth.
      </p>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-ink/50">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">{value}</p>
    </Card>
  );
}
