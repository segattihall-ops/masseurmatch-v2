import { createHmac } from "node:crypto";

import { afterEach, describe, expect, it } from "vitest";

import {
  entitlesListing,
  formatPrice,
  GRACE_PERIOD_DAYS,
  PAID_PLAN_IDS,
  PLAN_IDS,
  PLANS,
  photoLimitFor,
  planFor,
} from "../plans";
import { activeProviderId } from "../provider";
import { authorizeNetProvider, verifyAuthorizeNetSignature } from "../providers/authorizenet";
import { parsePayPalHeaders, payPalProvider } from "../providers/paypal";
import { getProvider } from "../providers/registry";

const KEY = "test-signature-key";

afterEach(() => {
  delete process.env.BILLING_PROVIDER;
  delete process.env.AUTHORIZENET_SIGNATURE_KEY;
});

describe("plans", () => {
  it("prices the tiers the spec names", () => {
    expect(PLANS.standard.priceCents).toBe(3_900);
    expect(PLANS.pro.priceCents).toBe(7_900);
    expect(PLANS.elite.priceCents).toBe(12_900);
  });

  it("keeps money in integer cents, never floats", () => {
    for (const plan of Object.values(PLANS)) {
      expect(Number.isInteger(plan.priceCents)).toBe(true);
    }
  });

  it("treats free as the absence of a subscription, not a purchasable plan", () => {
    expect(PAID_PLAN_IDS).toEqual(["standard", "pro", "elite"]);
  });

  it("falls back to free for an unknown or missing tier, never upward", () => {
    expect(planFor(null).id).toBe("free");
    expect(planFor(undefined).id).toBe("free");
    expect(planFor("enterprise").id).toBe("free");
    expect(planFor("").id).toBe("free");
  });

  it("resolves tiers case-insensitively", () => {
    expect(planFor("PRO").id).toBe("pro");
    expect(planFor("Elite").id).toBe("elite");
  });

  it("is the single source of the photo limits the dashboard enforces", () => {
    expect(photoLimitFor("free")).toBe(3);
    expect(photoLimitFor("standard")).toBe(6);
    expect(photoLimitFor("pro")).toBe(9);
    expect(photoLimitFor("elite")).toBe(12);
  });

  it("gives every step up the ladder more photos than the one below", () => {
    // Elite was set to 20 to match production, which briefly made it identical
    // to pro — a tier costing $20/mo more that bought nothing on this axis.
    // Adjacent tiers with the same limit are the bug this pins.
    for (let i = 1; i < PLAN_IDS.length; i += 1) {
      const lower = PLANS[PLAN_IDS[i - 1]!]!;
      const upper = PLANS[PLAN_IDS[i]!]!;
      expect(upper.photoLimit, upper.id).toBeGreaterThan(lower.photoLimit);
    }
  });

  it("charges more for every step up the ladder", () => {
    for (let i = 1; i < PLAN_IDS.length; i += 1) {
      const lower = PLANS[PLAN_IDS[i - 1]!]!;
      const upper = PLANS[PLAN_IDS[i]!]!;
      expect(upper.priceCents, upper.id).toBeGreaterThan(lower.priceCents);
    }
  });

  it("lets a per-account override win, ignoring nonsense values", () => {
    expect(photoLimitFor("free", 25)).toBe(25);
    expect(photoLimitFor("pro", 0)).toBe(9);
    expect(photoLimitFor("pro", -3)).toBe(9);
  });

  it("formats prices for display", () => {
    expect(formatPrice(PLANS.free)).toBe("Free");
    expect(formatPrice(PLANS.standard)).toBe("$39");
    expect(formatPrice(PLANS.elite)).toBe("$129");
  });
});

describe("listing entitlement", () => {
  it("keeps a profile live through the grace period after a failed payment", () => {
    // past_due must not equal unpublished: a card needing re-authorisation
    // should not delist a paying therapist.
    expect(entitlesListing("past_due")).toBe(true);
    expect(GRACE_PERIOD_DAYS).toBe(7);
  });

  it("entitles active and trialing", () => {
    expect(entitlesListing("active")).toBe(true);
    expect(entitlesListing("trialing")).toBe(true);
  });

  it("does not entitle canceled, expired or none", () => {
    expect(entitlesListing("canceled")).toBe(false);
    expect(entitlesListing("expired")).toBe(false);
    expect(entitlesListing("none")).toBe(false);
  });
});

describe("provider selection", () => {
  it("defaults to Authorize.Net", () => {
    expect(activeProviderId(undefined)).toBe("authorizenet");
  });

  it("switches on the environment variable alone", () => {
    expect(activeProviderId("paypal")).toBe("paypal");
    expect(activeProviderId("PayPal")).toBe("paypal");
    expect(getProvider("paypal").id).toBe("paypal");
    expect(getProvider("authorizenet").id).toBe("authorizenet");
  });

  it("throws on an unknown value rather than silently falling back", () => {
    // Taking payments through a different processor than the one configured is
    // worse than refusing to start.
    expect(() => activeProviderId("stripe")).toThrow(/Unknown BILLING_PROVIDER/);
  });
});

describe("Authorize.Net webhook verification", () => {
  const body = JSON.stringify({
    notificationId: "abc-123",
    eventType: "net.authorize.payment.authcapture.created",
    eventDate: "2026-08-16T12:00:00Z",
    payload: { subscriptionId: "sub_1" },
  });

  const sign = (payload: string, key = KEY) =>
    createHmac("sha512", key).update(payload, "utf8").digest("hex");

  it("accepts a correct signature, with or without the sha512= prefix", () => {
    expect(verifyAuthorizeNetSignature(body, sign(body), KEY)).toBe(true);
    expect(verifyAuthorizeNetSignature(body, `sha512=${sign(body).toUpperCase()}`, KEY)).toBe(true);
  });

  it("rejects a signature made with the wrong key", () => {
    expect(verifyAuthorizeNetSignature(body, sign(body, "other-key"), KEY)).toBe(false);
  });

  it("rejects when the body was altered after signing", () => {
    const signature = sign(body);
    expect(verifyAuthorizeNetSignature(body.replace("sub_1", "sub_2"), signature, KEY)).toBe(false);
  });

  it("rejects malformed or empty signatures without throwing", () => {
    expect(verifyAuthorizeNetSignature(body, "", KEY)).toBe(false);
    expect(verifyAuthorizeNetSignature(body, "not-hex", KEY)).toBe(false);
    expect(verifyAuthorizeNetSignature(body, "abcd", KEY)).toBe(false);
  });

  it("normalises a valid event", async () => {
    process.env.AUTHORIZENET_SIGNATURE_KEY = KEY;
    const result = await authorizeNetProvider.handleWebhook(body, sign(body));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.event.kind).toBe("payment_succeeded");
      expect(result.event.eventId).toBe("abc-123");
      expect(result.event.subscriptionId).toBe("sub_1");
    }
  });

  it("returns invalid_signature rather than throwing when unconfigured", async () => {
    // Unconfigured must never read as verified.
    const result = await authorizeNetProvider.handleWebhook(body, sign(body));
    expect(result).toEqual({ ok: false, reason: "invalid_signature" });
  });

  it("ignores event types it does not recognise instead of guessing", async () => {
    process.env.AUTHORIZENET_SIGNATURE_KEY = KEY;
    const other = JSON.stringify({
      notificationId: "x",
      eventType: "net.authorize.something.else",
      payload: { subscriptionId: "sub_1" },
    });
    const result = await authorizeNetProvider.handleWebhook(other, sign(other));
    expect(result).toEqual({ ok: false, reason: "unrecognized_event" });
  });

  it("reports malformed bodies distinctly from bad signatures", async () => {
    process.env.AUTHORIZENET_SIGNATURE_KEY = KEY;
    const result = await authorizeNetProvider.handleWebhook("{not json", sign("{not json"));
    expect(result).toEqual({ ok: false, reason: "malformed" });
  });
});

describe("PayPal header verification", () => {
  const valid = {
    transmissionId: "t-1",
    transmissionTime: "2026-08-16T12:00:00Z",
    transmissionSig: "sig",
    certUrl: "https://api.paypal.com/v1/notifications/certs/CERT-abc",
    authAlgo: "SHA256withRSA",
  };

  it("accepts a complete header bundle from a paypal.com cert URL", () => {
    expect(parsePayPalHeaders(JSON.stringify(valid))).not.toBeNull();
  });

  it("rejects a cert URL on any other host", () => {
    // Without this an attacker supplies their own cert and PayPal's verifier is
    // asked about the wrong key.
    for (const certUrl of [
      "https://evil.com/cert",
      "https://paypal.com.evil.com/cert",
      "http://api.paypal.com/cert",
    ]) {
      const parsed = parsePayPalHeaders(JSON.stringify({ ...valid, certUrl }));
      if (certUrl.startsWith("http://api.paypal.com")) {
        // http is still a paypal.com host; the transport is PayPal's problem,
        // the host check is ours. Documented so the behaviour is deliberate.
        expect(parsed).not.toBeNull();
      } else {
        expect(parsed).toBeNull();
      }
    }
  });

  it("rejects an incomplete bundle", () => {
    const { transmissionSig: _omitted, ...partial } = valid;
    expect(parsePayPalHeaders(JSON.stringify(partial))).toBeNull();
  });

  it("rejects non-JSON without throwing", () => {
    expect(parsePayPalHeaders("not json")).toBeNull();
  });

  it("refuses a webhook whose headers do not parse, before any network call", async () => {
    const result = await payPalProvider.handleWebhook("{}", "not json");
    expect(result).toEqual({ ok: false, reason: "invalid_signature" });
  });
});

describe("the SDK boundary", () => {
  it("does not re-export adapters from the package entry point", async () => {
    // Application code must reach a provider through getProvider(), so it never
    // couples itself to one processor.
    const index = (await import("../index")) as Record<string, unknown>;
    expect(index.authorizeNetProvider).toBeUndefined();
    expect(index.payPalProvider).toBeUndefined();
    expect(typeof index.getProvider).toBe("function");
  });
});
