"use server";

import { revalidatePath } from "next/cache";

import { requireTherapist } from "@/lib/guards";
import { createMyTicket, replyToMyTicket } from "@/lib/pro-tickets";
import { getOrCreateMyProfile } from "@/lib/profile";
import { LIMITS, rateLimit } from "@/lib/rate-limit";
import { newTicketSchema, replySchema } from "@/lib/ticket-vocabulary";

import type { TicketFormState } from "./form-state";

/**
 * Open a support ticket.
 *
 * `user_id` comes from the authorised session, never from the form — it is the
 * only thing stopping a ticket being filed against somebody else's account, and
 * a hidden input would put that decision in the browser.
 */
export async function openTicket(
  _prev: TicketFormState,
  formData: FormData,
): Promise<TicketFormState> {
  const viewer = await requireTherapist("/pro/tickets");

  const limited = rateLimit(
    `support-ticket:${viewer.user.id}`,
    LIMITS.supportTicket.limit,
    LIMITS.supportTicket.windowMs,
  );
  if (!limited.ok) {
    return { error: "That is a lot of tickets at once. Try again in a little while." };
  }

  const parsed = newTicketSchema.safeParse({
    subject: formData.get("subject") ?? "",
    category: formData.get("category") ?? "",
    priority: formData.get("priority") ?? "",
    message: formData.get("message") ?? "",
  });

  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const { profile } = await getOrCreateMyProfile(viewer.user.id);
  const result = await createMyTicket(viewer.user.id, profile.id, parsed.data);

  if (!result.ok) return { error: result.error };

  revalidatePath("/pro/tickets");
  revalidatePath("/pro/dashboard");
  return { ok: true };
}

/** Add a reply to a thread the caller owns. Ownership is re-checked server-side. */
export async function replyToTicket(
  _prev: TicketFormState,
  formData: FormData,
): Promise<TicketFormState> {
  const viewer = await requireTherapist("/pro/tickets");

  const ticketId = String(formData.get("ticket_id") ?? "");
  if (!ticketId) return { error: "That ticket could not be found." };

  const parsed = replySchema.safeParse({ body: formData.get("body") ?? "" });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const result = await replyToMyTicket(viewer.user.id, ticketId, parsed.data.body);
  if (!result.ok) return { error: result.error };

  revalidatePath(`/pro/tickets/${ticketId}`);
  revalidatePath("/pro/tickets");
  return { ok: true };
}
