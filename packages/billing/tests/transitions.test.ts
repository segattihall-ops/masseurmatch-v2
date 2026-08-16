import { describe, expect, it } from "vitest";

import { GRACE_PERIOD_DAYS } from "../plans";
import { applyBillingEvent, initialState, shouldBeListed } from "../transitions";

/**
 * Subscription state machine.
 *
 * These are the rules that decide whether a paying therapist stays visible, so
 * they are tested for the awkward cases rather than the happy path: repeated
 * failures, recovery after a failure, and cancellation part-way through a paid
 * period.
 */

const NOW = new Date("2026-08-16T12:00:00.000Z");
const DAY = 24 * 60 * 60 * 1000;

describe("payment_succeeded", () => {
  it("activates and records the new period end", () => {
    const t = applyBillingEvent(initialState(), "payment_succeeded", NOW, "2026-09-16T12:00:00Z");
    expect(t.next.status).toBe("active");
    expect(t.next.currentPeriodEnd).toBe("2026-09-16T12:00:00Z");
    expect(t.listed).toBe(true);
  });

  it("clears a running grace period — a recovery is not a second chance", () => {
    // Leaving graceUntil set would unpublish a therapist who has already paid.
    const failed = applyBillingEvent(initialState(), "payment_failed", NOW);
    expect(failed.next.graceUntil).not.toBeNull();

    const recovered = applyBillingEvent(failed.next, "payment_succeeded", NOW);
    expect(recovered.next.graceUntil).toBeNull();
    expect(recovered.next.status).toBe("active");
    expect(recovered.note).toMatch(/recovered/i);
  });

  it("keeps the existing period end when the provider does not send one", () => {
    const active = applyBillingEvent(
      initialState(),
      "payment_succeeded",
      NOW,
      "2026-09-16T12:00:00Z",
    );
    const again = applyBillingEvent(active.next, "payment_succeeded", NOW);
    expect(again.next.currentPeriodEnd).toBe("2026-09-16T12:00:00Z");
  });
});

describe("payment_failed", () => {
  it("keeps the listing up and opens a 7-day window", () => {
    const t = applyBillingEvent(initialState(), "payment_failed", NOW);
    expect(t.next.status).toBe("past_due");
    expect(t.listed).toBe(true);
    expect(t.next.graceUntil).toBe(new Date(NOW.getTime() + GRACE_PERIOD_DAYS * DAY).toISOString());
  });

  it("does not extend the window on a repeat failure", () => {
    // Otherwise a card that never works keeps a listing alive indefinitely.
    const first = applyBillingEvent(initialState(), "payment_failed", NOW);
    const later = new Date(NOW.getTime() + 3 * DAY);
    const second = applyBillingEvent(first.next, "payment_failed", later);

    expect(second.next.graceUntil).toBe(first.next.graceUntil);
    expect(second.note).toMatch(/unchanged/i);
  });

  it("is listed inside the window and not after it", () => {
    const t = applyBillingEvent(initialState(), "payment_failed", NOW);
    expect(shouldBeListed(t.next, new Date(NOW.getTime() + 6 * DAY))).toBe(true);
    expect(shouldBeListed(t.next, new Date(NOW.getTime() + 8 * DAY))).toBe(false);
  });
});

describe("subscription_canceled", () => {
  it("keeps the listing until the paid period ends — they paid for it", () => {
    const active = applyBillingEvent(
      initialState(),
      "payment_succeeded",
      NOW,
      "2026-09-16T12:00:00Z",
    );
    const canceled = applyBillingEvent(active.next, "subscription_canceled", NOW);

    expect(canceled.next.status).toBe("canceled");
    expect(canceled.next.cancelAtPeriodEnd).toBe(true);
    expect(canceled.listed).toBe(true);
  });

  it("stops listing once that period has passed", () => {
    const active = applyBillingEvent(
      initialState(),
      "payment_succeeded",
      NOW,
      "2026-09-16T12:00:00Z",
    );
    const canceled = applyBillingEvent(active.next, "subscription_canceled", NOW);

    expect(shouldBeListed(canceled.next, new Date("2026-09-15T12:00:00Z"))).toBe(true);
    expect(shouldBeListed(canceled.next, new Date("2026-09-17T12:00:00Z"))).toBe(false);
  });

  it("does not list when there was no paid period at all", () => {
    const canceled = applyBillingEvent(initialState(), "subscription_canceled", NOW);
    expect(canceled.listed).toBe(false);
  });
});

describe("subscription_expired", () => {
  it("unpublishes immediately, regardless of any grace period", () => {
    const failed = applyBillingEvent(initialState(), "payment_failed", NOW);
    const expired = applyBillingEvent(failed.next, "subscription_expired", NOW);

    expect(expired.next.status).toBe("expired");
    expect(expired.next.graceUntil).toBeNull();
    expect(expired.listed).toBe(false);
    expect(shouldBeListed(expired.next, NOW)).toBe(false);
  });
});

describe("shouldBeListed over time", () => {
  it("treats an unparseable period end as expired rather than infinite", () => {
    // A bad date must fail closed. Treating it as "no end" would list forever.
    expect(
      shouldBeListed(
        {
          status: "canceled",
          currentPeriodEnd: "not-a-date",
          graceUntil: null,
          cancelAtPeriodEnd: true,
        },
        NOW,
      ),
    ).toBe(false);
  });

  it("does not list a past_due state with no grace window recorded", () => {
    expect(
      shouldBeListed(
        { status: "past_due", currentPeriodEnd: null, graceUntil: null, cancelAtPeriodEnd: false },
        NOW,
      ),
    ).toBe(false);
  });

  it("lists active and trialing", () => {
    expect(shouldBeListed({ ...initialState(), status: "active" }, NOW)).toBe(true);
    expect(shouldBeListed({ ...initialState(), status: "trialing" }, NOW)).toBe(true);
  });

  it("does not list none or expired", () => {
    expect(shouldBeListed(initialState(), NOW)).toBe(false);
    expect(shouldBeListed({ ...initialState(), status: "expired" }, NOW)).toBe(false);
  });
});

describe("purity", () => {
  it("never mutates the state it is given", () => {
    const state = initialState();
    const snapshot = JSON.stringify(state);
    applyBillingEvent(state, "payment_failed", NOW);
    applyBillingEvent(state, "subscription_expired", NOW);
    expect(JSON.stringify(state)).toBe(snapshot);
  });
});
