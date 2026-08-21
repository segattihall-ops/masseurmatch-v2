import { createSessionClient } from "@masseurmatch/db/auth";
import Link from "next/link";

import { PageHeader } from "@/components/pro/page-header";
import { EmptyState, Section } from "@/components/pro/section";
import { requireTherapist } from "@/lib/guards";

export const metadata = { title: "Support | MasseurMatch" };
export const dynamic = "force-dynamic";

type Ticket = {
  id: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
};

/**
 * The therapist's own support tickets.
 *
 * Their own, not the admin queue: the same table backs both, and the filter
 * here is `user_id`, matched again by RLS on the way out.
 */
export default async function ProTicketsPage() {
  const viewer = await requireTherapist("/pro/tickets");

  const { data, error } = await createSessionClient()
    .from("support_tickets")
    .select("id,subject,category,status,priority,created_at")
    .eq("user_id", viewer.user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const tickets = error ? [] : ((data ?? []) as unknown as Ticket[]);

  return (
    <>
      <PageHeader
        eyebrow="Provider dashboard"
        title="Support"
        subtitle="Tickets you have opened with our team."
      />

      <Section
        title="Your tickets"
        description="Reply to the email thread on a ticket to add to it."
      >
        {tickets.length === 0 ? (
          <EmptyState>
            {error
              ? "Support tickets are not available on this account yet."
              : "No tickets open. Anything you raise with us shows up here."}
          </EmptyState>
        ) : (
          <ul className="space-y-2">
            {tickets.map((ticket) => (
              <li
                key={ticket.id}
                className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-border p-4"
              >
                <div>
                  <p className="font-medium text-foreground">{ticket.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {ticket.category} · {ticket.priority} priority ·{" "}
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">{ticket.status}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Something else?">
        <p className="text-sm text-muted-foreground">
          The{" "}
          <Link href="/pro/ai-coach" className="underline underline-offset-4">
            AI Profile Coach
          </Link>{" "}
          answers most profile and visibility questions without waiting on us.
        </p>
      </Section>
    </>
  );
}
