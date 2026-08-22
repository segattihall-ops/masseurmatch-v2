import { describe, expect, it } from "vitest";

import { payPalPlanMatchesCatalog, type PayPalPlanDetails } from "../paypal-plan-configuration";

function plan(value: string, overrides: Partial<PayPalPlanDetails> = {}): PayPalPlanDetails {
  return {
    status: "ACTIVE",
    billing_cycles: [
      {
        tenure_type: "REGULAR",
        frequency: { interval_unit: "MONTH", interval_count: 1 },
        pricing_scheme: { fixed_price: { value, currency_code: "USD" } },
      },
    ],
    ...overrides,
  };
}

describe("PayPal plan catalogue guard", () => {
  it("accepts the exact advertised monthly prices", () => {
    expect(payPalPlanMatchesCatalog("standard", plan("39.00"))).toBe(true);
    expect(payPalPlanMatchesCatalog("pro", plan("79.00"))).toBe(true);
    expect(payPalPlanMatchesCatalog("elite", plan("129.00"))).toBe(true);
  });

  it("blocks the historical $99 Elite plan", () => {
    expect(payPalPlanMatchesCatalog("elite", plan("99.00"))).toBe(false);
  });

  it("blocks inactive, non-monthly and non-USD plans", () => {
    expect(payPalPlanMatchesCatalog("standard", plan("39.00", { status: "INACTIVE" }))).toBe(
      false,
    );

    expect(
      payPalPlanMatchesCatalog("standard", {
        status: "ACTIVE",
        billing_cycles: [
          {
            tenure_type: "REGULAR",
            frequency: { interval_unit: "YEAR", interval_count: 1 },
            pricing_scheme: { fixed_price: { value: "39.00", currency_code: "USD" } },
          },
        ],
      }),
    ).toBe(false);

    expect(
      payPalPlanMatchesCatalog("standard", {
        status: "ACTIVE",
        billing_cycles: [
          {
            tenure_type: "REGULAR",
            frequency: { interval_unit: "MONTH", interval_count: 1 },
            pricing_scheme: { fixed_price: { value: "39.00", currency_code: "EUR" } },
          },
        ],
      }),
    ).toBe(false);
  });

  it("never treats free as a purchasable PayPal plan", () => {
    expect(payPalPlanMatchesCatalog("free", plan("0.00"))).toBe(false);
  });
});
