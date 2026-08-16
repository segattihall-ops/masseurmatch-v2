import { PAID_PLAN_IDS, PLANS } from "@masseurmatch/billing";
import { describe, expect, it } from "vitest";

import { buildView, type SubscriptionRow } from "@/lib/subscription";

/**
 * What the subscription page shows.
 *
 * `buildView` is the whole of the page's logic, so it is tested directly rather
 * than through the component. The provider calls and database writes around it
 * need credentials and are covered in `packages/billing`.
 */

function row(overrides: Partial<SubscriptionRow> = {}): SubscriptionRow {
  return {
    id: "sub-row-1",
    status: "active",
    provider: "paypal",
    providerSubscriptionId: "I-ABC123",
    currentPeriodEnd: "2026-09-16T00:00:00Z",
    cancelAtPeriodEnd: false,
    ...overrides,
  };
}

describe("with no subscription", () => {
  it("reads as free and inactive", () => {
    const view = buildView(null, null);
    expect(view.planId).toBe("free");
    expect(view.status).toBe("none");
    expect(view.isActive).toBe(false);
    expect(view.hasProviderSubscription).toBe(false);
    expect(view.nextChargeOn).toBeNull();
  });

  it("does not invent a paid tier from an unrecognised value", () => {
    // `profiles.subscription_tier` is free text and holds legacy values.
    expect(buildView("featured", null).planId).toBe("free");
    expect(buildView("PLATINUM", null).planId).toBe("free");
  });
});

describe("status drives what is offered", () => {
  it("treats active, trialing and past_due as entitled", () => {
    for (const status of ["active", "trialing", "past_due"] as const) {
      expect(buildView("pro", row({ status })).isActive).toBe(true);
    }
  });

  it("treats canceled and expired as not entitled", () => {
    for (const status of ["canceled", "expired", "none"] as const) {
      expect(buildView("pro", row({ status })).isActive).toBe(false);
    }
  });

  it("labels every status", () => {
    for (const status of [
      "none",
      "active",
      "trialing",
      "past_due",
      "canceled",
      "expired",
    ] as const) {
      expect(buildView("pro", row({ status })).statusLabel).toBeTruthy();
    }
  });
});

describe("the money and limits come from plans.ts", () => {
  it("uses the plan's own price and photo limit, not the database's", () => {
    // subscription_plans is the FK target, not the price list: only its `code`
    // column is read. Prices now agree ($99); photo limits deliberately do not
    // (it has 20 for elite by coincidence, but 12 for pro against 15 here).
    // This pins that the page renders plans.ts either way.
    const view = buildView("elite", row());
    expect(view.priceCents).toBe(PLANS.elite.priceCents);
    expect(view.photoLimit).toBe(PLANS.elite.photoLimit);
  });

  it("offers only paid plans", () => {
    expect([...PAID_PLAN_IDS]).not.toContain("free");
  });
});

describe("cancellation", () => {
  it("surfaces cancel_at_period_end so the page can say 'access until'", () => {
    const view = buildView("pro", row({ cancelAtPeriodEnd: true }));
    expect(view.cancelAtPeriodEnd).toBe(true);
    // Still entitled: they paid for this period.
    expect(view.isActive).toBe(true);
  });
});

describe("a subscription row with no provider id", () => {
  it("is not treated as something the provider can change", () => {
    // Would otherwise send `null` to updatePlan/cancelSubscription.
    const view = buildView("pro", row({ providerSubscriptionId: null }));
    expect(view.hasProviderSubscription).toBe(false);
  });
});
