import { Card } from "@masseurmatch/ui";
import type { Metadata } from "next";
import Link from "next/link";

import { listAdminReports } from "@/lib/admin-operations";
import { requireAdmin } from "@/lib/guards";

import { updateReport } from "../operations-actions";

export const metadata: Metadata = {
  title: "Safety reports",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const FILTERS = ["open", "reviewing", "actioned", "dismissed", "all"] as const;

export default async function AdminProfileReportsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  await requireAdmin("/profile-reports");
  const status = FILTERS.includes(searchParams.status as (typeof FILTERS)[number])
    ? (searchParams.status as (typeof FILTERS)[number])
    : "open";
  const reports = await listAdminReports(status);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-ink sm:text-3xl">Safety reports</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-ink/60">
            One queue for legacy complaints and current profile reports. Decisions are written to
            the audit log before the underlying report is changed.
          </p>
        </div>
        <Link
          href="/audit-log"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-wine/20 px-3 py-2 text-sm font-medium text-wine hover:bg-wineSoft/30 sm:w-auto"
        >
          Audit log →
        </Link>
      </div>

      <nav aria-label="Report status" className="mt-6 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap">
        {FILTERS.map((value) => (
          <Link
            key={value}
            href={value === "open" ? "/profile-reports" : `/profile-reports?status=${value}`}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm capitalize ${
              status === value ? "bg-wine text-white" : "bg-ink/5 text-ink/70 hover:bg-ink/10"
            }`}
          >
            {value}
          </Link>
        ))}
      </nav>

      <p className="mt-5 text-sm text-ink/50">
        {reports.length} item{reports.length === 1 ? "" : "s"} in this view.
      </p>

      {reports.length === 0 ? (
        <Card className="mt-6 p-6 text-center sm:p-8">
          <p className="text-sm text-ink/60">Nothing matches this status.</p>
        </Card>
      ) : (
        <ul className="mt-6 space-y-4">
          {reports.map((report) => {
            const isOpen =
              report.source === "profile_report"
                ? report.status === "open" || report.status === "reviewing"
                : report.status === "new" ||
                  report.status === "pending" ||
                  report.status === "reviewing";
            const statuses =
              report.source === "profile_report"
                ? (["reviewing", "actioned", "dismissed"] as const)
                : (["resolved", "dismissed"] as const);

            return (
              <li key={`${report.source}-${report.id}`}>
                <Card className="p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="break-words text-lg font-semibold text-ink">
                          {report.profileName}
                        </h2>
                        <span className="rounded-full bg-ink/5 px-2 py-0.5 text-xs uppercase tracking-wide text-ink/60">
                          {report.source === "profile_report"
                            ? "Profile report"
                            : "Legacy complaint"}
                        </span>
                        <span className="rounded-full bg-wineSoft/50 px-2 py-0.5 text-xs capitalize text-wineDark">
                          {report.category}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-ink/50">
                        {new Date(report.createdAt).toLocaleString()} · status {report.status}
                      </p>
                    </div>
                    {report.reporterEmail ? (
                      <a
                        href={`mailto:${report.reporterEmail}`}
                        className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-wine/20 px-3 py-2 text-sm font-medium text-wine sm:w-auto"
                      >
                        Contact reporter
                      </a>
                    ) : null}
                  </div>

                  <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink/75">
                    {report.reason}
                  </p>
                  {report.adminNotes ? (
                    <p className="mt-3 rounded-lg bg-ink/5 px-3 py-2 text-sm leading-6 text-ink/65">
                      Admin notes: {report.adminNotes}
                    </p>
                  ) : null}

                  {isOpen ? (
                    <form
                      action={updateReport}
                      className="mt-4 space-y-3 border-t border-ink/10 pt-4"
                    >
                      <input type="hidden" name="source" value={report.source} />
                      <input type="hidden" name="id" value={report.id} />
                      <label
                        htmlFor={`notes-${report.source}-${report.id}`}
                        className="text-sm font-medium text-ink"
                      >
                        Admin notes
                      </label>
                      <textarea
                        id={`notes-${report.source}-${report.id}`}
                        name="notes"
                        rows={3}
                        defaultValue={report.adminNotes ?? ""}
                        className="w-full rounded-lg border border-ink/15 bg-transparent px-3 py-2 text-base text-ink sm:text-sm"
                      />
                      <div className="grid gap-2 sm:flex sm:flex-wrap">
                        {statuses.map((next) => (
                          <button
                            key={next}
                            type="submit"
                            name="status"
                            value={next}
                            className={`min-h-11 w-full rounded-lg px-3 py-2 text-sm font-medium sm:w-auto ${
                              next === "dismissed"
                                ? "border border-ink/15 text-ink/70"
                                : "bg-wine text-white"
                            }`}
                          >
                            {next === "actioned"
                              ? "Mark actioned"
                              : next === "resolved"
                                ? "Resolve"
                                : next === "reviewing"
                                  ? "Mark reviewing"
                                  : "Dismiss"}
                          </button>
                        ))}
                      </div>
                    </form>
                  ) : null}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
