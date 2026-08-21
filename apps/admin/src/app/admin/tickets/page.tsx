import { Card } from "@masseurmatch/ui";
import type { Metadata } from "next";
import Link from "next/link";

import { requireAdmin } from "@/lib/guards";
import { listTickets, TICKET_STATUSES } from "@/lib/tickets";

export const metadata: Metadata = {
  title: "Tickets",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In progress",
  waiting_on_user: "Waiting on user",
  resolved: "Resolved",
  closed: "Closed",
};

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  await requireAdmin("/admin/tickets");

  const status = (searchParams.status ?? "").trim();
  const tickets = await listTickets(status || undefined);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-semibold text-ink">Support Tickets</h1>
      <p className="mt-1 text-sm text-ink/60">Two-way support desk with therapists.</p>

      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin/tickets"
          className={`rounded-full px-3 py-1 ${status === "" ? "bg-wine text-white" : "bg-ink/5 text-ink/70 hover:bg-ink/10"}`}
        >
          All
        </Link>
        {TICKET_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/tickets?status=${s}`}
            className={`rounded-full px-3 py-1 ${status === s ? "bg-wine text-white" : "bg-ink/5 text-ink/70 hover:bg-ink/10"}`}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {tickets.map((ticket) => (
          <Link key={ticket.id} href={`/admin/tickets/${ticket.id}`} className="block">
            <Card className="p-4 transition hover:border-wine/40">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-ink">{ticket.subject}</p>
                  <p className="mt-0.5 text-xs text-ink/50">
                    {ticket.profiles?.display_name ?? "Unknown therapist"} · {ticket.category} ·{" "}
                    {new Date(ticket.updated_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-ink/5 px-2 py-1 capitalize text-ink/70">
                    {ticket.priority}
                  </span>
                  <span className="rounded-full bg-wine/10 px-2 py-1 text-wine">
                    {STATUS_LABELS[ticket.status] ?? ticket.status}
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        ))}

        {tickets.length === 0 ? (
          <Card className="p-10 text-center text-ink/50">No tickets in this view.</Card>
        ) : null}
      </div>
    </main>
  );
}
