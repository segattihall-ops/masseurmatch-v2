import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { __resetPayPalToken, payPalProvider } from "../providers/paypal";

/**
 * The PayPal Subscriptions API paths.
 *
 * These stub `fetch`, so they prove the *shape* of what we send and how we read
 * the reply — not that PayPal accepts it. Nothing here has been run against a
 * real PayPal account; the sandbox round trip is still outstanding and is
 * called out in the phase 7 notes rather than implied by a green suite.
 *
 * What they do pin is the part that is ours to get wrong: that an unapproved
 * subscription is never reported as paid, that retries carry an idempotency
 * key, and that a token is not re-fetched on every call.
 */

type Call = { url: string; init: RequestInit };

let calls: Call[] = [];

function stubFetch(responder: (url: string, init: RequestInit) => unknown) {
  vi.stubGlobal("fetch", async (url: string, init: RequestInit = {}) => {
    calls.push({ url, init });
    const result = responder(url, init);
    return {
      ok: true,
      status: 200,
      json: async () => result,
      text: async () => JSON.stringify(result),
    };
  });
}

const TOKEN = { access_token: "tok_123", expires_in: 3600 };

const SUBSCRIPTION = {
  id: "I-ABC123",
  status: "APPROVAL_PENDING",
  plan_id: "P-PRO-LIVE",
  links: [
    { rel: "self", href: "https://api-m.paypal.com/v1/billing/subscriptions/I-ABC123" },
    { rel: "approve", href: "https://www.paypal.com/webapps/billing/subscriptions?ba_token=BA-9" },
  ],
};

beforeEach(() => {
  calls = [];
  __resetPayPalToken();
  process.env.PAYPAL_CLIENT_ID = "client";
  process.env.PAYPAL_CLIENT_SECRET = "secret";
  process.env.PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com";
  process.env.PAYPAL_PLAN_PRO = "P-PRO-LIVE";
  process.env.PAYPAL_PLAN_STANDARD = "P-STD-LIVE";
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.PAYPAL_PLAN_PRO;
  delete process.env.PAYPAL_PLAN_STANDARD;
  delete process.env.PAYPAL_API_BASE;
});

describe("createSubscription", () => {
  it("returns the approval link and does NOT report the therapist as paid", async () => {
    stubFetch((url) => (url.includes("/oauth2/token") ? TOKEN : SUBSCRIPTION));

    const ref = await payPalProvider.createSubscription("therapist-1", "pro");

    expect(ref.id).toBe("I-ABC123");
    expect(ref.approvalUrl).toContain("paypal.com");
    // The whole point: PayPal has charged nothing yet. Only the
    // BILLING.SUBSCRIPTION.ACTIVATED webhook may mark this active.
    expect(ref.status).toBe("none");
  });

  it("maps the PayPal plan id back to our tier", async () => {
    stubFetch((url) => (url.includes("/oauth2/token") ? TOKEN : SUBSCRIPTION));
    const ref = await payPalProvider.createSubscription("therapist-1", "pro");
    expect(ref.planId).toBe("pro");
  });

  it("sends an idempotency key, so a retried POST cannot double-charge", async () => {
    stubFetch((url) => (url.includes("/oauth2/token") ? TOKEN : SUBSCRIPTION));
    await payPalProvider.createSubscription("therapist-1", "pro");

    const create = calls.find((c) => c.url.endsWith("/v1/billing/subscriptions"));
    const headers = create?.init.headers as Record<string, string>;
    expect(headers["PayPal-Request-Id"]).toBe("sub-therapist-1-pro");
  });

  it("carries the therapist id as custom_id", async () => {
    stubFetch((url) => (url.includes("/oauth2/token") ? TOKEN : SUBSCRIPTION));
    await payPalProvider.createSubscription("therapist-1", "pro");

    const create = calls.find((c) => c.url.endsWith("/v1/billing/subscriptions"));
    expect(JSON.parse(String(create?.init.body))).toMatchObject({
      plan_id: "P-PRO-LIVE",
      custom_id: "therapist-1",
    });
  });

  it("refuses a plan with no PayPal id configured", async () => {
    stubFetch(() => TOKEN);
    await expect(payPalProvider.createSubscription("therapist-1", "elite")).rejects.toThrow(
      /PAYPAL_PLAN_ELITE/,
    );
  });

  it("fails loudly when PayPal returns no approval link", async () => {
    stubFetch((url) => (url.includes("/oauth2/token") ? TOKEN : { ...SUBSCRIPTION, links: [] }));
    await expect(payPalProvider.createSubscription("therapist-1", "pro")).rejects.toThrow(
      /approval link/,
    );
  });

  it("refuses to run without credentials", async () => {
    delete process.env.PAYPAL_CLIENT_ID;
    stubFetch(() => TOKEN);
    await expect(payPalProvider.createSubscription("therapist-1", "pro")).rejects.toThrow(
      /PAYPAL_CLIENT_ID/,
    );
  });
});

describe("status mapping", () => {
  const cases = [
    ["APPROVAL_PENDING", "none"],
    ["APPROVED", "none"],
    ["ACTIVE", "active"],
    ["SUSPENDED", "past_due"],
    ["CANCELLED", "canceled"],
    ["EXPIRED", "expired"],
  ] as const;

  for (const [payPalStatus, expected] of cases) {
    it(`maps ${payPalStatus} to ${expected}`, async () => {
      stubFetch((url) =>
        url.includes("/oauth2/token") ? TOKEN : { ...SUBSCRIPTION, status: payPalStatus },
      );
      const ref = await payPalProvider.createSubscription("therapist-1", "pro");
      expect(ref.status).toBe(expected);
    });
  }

  it("treats an unknown status as unpaid, never as active", async () => {
    stubFetch((url) =>
      url.includes("/oauth2/token") ? TOKEN : { ...SUBSCRIPTION, status: "SOMETHING_NEW" },
    );
    const ref = await payPalProvider.createSubscription("therapist-1", "pro");
    expect(ref.status).toBe("none");
  });
});

describe("cancelSubscription", () => {
  it("posts to the cancel endpoint with a reason", async () => {
    stubFetch((url) => (url.includes("/oauth2/token") ? TOKEN : {}));
    await payPalProvider.cancelSubscription("I-ABC123");

    const cancel = calls.find((c) => c.url.includes("/cancel"));
    expect(cancel?.url).toContain("/v1/billing/subscriptions/I-ABC123/cancel");
    expect(JSON.parse(String(cancel?.init.body))).toHaveProperty("reason");
  });

  it("escapes the subscription id into the path", async () => {
    stubFetch((url) => (url.includes("/oauth2/token") ? TOKEN : {}));
    await payPalProvider.cancelSubscription("I-A/../B");

    const cancel = calls.find((c) => c.url.includes("/cancel"));
    expect(cancel?.url).not.toContain("/../");
  });
});

describe("updatePlan", () => {
  it("revises, then re-reads the subscription for its real status", async () => {
    stubFetch((url) => {
      if (url.includes("/oauth2/token")) return TOKEN;
      if (url.includes("/revise")) return { links: [] };
      return { ...SUBSCRIPTION, status: "ACTIVE", plan_id: "P-STD-LIVE" };
    });

    const ref = await payPalProvider.updatePlan("I-ABC123", "standard");

    expect(calls.some((c) => c.url.includes("/revise"))).toBe(true);
    expect(ref.status).toBe("active");
    expect(ref.planId).toBe("standard");
    expect(ref.id).toBe("I-ABC123");
  });

  it("surfaces a re-approval link when PayPal requires one", async () => {
    stubFetch((url) => {
      if (url.includes("/oauth2/token")) return TOKEN;
      if (url.includes("/revise")) {
        return { links: [{ rel: "approve", href: "https://www.paypal.com/reapprove" }] };
      }
      return { ...SUBSCRIPTION, status: "ACTIVE" };
    });

    const ref = await payPalProvider.updatePlan("I-ABC123", "standard");
    expect(ref.approvalUrl).toBe("https://www.paypal.com/reapprove");
  });
});

describe("the access token", () => {
  it("is fetched once and reused across calls", async () => {
    stubFetch((url) => (url.includes("/oauth2/token") ? TOKEN : SUBSCRIPTION));

    await payPalProvider.createSubscription("therapist-1", "pro");
    await payPalProvider.createSubscription("therapist-2", "pro");

    expect(calls.filter((c) => c.url.includes("/oauth2/token"))).toHaveLength(1);
  });
});
