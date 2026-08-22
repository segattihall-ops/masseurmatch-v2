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
  await requireAdmin("/reports");
  const summary = await getAdminReportSummary();

  const cards = [
    { label: "Profiles", value: summary.profiles, href: "/people" },
    { label: "Approved", value: summary.approvedProfiles, href: "/people?status=approved" },
    { label: "Pending approval", value: summary.pendingProfiles, href: "/moderation" },
    {
      label: "Suspended",
      value: summary.suspendedProfiles,
      href: "/people?status=suspended",
    },
    { label: "Identity verified", value: summary.verifiedProfiles, href: "/verifications" },
    { label: "Pending photos", value: summary.pendingPhotos, href: "/photos" },
    {
      label: "Pending documents",
      value: summary.pendingDocuments,
      href: "/verifications",
    },
    {
      label: "Manual ID review",
      value: summary.pendingManualIdentity,
      href: "/verifications/manual",
    },
    {
      label: "Open safety reports",
      value: summary.openSafetyReports,
      href: "/profile-reports",
    },
    { label: "Open support tickets", value: summary.openSupportTickets, href: "/tickets" },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-ink sm:text-3xl">Operational reports</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-ink/60">
            Live operational totals from production tables. Document review is split from manual
            identity review so credential uploads are not misreported as government ID checks.
          </p>
        </div>
        <Link
          href="/audit-log"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-wine/20 px-3 py-2 text-sm font-medium text-wine hover:bg-wineSoft/30 sm:w-auto"
        >
          Audit log →
        </Link>
      </div>

      <section aria-labelledby="operations-heading" className="mt-8">
        <h2 id="operations-heading" className="text-lg font-semibold text-ink">
          Operations
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {cards.map((card) => (
            <Link key={card.label} href={card.href} className="block min-w-0">
              <Card className="h-full p-4 transition hover:border-wine/30 sm:p-5">
                <p className="text-xs leading-5 text-ink/55 sm:text-sm">{card.label}</p>
                <p className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">
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
