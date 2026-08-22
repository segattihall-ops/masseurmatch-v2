import { z } from "zod";

/**
 * What `support_tickets` will actually accept.
 *
 * Every list here mirrors a CHECK constraint on the table. That is not a
 * stylistic choice: `therapist_subscriptions` drifted from its own constraint
 * and the result was that no therapist could subscribe at all, silently, for
 * as long as it took somebody to read a stack trace. A value this file offers
 * that the database refuses would fail a ticket the same way.
 *
 *   category  CHECK (general, billing, account, technical, profile, other)
 *   priority  CHECK (low, normal, medium, high, urgent)
 *   status    CHECK (open, in_progress, waiting_on_user, resolved, closed)
 *
 * `status` lives in `./ticket-statuses.ts`, which already matched.
 */

/** Offered in the form, in the order a therapist is likely to want them. */
export const TICKET_CATEGORIES = [
  { value: "billing", label: "Billing or subscription" },
  { value: "profile", label: "My listing or photos" },
  { value: "account", label: "Account and sign-in" },
  { value: "technical", label: "Something is broken" },
  { value: "general", label: "General question" },
  { value: "other", label: "Something else" },
] as const;

/**
 * Three, not the constraint's five.
 *
 * `low` and `medium` stay legal because older rows carry them, but asking
 * somebody to rank their own problem on a five-point scale gets you five
 * points of "urgent". Reading tolerates all five; writing offers three.
 */
export const TICKET_PRIORITIES = [
  { value: "normal", label: "Normal" },
  { value: "high", label: "High — this is blocking me" },
  { value: "urgent", label: "Urgent — money or safety" },
] as const;

const CATEGORY_VALUES = TICKET_CATEGORIES.map((c) => c.value) as [string, ...string[]];
const PRIORITY_VALUES = TICKET_PRIORITIES.map((p) => p.value) as [string, ...string[]];

export const newTicketSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(3, "Give it a subject — a few words is plenty.")
    .max(200, "Keep the subject under 200 characters."),
  category: z.enum(CATEGORY_VALUES, { message: "Pick a category." }),
  priority: z.enum(PRIORITY_VALUES, { message: "Pick a priority." }),
  message: z
    .string()
    .trim()
    .min(10, "Tell us what happened — a sentence or two.")
    .max(5000, "Keep it under 5000 characters."),
});

export type NewTicket = z.infer<typeof newTicketSchema>;

export const replySchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Write something first.")
    .max(5000, "Keep it under 5000 characters."),
});

/** A status as a therapist should read it. Unknown values are shown as themselves. */
export function ticketStatusLabel(status: string | null): string {
  switch ((status ?? "").trim().toLowerCase()) {
    case "open":
      return "Open";
    case "in_progress":
      return "Being looked at";
    case "waiting_on_user":
      return "Waiting on you";
    case "resolved":
      return "Resolved";
    case "closed":
      return "Closed";
    default:
      return (status ?? "Open").replace(/_/g, " ");
  }
}

/** Whether the ticket still needs somebody to do something. */
export function isOpenTicket(status: string | null): boolean {
  const value = (status ?? "").trim().toLowerCase();
  return value === "open" || value === "in_progress" || value === "waiting_on_user";
}

export function categoryLabel(value: string | null): string {
  return TICKET_CATEGORIES.find((c) => c.value === value)?.label ?? value ?? "General question";
}
