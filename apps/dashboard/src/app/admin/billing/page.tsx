import { Card } from "@masseurmatch/ui";
import type { Metadata } from "next";

import { getBillingConsole } from "@/lib/admin-secondary";
import { requireAdmin } from "@/lib/guards";

export const metadata: Metadata = {
  title: "Billing operations",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminBillingPage() {
  await requireAdmin("/admin/billing");
  const { subscriptions, events } = await getBillingConsole();
  const providerCounts = new Map<string, number>();
  for (const subscription of subscriptions) {
    const provider = subscription.provider ?? "unassigned";
    providerCounts.set(provider, (providerCounts.get(provider) ?? 0) + 1);
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold text-ink">Billing operations</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink/60">
        Provider-neutral subscription state from the current billing tables. This Admin does not
        initiate charges or silently switch processors.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-ink/55">Subscriptions</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{subscriptions.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-ink/55">Billing events</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{events.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-ink/55">Providers present</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{providerCounts.size}</p>
        </Card>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-ink">Subscriptions</h2>
        <Card className="mt-4 overflow-x-auto p-0">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/50">
                <th className="px-4 py-3">Therapist</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Period end</th>
                <th className="px-4 py-3">Cancel at end</th>
                <th className="px-4 py-3">Provider ID</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((row) => (
                <tr key={row.id} className="border-b border-ink/5 last:border-b-0">
                  <td className="px-4 py-3 font-medium text-ink">{row.profileName}</td>
                  <td className="px-4 py-3 text-ink/65">{row.provider ?? "—"}</td>
                  <td className="px-4 py-3 text-ink/65">{row.status}</td>
                  <td className="px-4 py-3 text-ink/65">
                    {row.current_period_end ? new Date(row.current_period_end).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-ink/65">{row.cancel_at_period_end ? "Yes" : "No"}</td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-xs text-ink/45">
                    {row.provider_subscription_id ?? "—"}
                  </td>
                </tr>
              ))}
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-ink/50">
                    No subscription rows exist yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </Card>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-ink">Recent provider events</h2>
        <div className="mt-4 space-y-3">
          {events.map((event) => (
            <Card key={event.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-ink">
                  {event.provider} · {event.kind}
                </p>
                <p className="text-xs text-ink/45">
                  {new Date(event.processed_at).toLocaleString()}
                </p>
              </div>
              <p className="mt-1 text-xs text-ink/50">Subscription: {event.subscription_id}</p>
              {event.error ? <p className="mt-2 text-sm text-wine">{event.error}</p> : null}
            </Card>
          ))}
          {events.length === 0 ? <p className="text-sm text-ink/50">No billing events recorded.</p> : null}
        </div>
      </section>
    </main>
  );
}
