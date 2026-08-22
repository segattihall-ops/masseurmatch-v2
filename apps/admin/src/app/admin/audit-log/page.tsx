import { Card } from "@masseurmatch/ui";
import type { Metadata } from "next";
import Link from "next/link";

import { listAuditLog } from "@/lib/admin-operations";
import { requireAdmin } from "@/lib/guards";

export const metadata: Metadata = {
  title: "Admin audit log",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function pageHref(q: string, page: number): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/audit-log?${query}` : "/audit-log";
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  await requireAdmin("/audit-log");
  const q = (searchParams.q ?? "").trim();
  const page = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);
  const { rows, total } = await listAuditLog(page, q);
  const pageCount = Math.max(1, Math.ceil(total / 50));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div>
        <h1 className="text-2xl font-semibold text-ink sm:text-3xl">Audit log</h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-ink/60">
          Immutable operational trail for moderation, verification, reports, photos, and other
          privileged actions.
        </p>
      </div>

      <form method="get" action="/audit-log" className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search action, target type, or target id"
          className="min-h-11 w-full rounded-lg border border-ink/15 bg-transparent px-3 py-2 text-base text-ink sm:max-w-md sm:text-sm"
        />
        <button
          type="submit"
          className="min-h-11 w-full rounded-lg bg-wine px-4 py-2 text-sm font-medium text-white sm:w-auto"
        >
          Search
        </button>
        {q ? (
          <Link
            href="/audit-log"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-ink/15 px-4 py-2 text-sm text-ink/70 sm:w-auto"
          >
            Clear
          </Link>
        ) : null}
      </form>

      <p className="mt-5 text-sm text-ink/50">
        {total} matching entr{total === 1 ? "y" : "ies"}.
      </p>

      <Card className="mt-6 overflow-x-auto p-0">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/50">
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Target</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Admin</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-ink/5 align-top last:border-b-0">
                <td className="whitespace-nowrap px-4 py-3 text-ink/50">
                  {new Date(row.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 font-medium text-ink">{row.action}</td>
                <td className="px-4 py-3 text-ink/70">
                  <p>{row.targetType ?? "—"}</p>
                  <p
                    className="max-w-[260px] truncate text-xs text-ink/45"
                    title={row.targetId ?? undefined}
                  >
                    {row.targetId ?? "—"}
                  </p>
                </td>
                <td className="max-w-md px-4 py-3 text-ink/70">{row.reason ?? "—"}</td>
                <td
                  className="max-w-[180px] truncate px-4 py-3 text-xs text-ink/45"
                  title={row.adminUserId ?? undefined}
                >
                  {row.adminUserId ?? "system"}
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink/50">
                  No audit entries match this search.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>

      {pageCount > 1 ? (
        <nav
          aria-label="Audit log pages"
          className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm sm:justify-start sm:gap-4"
        >
          {page > 1 ? (
            <Link href={pageHref(q, page - 1)} className="text-wine hover:underline">
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-ink/50">
            Page {Math.min(page, pageCount)} of {pageCount}
          </span>
          {page < pageCount ? (
            <Link href={pageHref(q, page + 1)} className="text-wine hover:underline">
              Next →
            </Link>
          ) : null}
        </nav>
      ) : null}
    </main>
  );
}
