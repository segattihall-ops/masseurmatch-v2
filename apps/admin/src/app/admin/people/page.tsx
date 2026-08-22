import { Card } from "@masseurmatch/ui";
import type { Metadata } from "next";
import Link from "next/link";

import { requireAdmin } from "@/lib/guards";
import { listPeople, PEOPLE_PAGE_SIZE, PEOPLE_STATUSES } from "@/lib/people";

export const metadata: Metadata = {
  title: "People",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function pageHref(q: string, status: string, page: number): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/people?${qs}` : "/people";
}

export default async function AdminPeoplePage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; page?: string };
}) {
  await requireAdmin("/people");

  const q = (searchParams.q ?? "").trim();
  const status = (searchParams.status ?? "").trim();
  const page = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);

  const { people, total } = await listPeople({ page, q, status });
  const pages = Math.max(1, Math.ceil(total / PEOPLE_PAGE_SIZE));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-2xl font-semibold text-ink sm:text-3xl">People</h1>
      <p className="mt-1 text-sm text-ink/60">
        Every profile in the database — {total} match{total === 1 ? "" : "es"}.
      </p>

      <form
        method="get"
        action="/people"
        className="mt-6 grid gap-3 sm:flex sm:flex-wrap sm:items-center"
      >
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search name, email, or city"
          className="min-h-11 w-full rounded-lg border border-ink/15 bg-transparent px-3 py-2 text-base text-ink placeholder:text-ink/40 sm:w-72 sm:text-sm"
        />
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <button
          type="submit"
          className="min-h-11 w-full rounded-lg bg-wine px-4 py-2 text-sm font-medium text-white sm:w-auto"
        >
          Search
        </button>
      </form>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 text-sm sm:flex-wrap sm:overflow-visible">
        <Link
          href={pageHref(q, "", 1)}
          className={`shrink-0 rounded-full px-3 py-1.5 ${status === "" ? "bg-wine text-white" : "bg-ink/5 text-ink/70 hover:bg-ink/10"}`}
        >
          All
        </Link>
        {PEOPLE_STATUSES.map((s) => (
          <Link
            key={s}
            href={pageHref(q, s, 1)}
            className={`shrink-0 rounded-full px-3 py-1.5 capitalize ${status === s ? "bg-wine text-white" : "bg-ink/5 text-ink/70 hover:bg-ink/10"}`}
          >
            {s}
          </Link>
        ))}
      </div>

      <Card className="mt-6 overflow-x-auto p-0">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/50">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Visibility</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Verified</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody>
            {people.map((person) => (
              <tr key={person.id} className="border-b border-ink/5 last:border-b-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/people/${person.id}`}
                    className="font-medium text-wine hover:underline"
                  >
                    {person.display_name || person.full_name || "Unnamed"}
                  </Link>
                  <p className="text-xs text-ink/50">{person.email ?? "—"}</p>
                </td>
                <td className="px-4 py-3 text-ink/70">
                  {person.city ? `${person.city}${person.state ? `, ${person.state}` : ""}` : "—"}
                </td>
                <td className="px-4 py-3 capitalize text-ink/70">{person.profile_status ?? "—"}</td>
                <td className="px-4 py-3 capitalize text-ink/70">
                  {person.visibility_status ?? "—"}
                </td>
                <td className="px-4 py-3 capitalize text-ink/70">
                  {person.subscription_tier ?? "free"}
                </td>
                <td className="px-4 py-3 text-ink/70">
                  {[
                    person.is_verified_identity ? "ID" : null,
                    person.is_verified_phone ? "Phone" : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-ink/50">
                  {new Date(person.updated_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {people.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-ink/50">
                  Nothing matches that search.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>

      {pages > 1 ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm sm:justify-start">
          {page > 1 ? (
            <Link href={pageHref(q, status, page - 1)} className="text-wine hover:underline">
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-ink/50">
            Page {page} of {pages}
          </span>
          {page < pages ? (
            <Link href={pageHref(q, status, page + 1)} className="text-wine hover:underline">
              Next →
            </Link>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
