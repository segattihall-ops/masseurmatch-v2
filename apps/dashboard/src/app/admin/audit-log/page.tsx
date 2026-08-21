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
  return query ? `/admin/audit-log?${query}` : "/admin/audit-log";
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  await requireAdmin("/admin/audit-log");
  const q = (searchParams.q ?? "").trim();
  const page = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);
  const { rows, total } = await listAuditLog(page, q);
  const pageCount = Math.max(1, Math.ceil(total / 50));

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <div>
        <h1 className="text-3xl font-semibold text-ink">Audit log</h1>
        <p className="mt-1 text-sm text-ink/60">
          Immutable operational trail for moderation, verification, reports, photos, and other
          privileged actions.
        </p>
      </div>

      <form method="get" action="/admin/audit-log" className="mt-6 flex flex-wrap gap-3">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search action, target type, or target id"
          className="w-full max-w-md rounded-lg border border-ink/15 bg-transparent px-3 py-2 text-sm text-ink"
        />
        <button type="submit" className="rounded-lg bg-wine px-4 py-2 text-sm font-medium text-white">
          Search
        </button>
        {q ? (
          <Link href="/admin/audit-log" className="rounded-lg border border-ink/15 px-4 py-2 text-sm text-ink/70">
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
                  <p className="max-w-[260px] truncate text-xs text-ink/45" title={row.targetId ?? undefined}>
                    {row.targetId ?? "—"}
                  </p>
                </td>
                <td className="max-w-md px-4 py-3 text-ink/70">{row.reason ?? "—"}</td>
                <td className="max-w-[180px] truncate px-4 py-3 text-xs text-ink/45" title={row.adminUserId ?? undefined}>
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
        <nav aria-label="Audit log pages" className="mt-4 flex items-center gap-4 text-sm">
          {page > 1 ? (
            <Link href={pageHref(q, page - 1)} className="text-wine hover:underline">
              ← Previous
            </Link>
          ) : null}
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
