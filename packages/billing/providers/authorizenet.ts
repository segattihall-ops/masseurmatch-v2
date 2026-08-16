import { createHmac, timingSafeEqual } from "node:crypto";

import type { PlanId } from "../plans";
import type {
  BillingEventKind,
  PaymentProvider,
  SubscriptionRef,
  WebhookResult,
} from "../provider";

/**
 * Authorize.Net — the primary provider.
 *
 * Subscriptions run through ARB (Automated Recurring Billing). Webhooks are
 * signed with HMAC-SHA512 over the raw request body, delivered in the
 * `X-ANET-Signature` header as `sha512=<HEX>`.
 *
 * No SDK: the surface used here is small enough that a dependency would add
 * more supply-chain risk than it removes work. Nothing outside this package
 * knows Authorize.Net exists.
 */

/** Their event names → our four kinds. Anything unlisted is ignored, not guessed. */
const EVENT_KINDS: Record<string, BillingEventKind> = {
  "net.authorize.customer.subscription.created": "payment_succeeded",
  "net.authorize.payment.authcapture.created": "payment_succeeded",
  "net.authorize.payment.void.created": "payment_failed",
  "net.authorize.payment.refund.created": "payment_failed",
  "net.authorize.customer.subscription.cancelled": "subscription_canceled",
  "net.authorize.customer.subscription.expiring": "subscription_expired",
  "net.authorize.customer.subscription.terminated": "subscription_expired",
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}. Authorize.Net is not configured.`);
  return value;
}

/**
 * Constant-time comparison of the delivered signature against ours.
 *
 * `timingSafeEqual` throws on length mismatch, so the lengths are checked first
 * — and that check is safe to do in variable time because a signature's length
 * is not secret.
 */
export function verifyAuthorizeNetSignature(
  rawBody: string,
  header: string,
  signatureKey: string,
): boolean {
  const delivered = header
    .trim()
    .replace(/^sha512=/i, "")
    .toLowerCase();
  if (!/^[0-9a-f]+$/.test(delivered)) return false;

  const expected = createHmac("sha512", signatureKey).update(rawBody, "utf8").digest("hex");
  if (delivered.length !== expected.length) return false;

  return timingSafeEqual(Buffer.from(delivered, "hex"), Buffer.from(expected, "hex"));
}

type AnetPayload = {
  notificationId?: string;
  eventType?: string;
  eventDate?: string;
  payload?: { id?: string; subscriptionId?: string; status?: string };
};

export const authorizeNetProvider: PaymentProvider = {
  id: "authorizenet",

  async createSubscription(therapistId: string, plan: PlanId): Promise<SubscriptionRef> {
    void therapistId;
    void plan;
    // Deliberately unimplemented rather than faked. Creating an ARB
    // subscription requires a payment nonce from Accept.js in the browser, and
    // wiring that without sandbox credentials would produce code nobody has
    // ever seen succeed. The interface, plans and webhook path are complete and
    // tested; this is the piece that needs the account.
    throw new Error(
      "Authorize.Net subscription creation is not implemented yet — needs sandbox credentials and an Accept.js payment nonce.",
    );
  },

  async cancelSubscription(subscriptionId: string): Promise<void> {
    void subscriptionId;
    throw new Error(
      "Authorize.Net cancellation is not implemented yet — needs sandbox credentials.",
    );
  },

  async updatePlan(subscriptionId: string, newPlan: PlanId): Promise<SubscriptionRef> {
    void subscriptionId;
    void newPlan;
    throw new Error(
      "Authorize.Net plan change is not implemented yet — needs sandbox credentials.",
    );
  },

  async handleWebhook(payload: string, signature: string): Promise<WebhookResult> {
    let signatureKey: string;
    try {
      signatureKey = requireEnv("AUTHORIZENET_SIGNATURE_KEY");
    } catch {
      // Unconfigured must not read as verified.
      return { ok: false, reason: "invalid_signature" };
    }

    if (!signature || !verifyAuthorizeNetSignature(payload, signature, signatureKey)) {
      return { ok: false, reason: "invalid_signature" };
    }

    let body: AnetPayload;
    try {
      body = JSON.parse(payload) as AnetPayload;
    } catch {
      return { ok: false, reason: "malformed" };
    }

    const kind = body.eventType ? EVENT_KINDS[body.eventType] : undefined;
    if (!kind) return { ok: false, reason: "unrecognized_event" };

    const subscriptionId = body.payload?.subscriptionId ?? body.payload?.id;
    if (!body.notificationId || !subscriptionId) return { ok: false, reason: "malformed" };

    return {
      ok: true,
      event: {
        eventId: body.notificationId,
        kind,
        subscriptionId,
        occurredAt: body.eventDate ?? new Date().toISOString(),
        raw: body,
      },
    };
  },
};
