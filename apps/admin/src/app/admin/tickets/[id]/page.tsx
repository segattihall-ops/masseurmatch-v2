import { Card } from "@masseurmatch/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/guards";
import { getTicket } from "@/lib/tickets";

import { ReplyForm, StatusControls } from "./ticket-controls";

export const metadata: Metadata = {
  title: "Ticket",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminTicketPage({ params }: { params: { id: string } }) {
  await requireAdmin("/tickets");

  const result = await getTicket(params.id);
  if (!result) notFound();
  const { ticket, messages } = result;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        href="/tickets"
        className="inline-flex min-h-11 items-center text-sm font-medium text-wine hover:underline"
      >
        ← All tickets
      </Link>

      <h1 className="mt-3 break-words text-2xl font-semibold text-ink">{ticket.subject}</h1>
      <p className="mt-1 text-sm leading-6 text-ink/60">
        {ticket.profiles?.display_name ?? "Unknown therapist"} · {ticket.category} · opened{" "}
        {new Date(ticket.created_at).toLocaleString()}
      </p>

      <div className="mt-4">
        <StatusControls ticketId={ticket.id} current={ticket.status} />
      </div>

      <div className="mt-6 space-y-3">
        {messages.map((message) => (
          <Card
            key={message.id}
            className={`p-4 ${message.sender_role === "admin" ? "border-wine/30 bg-wine/5" : ""}`}
          >
            <p className="text-xs font-medium uppercase leading-5 tracking-wide text-ink/50">
              {message.sender_role === "admin" ? "MasseurMatch team" : "Therapist"} ·{" "}
              {new Date(message.created_at).toLocaleString()}
            </p>
            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-ink">
              {message.body}
            </p>
          </Card>
        ))}
        {messages.length === 0 ? (
          <Card className="p-6 text-center text-sm text-ink/50">No messages yet.</Card>
        ) : null}
      </div>

      <div className="mt-6">
        <ReplyForm ticketId={ticket.id} />
      </div>
    </main>
  );
}
