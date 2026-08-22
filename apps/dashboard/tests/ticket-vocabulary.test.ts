import { describe, expect, it } from "vitest";

import { TICKET_STATUSES } from "@/lib/ticket-statuses";
import {
  categoryLabel,
  isOpenTicket,
  newTicketSchema,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  ticketStatusLabel,
} from "@/lib/ticket-vocabulary";

/**
 * These pin the form's vocabulary to the CHECK constraints on
 * `support_tickets`. The cost of drift is not theoretical: the same drift on
 * `therapist_subscriptions.status` meant no therapist could subscribe at all,
 * and nothing failed at build time.
 */
describe("ticket vocabulary matches the database", () => {
  it("offers only categories the CHECK admits", () => {
    const allowed = ["general", "billing", "account", "technical", "profile", "other"];
    for (const option of TICKET_CATEGORIES) expect(allowed).toContain(option.value);
  });

  it("offers only priorities the CHECK admits", () => {
    const allowed = ["low", "normal", "medium", "high", "urgent"];
    for (const option of TICKET_PRIORITIES) expect(allowed).toContain(option.value);
  });

  it("knows every status the CHECK admits", () => {
    expect([...TICKET_STATUSES].sort()).toEqual(
      ["closed", "in_progress", "open", "resolved", "waiting_on_user"].sort(),
    );
  });
});

describe("newTicketSchema", () => {
  const valid = {
    subject: "Card declined",
    category: "billing",
    priority: "high",
    message: "I tried to subscribe three times and it failed each time.",
  };

  it("accepts a real ticket", () => {
    expect(newTicketSchema.safeParse(valid).success).toBe(true);
  });

  it("refuses a category or priority the database would reject", () => {
    expect(newTicketSchema.safeParse({ ...valid, category: "refunds" }).success).toBe(false);
    expect(newTicketSchema.safeParse({ ...valid, priority: "critical" }).success).toBe(false);
  });

  it("asks for enough to act on", () => {
    expect(newTicketSchema.safeParse({ ...valid, subject: "hi" }).success).toBe(false);
    expect(newTicketSchema.safeParse({ ...valid, message: "broken" }).success).toBe(false);
  });
});

describe("reading a status", () => {
  it("counts the three states that still need somebody", () => {
    expect(isOpenTicket("open")).toBe(true);
    expect(isOpenTicket("in_progress")).toBe(true);
    // The one the old open-count forgot.
    expect(isOpenTicket("waiting_on_user")).toBe(true);
    expect(isOpenTicket("resolved")).toBe(false);
    expect(isOpenTicket("closed")).toBe(false);
  });

  it("says what a status means, and shows an unknown one as itself", () => {
    expect(ticketStatusLabel("waiting_on_user")).toBe("Waiting on you");
    expect(ticketStatusLabel("escalated_tier_2")).toBe("escalated tier 2");
    expect(categoryLabel("billing")).toBe("Billing or subscription");
    expect(categoryLabel(null)).toBe("General question");
  });
});
