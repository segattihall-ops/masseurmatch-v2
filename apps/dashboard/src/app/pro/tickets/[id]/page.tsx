import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/pro/page-header";
import { DetailRow, EmptyState, Section } from "@/components/pro/section";
import { requireTherapist } from "@/lib/guards";
import { getMyTicket } from "@/lib/pro-tickets";
import { categoryLabel, isOpenTicket, ticketStatusLabel } from "@/lib/ticket-vocabulary";

import { ReplyForm } from "./reply-form";

export const metadata = { title: "Support ticket | MasseurMatch" };
export const dynamic = "force-dynamic";

/** Who wrote a message, in the second person where it is the reader. */
function senderLabel(role: string): string {
  switch (role) {
    case "provider":
    case "user":
      return "You";
    case "admin":
      return "MasseurMatch";
    case "system":
      return "Automatic";
    default:
      return role;
  }
}

/**
 * One ticket and its thread.
 *
 * `getMyTicket` filters on `user_id` as well as the ticket id, so guessing an
 * id belonging to somebody else returns null and this 404s rather than showing
 * a stranger's support conversation.
 */
export default async function ProTicketPage({ params }: { params: { id: string } }) {
  const viewer = await requireTherapist("/pro/tickets");
  const found = await getMyTicket(viewer.user.id, params.id);

  if (!found) notFound();

  const { ticket, messages } = found;

  return (
    <>
      <PageHeader
        eyebrow="Support"
        title={ticket.subject}
        subtitle={`${categoryLabel(ticket.category)} · ${ticketStatusLabel(ticket.status)}`}
        action={{ href: "/pro/tickets", label: "All tickets" }}
      />

      <Section title="Conversation">
        {messages.length === 0 ? (
          <EmptyState>
            No messages on this ticket yet. Add one below and our team will see it.
          </EmptyState>
        ) : (
          <ul className="space-y-3">
            {messages.map((message) => {
              const mine = message.sender_role === "provider" || message.sender_role === "user";
              return (
                <li
                  key={message.id}
                  className={`rounded-lg border p-4 ${
                    mine ? "border-border" : "border-border bg-muted"
                  }`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {senderLabel(message.sender_role)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(message.created_at).toLocaleString()}
                    </p>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm text-foreground">{message.body}</p>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {isOpenTicket(ticket.status) ? (
        <Section title="Reply">
          <ReplyForm ticketId={ticket.id} />
        </Section>
      ) : (
        <Section title="This ticket is closed">
          <p className="text-sm text-muted-foreground">
            Replying reopens it — write below if there is more to say, or{" "}
            <Link href="/pro/tickets" className="underline underline-offset-4">
              open a new ticket
            </Link>{" "}
            for something unrelated.
          </p>
          <div className="mt-4">
            <ReplyForm ticketId={ticket.id} />
          </div>
        </Section>
      )}

      <Section title="Details">
        <div>
          <DetailRow label="Status" value={ticketStatusLabel(ticket.status)} />
          <DetailRow label="Category" value={categoryLabel(ticket.category)} />
          <DetailRow label="Priority" value={ticket.priority} />
          <DetailRow label="Opened" value={new Date(ticket.created_at).toLocaleDateString()} />
          <DetailRow
            label="Last activity"
            value={new Date(ticket.updated_at).toLocaleDateString()}
          />
        </div>
      </Section>
    </>
  );
}
