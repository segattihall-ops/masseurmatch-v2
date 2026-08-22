import "server-only";

import { createServiceClient } from "@masseurmatch/db/client";

import type { NewTicket } from "./ticket-vocabulary";

/**
 * A therapist's own support tickets.
 *
 * ---------------------------------------------------------------------------
 * Why the service client, and why that is not a shortcut
 * ---------------------------------------------------------------------------
 * `support_tickets` and `support_ticket_messages` carry exactly one policy
 * each:
 *
 *     service_role_tickets_all   ALL   using (auth.role() = 'service_role')
 *
 * There is no policy for `authenticated`. So a read through the session client
 * returns **zero rows to everybody** — which is what the page this replaces
 * did, and why every therapist saw "no tickets yet" no matter how many they
 * had. It failed silently because RLS filters rather than errors.
 *
 * The old site hit the same wall and reached for its admin client for the same
 * reason. So: service client, from the server, after `requireTherapist()` has
 * authorised the caller, with `user_id` pinned to their own id on every query
 * and every insert. The key is what makes the row reachable; the pinned id is
 * what keeps it theirs.
 *
 * Widening RLS instead would be the better long-term fix, but it is a schema
 * change to a table the admin queue also reads, and it is not this change.
 */

export type ProTicket = {
  id: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
};

export type ProTicketMessage = {
  id: string;
  sender_role: string;
  body: string;
  created_at: string;
};

const TICKET_COLUMNS = "id,subject,category,status,priority,created_at,updated_at";

/** Every ticket this therapist has opened, newest first. */
export async function listMyTickets(userId: string): Promise<ProTicket[]> {
  let supabase;
  try {
    supabase = createServiceClient();
  } catch {
    return [];
  }

  const { data, error } = await supabase
    .from("support_tickets")
    .select(TICKET_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  return error ? [] : ((data ?? []) as unknown as ProTicket[]);
}

/**
 * One ticket and its thread, or null.
 *
 * The `user_id` filter is the authorisation: a therapist who guesses another
 * ticket's id gets null rather than somebody else's conversation.
 */
export async function getMyTicket(
  userId: string,
  ticketId: string,
): Promise<{ ticket: ProTicket; messages: ProTicketMessage[] } | null> {
  let supabase;
  try {
    supabase = createServiceClient();
  } catch {
    return null;
  }

  const { data, error } = await supabase
    .from("support_tickets")
    .select(TICKET_COLUMNS)
    .eq("id", ticketId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;

  const thread = await supabase
    .from("support_ticket_messages")
    .select("id,sender_role,body,created_at")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true })
    .limit(200);

  return {
    ticket: data as unknown as ProTicket,
    messages: thread.error ? [] : ((thread.data ?? []) as unknown as ProTicketMessage[]),
  };
}

export type TicketWriteResult = { ok: true; id: string } | { ok: false; error: string };

/**
 * Open a ticket, with its first message.
 *
 * The message is written after the ticket and is not allowed to fail the
 * ticket: a support row with no body is still something a person can pick up
 * and ask about, whereas losing the ticket loses the report entirely.
 */
export async function createMyTicket(
  userId: string,
  profileId: string | null,
  input: NewTicket,
): Promise<TicketWriteResult> {
  let supabase;
  try {
    supabase = createServiceClient();
  } catch {
    return { ok: false, error: "Support is not available on this deployment." };
  }

  const { data, error } = await supabase
    .from("support_tickets")
    .insert({
      user_id: userId,
      profile_id: profileId,
      subject: input.subject,
      category: input.category,
      priority: input.priority,
      status: "open",
      source: "web",
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: `We could not open that ticket: ${error?.message ?? "unknown"}` };
  }

  const id = (data as { id: string }).id;

  await supabase.from("support_ticket_messages").insert({
    ticket_id: id,
    sender_id: userId,
    sender_role: "provider",
    body: input.message,
  });

  return { ok: true, id };
}

/**
 * Add a reply to a thread the caller owns.
 *
 * Re-checks ownership rather than trusting the id from the form, then moves the
 * ticket back to `open` if it was waiting on the therapist — otherwise a reply
 * would sit in a queue nobody is watching.
 */
export async function replyToMyTicket(
  userId: string,
  ticketId: string,
  body: string,
): Promise<TicketWriteResult> {
  let supabase;
  try {
    supabase = createServiceClient();
  } catch {
    return { ok: false, error: "Support is not available on this deployment." };
  }

  const owned = await supabase
    .from("support_tickets")
    .select("id,status")
    .eq("id", ticketId)
    .eq("user_id", userId)
    .maybeSingle();

  if (owned.error || !owned.data)
    return { ok: false, error: "That ticket is not on your account." };

  const { error } = await supabase.from("support_ticket_messages").insert({
    ticket_id: ticketId,
    sender_id: userId,
    sender_role: "provider",
    body,
  });

  if (error) return { ok: false, error: `That did not send: ${error.message}` };

  const status = (owned.data as { status: string | null }).status;
  if (status === "waiting_on_user" || status === "resolved" || status === "closed") {
    await supabase
      .from("support_tickets")
      .update({ status: "open", updated_at: new Date().toISOString() })
      .eq("id", ticketId)
      .eq("user_id", userId);
  }

  return { ok: true, id: ticketId };
}
