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
  await requireAdmin("/tickets");

  const status = (searchParams.status ?? "").trim();
  const tickets = await listTickets(status || undefined);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-2xl font-semibold text-ink sm:text-3xl">Support Tickets</h1>
      <p className="mt-1 text-sm text-ink/60">Two-way support desk with therapists.</p>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1 text-sm sm:flex-wrap sm:overflow-visible">
        <Link
          href="/tickets"
          className={`shrink-0 rounded-full px-3 py-1.5 ${status === "" ? "bg-wine text-white" : "bg-ink/5 text-ink/70 hover:bg-ink/10"}`}
        >
          All
        </Link>
        {TICKET_STATUSES.map((ticketStatus) => (
          <Link
            key={ticketStatus}
            href={`/tickets?status=${ticketStatus}`}
            className={`shrink-0 rounded-full px-3 py-1.5 ${status === ticketStatus ? "bg-wine text-white" : "bg-ink/5 text-ink/70 hover:bg-ink/10"}`}
          >
            {STATUS_LABELS[ticketStatus]}
          </Link>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {tickets.map((ticket) => (
          <Link key={ticket.id} href={`/tickets/${ticket.id}`} className="block">
            <Card className="p-4 transition hover:border-wine/40">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="break-words font-medium text-ink">{ticket.subject}</p>
                  <p className="mt-1 text-xs leading-5 text-ink/50">
                    {ticket.profiles?.display_name ?? "Unknown therapist"} · {ticket.category} ·{" "}
                    {new Date(ticket.updated_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
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
          <Card className="p-8 text-center text-ink/50 sm:p-10">No tickets in this view.</Card>
        ) : null}
      </div>
    </main>
  );
}
