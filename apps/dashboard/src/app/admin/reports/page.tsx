import { Card } from "@masseurmatch/ui";
import type { Metadata } from "next";
import Link from "next/link";

import { getAdminReportSummary } from "@/lib/admin-operations";
import { requireAdmin } from "@/lib/guards";

export const metadata: Metadata = {
  title: "Admin reports",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  await requireAdmin("/admin/reports");
  const summary = await getAdminReportSummary();

  const cards = [
    { label: "Profiles", value: summary.profiles, href: "/admin/people" },
    { label: "Approved", value: summary.approvedProfiles, href: "/admin/people?status=approved" },
    { label: "Pending approval", value: summary.pendingProfiles, href: "/admin/moderation" },
    {
      label: "Suspended",
      value: summary.suspendedProfiles,
      href: "/admin/people?status=suspended",
    },
    { label: "Identity verified", value: summary.verifiedProfiles, href: "/admin/verifications" },
    { label: "Pending photos", value: summary.pendingPhotos, href: "/admin/photos" },
    {
      label: "Pending ID documents",
      value: summary.pendingDocuments + summary.pendingManualIdentity,
      href: "/admin/verifications",
    },
    {
      label: "Open safety reports",
      value: summary.openSafetyReports,
      href: "/admin/profile-reports",
    },
    { label: "Open support tickets", value: summary.openSupportTickets, href: "/admin/tickets" },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-ink">Operational reports</h1>
          <p className="mt-1 max-w-2xl text-sm text-ink/60">
            Live operational totals from production tables. This restores the OLD reports route
            without relying on stale snapshots or invented metrics.
          </p>
        </div>
        <Link href="/admin/audit-log" className="text-sm font-medium text-wine hover:underline">
          Audit log →
        </Link>
      </div>

      <section aria-labelledby="operations-heading" className="mt-8">
        <h2 id="operations-heading" className="text-lg font-semibold text-ink">
          Operations
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link key={card.label} href={card.href} className="block">
              <Card className="h-full p-5 transition hover:border-wine/30">
                <p className="text-sm text-ink/55">{card.label}</p>
                <p className="mt-2 text-3xl font-semibold text-ink">
                  {card.value.toLocaleString()}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="activity-heading" className="mt-10">
        <h2 id="activity-heading" className="text-lg font-semibold text-ink">
          Last 30 days
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="p-5">
            <p className="text-sm text-ink/55">Searches recorded</p>
            <p className="mt-2 text-3xl font-semibold text-ink">
              {summary.searches30d.toLocaleString()}
            </p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-ink/55">Profile views</p>
            <p className="mt-2 text-3xl font-semibold text-ink">
              {summary.profileViews30d.toLocaleString()}
            </p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-ink/55">Ranking events</p>
            <p className="mt-2 text-3xl font-semibold text-ink">
              {summary.rankingEvents30d.toLocaleString()}
            </p>
          </Card>
        </div>
      </section>

      <p className="mt-8 text-xs text-ink/45">
        Counts are operational telemetry, not sales or booking forecasts.
      </p>
    </main>
  );
}
