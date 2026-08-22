import { PLANS } from "@masseurmatch/billing";
import { Card } from "@masseurmatch/ui";
import type { Metadata } from "next";
import Link from "next/link";

import { getAdminBillingOverview } from "@/lib/admin-insights";
import { requireAdmin } from "@/lib/guards";

export const metadata: Metadata = {
  title: "Billing",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function date(value: string | null): string {
  return value ? new Date(value).toLocaleString() : "—";
}

export default async function BillingPage() {
  await requireAdmin("/billing");
  const billing = await getAdminBillingOverview();
  const catalog = [PLANS.standard, PLANS.pro, PLANS.elite];

  const metrics = [
    ["Active", billing.active],
    ["Trialing", billing.trialing],
    ["Past due", billing.pastDue],
    ["Canceled", billing.canceled],
    ["Events · 30d", billing.billingEvents30Days],
    ["Errors · 30d", billing.billingErrors30Days],
  ] as const;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-wine">Operations</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">PayPal billing</h1>
          <p className="mt-2 max-w-3xl text-sm text-ink/60">
            Live subscription state from Supabase. The product catalogue is the application source
            of truth; PayPal checkout also verifies the remote plan price before money can move.
          </p>
        </div>
        <a
          href="https://dashboard.masseurmatch.com/api/health/billing"
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-wine/20 px-3 py-2 text-sm font-medium text-wine hover:bg-wineSoft/30"
        >
          Live billing health ↗
        </a>
      </div>

      <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {metrics.map(([label, value]) => (
          <Card key={label} className="p-4">
            <p className="text-xs text-ink/55">{label}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">{value}</p>
          </Card>
        ))}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-ink">Advertised catalogue</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {catalog.map((plan) => (
            <Card key={plan.id} className="p-5">
              <p className="text-sm font-semibold text-ink">{plan.name}</p>
              <p className="mt-2 text-2xl font-semibold text-wine">
                ${(plan.priceCents / 100).toFixed(0)}
                <span className="text-sm font-normal text-ink/50"> / month</span>
              </p>
              <p className="mt-2 text-xs text-ink/50">{plan.photoLimit} profile photos</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">Subscriptions</h2>
            <p className="mt-1 text-sm text-ink/55">Latest 100 provider subscription records.</p>
          </div>
        </div>

        <Card className="mt-3 overflow-x-auto">
          {billing.subscriptions.length === 0 ? (
            <p className="p-8 text-center text-sm text-ink/55">No subscription records yet.</p>
          ) : (
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/50">
                <tr>
                  <th className="px-4 py-3">Provider</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Processor</th>
                  <th className="px-4 py-3">Period end</th>
                  <th className="px-4 py-3">Cancel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {billing.subscriptions.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3">
                      {row.profileId ? (
                        <Link
                          href={`/people/${row.profileId}`}
                          className="font-medium text-wine hover:underline"
                        >
                          {row.profileName}
                        </Link>
                      ) : (
                        <span className="font-medium text-ink">{row.profileName}</span>
                      )}
                      {row.email ? <p className="mt-0.5 text-xs text-ink/50">{row.email}</p> : null}
                    </td>
                    <td className="px-4 py-3">
                      {row.planLabel}
                      <span className="ml-1 text-ink/45">{row.advertisedPrice}</span>
                    </td>
                    <td className="px-4 py-3 capitalize">{row.status.replaceAll("_", " ")}</td>
                    <td className="px-4 py-3 capitalize">{row.provider ?? "—"}</td>
                    <td className="px-4 py-3 text-ink/60">{date(row.currentPeriodEnd)}</td>
                    <td className="px-4 py-3">{row.cancelAtPeriodEnd ? "At period end" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-ink">Recent billing events</h2>
        <Card className="mt-3">
          {billing.recentEvents.length === 0 ? (
            <p className="p-8 text-center text-sm text-ink/55">No billing events recorded yet.</p>
          ) : (
            <ul className="divide-y divide-ink/10">
              {billing.recentEvents.map((event) => (
                <li
                  key={event.id}
                  className="flex flex-wrap items-start justify-between gap-3 p-4 text-sm"
                >
                  <div>
                    <p className="font-medium text-ink">{event.kind}</p>
                    <p className="mt-1 text-xs text-ink/50">
                      {event.provider ?? "unknown provider"} · {date(event.occurredAt)}
                    </p>
                  </div>
                  <span className={event.error ? "text-wine" : "text-ink/50"}>
                    {event.error ?? "Processed"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </main>
  );
}
