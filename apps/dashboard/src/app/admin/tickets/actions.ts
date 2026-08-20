"use server";

import { createServiceClient } from "@masseurmatch/db/client";
import { revalidatePath } from "next/cache";

import type { StepState } from "@/app/onboarding/form-state";
import { requireAdmin } from "@/lib/guards";
import { TICKET_STATUSES } from "@/lib/ticket-statuses";

/**
 * Ticket mutations. Service client behind `requireAdmin` — see `lib/tickets.ts`
 * for why RLS cannot carry the authorization here. Both actions log to
 * `audit_log` first, the same ordering moderation uses: a failure between the
 * two leaves a logged intent that did not apply, never an unlogged change.
 */

export async function replyToTicket(_prev: StepState, formData: FormData): Promise<StepState> {
  const viewer = await requireAdmin("/admin/tickets");

  const ticketId = String(formData.get("ticket_id") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!ticketId) return { error: "No ticket selected." };
  if (body.length < 2) return { error: "Write a reply first." };
  if (body.length > 5000) return { error: "Keep replies under 5000 characters." };

  const supabase = createServiceClient();

  const { error: logError } = await supabase.from("audit_log").insert({
    admin_id: viewer.user.id,
    admin_user_id: viewer.user.id,
    action: "ticket.reply",
    target_type: "support_ticket",
    target_id: ticketId,
    target_profile_id: null,
    reason: body.slice(0, 200),
    details: {},
  });
  if (logError) {
    return { error: `Could not write the audit entry, so nothing was sent: ${logError.message}` };
  }

  const { error } = await supabase.from("support_ticket_messages").insert({
    ticket_id: ticketId,
    sender_id: viewer.user.id,
    sender_role: "admin",
    body,
  });
  if (error) return { error: `Logged, but the reply failed: ${error.message}` };

  // An admin reply means the ball is in the provider's court.
  await supabase
    .from("support_tickets")
    .update({ status: "waiting_on_user" })
    .eq("id", ticketId)
    .in("status", ["open", "in_progress"]);

  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath("/admin/tickets");
  return { ok: true };
}

export async function setTicketStatus(_prev: StepState, formData: FormData): Promise<StepState> {
  const viewer = await requireAdmin("/admin/tickets");

  const ticketId = String(formData.get("ticket_id") ?? "").trim();
  const status = String(formData.get("status") ?? "");
  if (!ticketId) return { error: "No ticket selected." };
  if (!(TICKET_STATUSES as readonly string[]).includes(status)) {
    return { error: "Unknown status." };
  }

  const supabase = createServiceClient();

  const { error: logError } = await supabase.from("audit_log").insert({
    admin_id: viewer.user.id,
    admin_user_id: viewer.user.id,
    action: `ticket.status.${status}`,
    target_type: "support_ticket",
    target_id: ticketId,
    target_profile_id: null,
    reason: `Status set to ${status}`,
    details: {},
  });
  if (logError) {
    return { error: `Could not write the audit entry, so nothing changed: ${logError.message}` };
  }

  const done = status === "resolved" || status === "closed";
  const { error } = await supabase
    .from("support_tickets")
    .update({ status, resolved_at: done ? new Date().toISOString() : null })
    .eq("id", ticketId);
  if (error) return { error: `Logged, but the change failed: ${error.message}` };

  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath("/admin/tickets");
  return { ok: true };
}
