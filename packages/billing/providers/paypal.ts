import type { PlanId } from "../plans";
import type {
  BillingEventKind,
  PaymentProvider,
  SubscriptionRef,
  WebhookResult,
} from "../provider";

/**
 * PayPal — the secondary provider.
 *
 * Subscriptions run through the Subscriptions API. Webhook verification is
 * **not** an HMAC: PayPal signs with a certificate and the only supported check
 * is a call to `/v1/notifications/verify-webhook-signature`, which needs the
 * transmission id, time, cert URL, auth algorithm and webhook id — five values
 * spread across request headers.
 *
 * That does not fit the `(payload, signature)` shape of the interface, and
 * rather than widen the interface for one provider, the `signature` argument
 * carries the headers as a JSON object. The alternative — verifying locally
 * against the certificate — is possible but is the kind of cryptography that
 * should not be hand-rolled when the vendor offers an endpoint.
 */

const EVENT_KINDS: Record<string, BillingEventKind> = {
  "PAYMENT.SALE.COMPLETED": "payment_succeeded",
  "BILLING.SUBSCRIPTION.ACTIVATED": "payment_succeeded",
  "PAYMENT.SALE.DENIED": "payment_failed",
  "BILLING.SUBSCRIPTION.PAYMENT.FAILED": "payment_failed",
  "BILLING.SUBSCRIPTION.CANCELLED": "subscription_canceled",
  "BILLING.SUBSCRIPTION.EXPIRED": "subscription_expired",
  "BILLING.SUBSCRIPTION.SUSPENDED": "subscription_expired",
};

export type PayPalVerificationHeaders = {
  transmissionId: string;
  transmissionTime: string;
  transmissionSig: string;
  certUrl: string;
  authAlgo: string;
};

/** Parse the header bundle the route handler packs into `signature`. */
export function parsePayPalHeaders(raw: string): PayPalVerificationHeaders | null {
  try {
    const parsed = JSON.parse(raw) as Partial<PayPalVerificationHeaders>;
    if (
      !parsed.transmissionId ||
      !parsed.transmissionTime ||
      !parsed.transmissionSig ||
      !parsed.certUrl ||
      !parsed.authAlgo
    ) {
      return null;
    }
    // The cert must come from PayPal. Without this check, an attacker supplies
    // their own cert URL and PayPal's verifier is asked about the wrong key.
    const host = new URL(parsed.certUrl).hostname;
    if (!/(^|\.)paypal\.com$/i.test(host)) return null;

    return parsed as PayPalVerificationHeaders;
  } catch {
    return null;
  }
}

type PayPalPayload = {
  id?: string;
  event_type?: string;
  create_time?: string;
  resource?: { id?: string; billing_agreement_id?: string };
};

export const payPalProvider: PaymentProvider = {
  id: "paypal",

  async createSubscription(therapistId: string, plan: PlanId): Promise<SubscriptionRef> {
    void therapistId;
    void plan;
    throw new Error(
      "PayPal subscription creation is not implemented yet — needs sandbox credentials and a plan id from the PayPal dashboard.",
    );
  },

  async cancelSubscription(subscriptionId: string): Promise<void> {
    void subscriptionId;
    throw new Error("PayPal cancellation is not implemented yet — needs sandbox credentials.");
  },

  async updatePlan(subscriptionId: string, newPlan: PlanId): Promise<SubscriptionRef> {
    void subscriptionId;
    void newPlan;
    throw new Error("PayPal plan change is not implemented yet — needs sandbox credentials.");
  },

  async handleWebhook(payload: string, signature: string): Promise<WebhookResult> {
    const headers = parsePayPalHeaders(signature);
    if (!headers) return { ok: false, reason: "invalid_signature" };

    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const secret = process.env.PAYPAL_CLIENT_SECRET;
    const base = process.env.PAYPAL_API_BASE ?? "https://api-m.paypal.com";
    if (!webhookId || !clientId || !secret) {
      return { ok: false, reason: "invalid_signature" };
    }

    let body: PayPalPayload;
    try {
      body = JSON.parse(payload) as PayPalPayload;
    } catch {
      return { ok: false, reason: "malformed" };
    }

    // Verify before doing anything with the contents.
    let verified = false;
    try {
      const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");
      const response = await fetch(`${base}/v1/notifications/verify-webhook-signature`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` },
        body: JSON.stringify({
          auth_algo: headers.authAlgo,
          cert_url: headers.certUrl,
          transmission_id: headers.transmissionId,
          transmission_sig: headers.transmissionSig,
          transmission_time: headers.transmissionTime,
          webhook_id: webhookId,
          webhook_event: body,
        }),
        cache: "no-store",
      });
      if (response.ok) {
        const result = (await response.json()) as { verification_status?: string };
        verified = result.verification_status === "SUCCESS";
      }
    } catch {
      verified = false;
    }

    if (!verified) return { ok: false, reason: "invalid_signature" };

    const kind = body.event_type ? EVENT_KINDS[body.event_type] : undefined;
    if (!kind) return { ok: false, reason: "unrecognized_event" };

    const subscriptionId = body.resource?.billing_agreement_id ?? body.resource?.id;
    if (!body.id || !subscriptionId) return { ok: false, reason: "malformed" };

    return {
      ok: true,
      event: {
        eventId: body.id,
        kind,
        subscriptionId,
        occurredAt: body.create_time ?? new Date().toISOString(),
        raw: body,
      },
    };
  },
};
