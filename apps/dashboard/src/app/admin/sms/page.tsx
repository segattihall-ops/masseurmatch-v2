import { Card } from "@masseurmatch/ui";
import type { Metadata } from "next";

import { getSmsConsole } from "@/lib/admin-secondary";
import { requireAdmin } from "@/lib/guards";

export const metadata: Metadata = {
  title: "SMS operations",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function maskPhone(value: string): string {
  const clean = value.replace(/\D/g, "");
  if (clean.length < 4) return "••••";
  return `•••${clean.slice(-4)}`;
}

export default async function AdminSmsPage() {
  await requireAdmin("/admin/sms");
  const { logs, profiles, alerts } = await getSmsConsole();

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold text-ink">SMS operations</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink/60">
        Read-only operational view of existing SMS records. Phone numbers are masked in the Admin
        list, and sending remains owned by the Twilio integration layer.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-ink/55">Recent messages</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{logs.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-ink/55">Configured profiles</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{profiles.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-ink/55">Unresolved follow-ups</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{alerts.length}</p>
        </Card>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-ink">Recent messages</h2>
        <div className="mt-4 space-y-3">
          {logs.map((log) => (
            <Card key={log.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-medium capitalize text-ink">
                  {log.direction} · {maskPhone(log.from_number)} → {maskPhone(log.to_number)}
                </p>
                <p className="text-xs text-ink/45">
                  {log.created_at ? new Date(log.created_at).toLocaleString() : "Unknown time"}
                </p>
              </div>
              <p className="mt-2 line-clamp-3 text-sm text-ink/65">{log.body}</p>
              <p className="mt-2 text-xs text-ink/45">
                {log.is_manual ? "Manual" : "Automated"}
                {log.intent ? ` · ${log.intent}` : ""}
                {log.status ? ` · ${log.status}` : ""}
              </p>
            </Card>
          ))}
          {logs.length === 0 ? <p className="text-sm text-ink/50">No SMS logs recorded.</p> : null}
        </div>
      </section>
    </main>
  );
}
