import "server-only";

import { createServiceClient } from "@masseurmatch/db/client";

import { TICKET_STATUSES } from "@/lib/ticket-statuses";

export { TICKET_STATUSES } from "@/lib/ticket-statuses";

/**
 * Support tickets.
 *
 * These tables carry deny-all RLS for `anon`/`authenticated` — by design, all
 * access flows through server code holding the service key (see the
 * `create_support_tickets` migration). So unlike the rest of the admin data
 * layer, this one uses the service client. Every entry point below must
 * therefore sit behind `requireAdmin()` in the caller — the database will not
 * catch a missing check here.
 */

export type Ticket = {
  id: string;
  user_id: string;
  profile_id: string | null;
  subject: string;
  category: string;
  priority: string;
  status: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  profiles: { display_name: string | null } | null;
};

export type TicketMessage = {
  id: string;
  sender_role: string;
  body: string;
  created_at: string;
};

const TICKET_COLUMNS =
  "id,user_id,profile_id,subject,category,priority,status,resolved_at,created_at,updated_at," +
  "profiles(display_name)";

export async function listTickets(status?: string): Promise<Ticket[]> {
  let query = createServiceClient()
    .from("support_tickets")
    .select(TICKET_COLUMNS)
    .order("updated_at", { ascending: false })
    .limit(100);

  if (status && (TICKET_STATUSES as readonly string[]).includes(status)) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Could not load tickets: ${error.message}`);
  return (data ?? []) as unknown as Ticket[];
}

export async function getTicket(
  id: string,
): Promise<{ ticket: Ticket; messages: TicketMessage[] } | null> {
  const supabase = createServiceClient();

  const { data: ticket, error } = await supabase
    .from("support_tickets")
    .select(TICKET_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Could not load that ticket: ${error.message}`);
  if (!ticket) return null;

  const { data: messages, error: messagesError } = await supabase
    .from("support_ticket_messages")
    .select("id,sender_role,body,created_at")
    .eq("ticket_id", id)
    .order("created_at", { ascending: true });
  if (messagesError) throw new Error(`Could not load the thread: ${messagesError.message}`);

  return {
    ticket: ticket as unknown as Ticket,
    messages: (messages ?? []) as unknown as TicketMessage[],
  };
}
