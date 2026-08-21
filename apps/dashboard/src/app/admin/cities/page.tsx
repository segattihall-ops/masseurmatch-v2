import { Card } from "@masseurmatch/ui";
import type { Metadata } from "next";

import { getCityCoverage } from "@/lib/admin-secondary";
import { requireAdmin } from "@/lib/guards";

export const metadata: Metadata = {
  title: "City coverage",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminCitiesPage() {
  await requireAdmin("/admin/cities");
  const cities = await getCityCoverage();
  const publicMarkets = cities.filter((city) => city.publicProfiles > 0).length;

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-semibold text-ink">City coverage</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink/60">
        Coverage is derived from real profiles. The OLD city JSON editor is not restored because the
        V2 public directory no longer reads that legacy content store.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-ink/55">Markets with profiles</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{cities.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-ink/55">Public markets</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{publicMarkets}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-ink/55">Public profiles represented</p>
          <p className="mt-2 text-3xl font-semibold text-ink">
            {cities.reduce((total, city) => total + city.publicProfiles, 0)}
          </p>
        </Card>
      </div>

      <Card className="mt-8 overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/50">
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">State</th>
              <th className="px-4 py-3">All profiles</th>
              <th className="px-4 py-3">Approved</th>
              <th className="px-4 py-3">Public</th>
            </tr>
          </thead>
          <tbody>
            {cities.map((city) => (
              <tr key={`${city.state}-${city.city}`} className="border-b border-ink/5 last:border-b-0">
                <td className="px-4 py-3 font-medium text-ink">{city.city}</td>
                <td className="px-4 py-3 text-ink/65">{city.state}</td>
                <td className="px-4 py-3 text-ink/65">{city.profiles}</td>
                <td className="px-4 py-3 text-ink/65">{city.approved}</td>
                <td className="px-4 py-3 text-ink/65">{city.publicProfiles}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </main>
  );
}
