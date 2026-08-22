import Link from "next/link";

import { PageHeader } from "@/components/pro/page-header";
import { EmptyState, Section } from "@/components/pro/section";
import { requireTherapist } from "@/lib/guards";
import { listMyTickets } from "@/lib/pro-tickets";
import { categoryLabel, isOpenTicket, ticketStatusLabel } from "@/lib/ticket-vocabulary";

import { NewTicketForm } from "./new-ticket-form";

export const metadata = { title: "Support | MasseurMatch" };
export const dynamic = "force-dynamic";

/**
 * The therapist's own support tickets, and the form that opens one.
 *
 * ---------------------------------------------------------------------------
 * What was wrong
 * ---------------------------------------------------------------------------
 * Two things, and the second hid the first.
 *
 * There was no way to open a ticket — the page was a list and nothing else, so
 * "contact support" led to a screen that could only ever say "no tickets yet".
 *
 * And the list itself was empty for everybody. It read `support_tickets`
 * through the session client, and that table has exactly one policy —
 * `service_role_tickets_all` — with nothing granted to `authenticated`. RLS
 * filters rather than errors, so every therapist got zero rows and the page
 * rendered its friendly empty state over the top of however many tickets they
 * actually had. See the note in `@/lib/pro-tickets`.
 */
export default async function ProTicketsPage() {
  const viewer = await requireTherapist("/pro/tickets");
  const tickets = await listMyTickets(viewer.user.id);
  const open = tickets.filter((ticket) => isOpenTicket(ticket.status)).length;

  return (
    <>
      <PageHeader
        eyebrow="Provider dashboard"
        title="Support"
        subtitle={
          tickets.length === 0
            ? "Ask us anything about your listing, your plan or your account."
            : `${open} open of ${tickets.length} ticket${tickets.length === 1 ? "" : "s"}.`
        }
      />

      <Section
        title="Open a ticket"
        description="A person on our team reads these. Include anything that would help us reproduce the problem."
      >
        <NewTicketForm />
      </Section>

      <Section title="Your tickets">
        {tickets.length === 0 ? (
          <EmptyState>
            Nothing yet. Anything you open above appears here with its status, and you can reply in
            the thread.
          </EmptyState>
        ) : (
          <ul className="space-y-2">
            {tickets.map((ticket) => (
              <li key={ticket.id}>
                <Link
                  href={`/pro/tickets/${ticket.id}`}
                  className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 rounded-lg border border-border p-4 transition hover:bg-muted"
                >
                  <span className="min-w-0">
                    <span className="block font-medium text-foreground">{ticket.subject}</span>
                    <span className="block text-xs text-muted-foreground">
                      {categoryLabel(ticket.category)} ·{" "}
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs uppercase tracking-wide text-muted-foreground">
                    {ticketStatusLabel(ticket.status)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
