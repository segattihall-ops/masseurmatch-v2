import { PAID_PLAN_IDS, type PlanId, type SubscriptionStatus } from "../plans";
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

/* -------------------------------------------------------------------------- */
/* Subscriptions API                                                          */
/* -------------------------------------------------------------------------- */

function apiBase(): string {
  // Defaults to live, not sandbox. A misconfigured environment should fail to
  // take money rather than quietly take it in a sandbox nobody reconciles.
  return process.env.PAYPAL_API_BASE ?? "https://api-m.paypal.com";
}

function credentials(): { clientId: string; secret: string } {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) {
    throw new Error("PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be set to use PayPal.");
  }
  return { clientId, secret };
}

/**
 * PayPal's own plan id for one of ours.
 *
 * These are created in the PayPal dashboard (or via the Catalog API) and cannot
 * be derived from `PlanId` — PayPal mints opaque ids like `P-5ML4271244454362`.
 * The mapping therefore lives in the environment, one variable per paid tier.
 *
 * `plans.ts` remains the source of truth for what a tier *costs and includes*;
 * this is only the foreign key. If the two disagree on price, PayPal wins for
 * what is actually charged — which is why `.env.example` says to set the price
 * in the PayPal dashboard to match `plans.ts`, and why changing a price means
 * creating a new PayPal plan rather than editing this map.
 */
function payPalPlanId(plan: PlanId): string {
  const key = `PAYPAL_PLAN_${plan.toUpperCase()}`;
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `No PayPal plan configured for "${plan}". Set ${key} to the plan id from the PayPal dashboard.`,
    );
  }
  return value;
}

/** Reverse of `payPalPlanId` — which of our tiers a PayPal plan id refers to. */
function planIdFor(payPalPlan: string | undefined): PlanId {
  if (payPalPlan) {
    for (const plan of PAID_PLAN_IDS) {
      if (process.env[`PAYPAL_PLAN_${plan.toUpperCase()}`] === payPalPlan) return plan;
    }
  }
  return "free";
}

/**
 * PayPal's subscription states, mapped onto ours.
 *
 * `APPROVAL_PENDING` and `APPROVED` are both pre-payment: the payer has been
 * sent to PayPal but no money has moved, so neither entitles a listing. They
 * map to `none` rather than `active` — the deliberately unhelpful direction, so
 * an unapproved subscription cannot publish a profile.
 */
const STATUS_MAP: Record<string, SubscriptionStatus> = {
  APPROVAL_PENDING: "none",
  APPROVED: "none",
  ACTIVE: "active",
  SUSPENDED: "past_due",
  CANCELLED: "canceled",
  EXPIRED: "expired",
};

type PayPalSubscription = {
  id?: string;
  status?: string;
  plan_id?: string;
  billing_info?: { next_billing_time?: string };
  links?: { href?: string; rel?: string }[];
};

/** An OAuth2 access token, cached until shortly before it expires. */
let cachedToken: { value: string; expiresAt: number } | null = null;

async function accessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now) return cachedToken.value;

  const { clientId, secret } = credentials();
  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");

  const response = await fetch(`${apiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`PayPal token request failed (${response.status}).`);
  }

  const body = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!body.access_token) throw new Error("PayPal returned no access token.");

  // Expire a minute early so a token is never used in the second it lapses.
  const ttl = (body.expires_in ?? 300) * 1000;
  cachedToken = { value: body.access_token, expiresAt: now + Math.max(ttl - 60_000, 0) };
  return cachedToken.value;
}

/** Reset the cached token. Tests only. */
export function __resetPayPalToken(): void {
  cachedToken = null;
}

async function callPayPal(
  path: string,
  init: { method: string; body?: unknown; idempotencyKey?: string; notFoundAsNull?: boolean },
): Promise<{ status: number; body: PayPalSubscription }> {
  const token = await accessToken();

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  // PayPal deduplicates retried POSTs by this header. Without it, a network
  // timeout that actually succeeded turns a retry into a second subscription
  // and a second charge.
  if (init.idempotencyKey) headers["PayPal-Request-Id"] = init.idempotencyKey;

  const response = await fetch(`${apiBase()}${path}`, {
    method: init.method,
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });

  // 204 No Content is PayPal's success for cancel/revise-style calls.
  if (response.status === 204) return { status: 204, body: {} };

  const text = await response.text();
  let parsed: PayPalSubscription = {};
  try {
    parsed = text ? (JSON.parse(text) as PayPalSubscription) : {};
  } catch {
    parsed = {};
  }

  // "That subscription does not exist" is an answer, not a failure — but only
  // where the caller said so. Everywhere else a 404 still throws, because a
  // missing subscription during cancel or revise means our records are wrong
  // and silence would hide it.
  if (response.status === 404 && init.notFoundAsNull) return { status: 404, body: {} };

  if (!response.ok) {
    // The body can carry card or payer details, so it is not echoed into the
    // error — only the status and the path that produced it.
    throw new Error(`PayPal ${init.method} ${path} failed (${response.status}).`);
  }

  return { status: response.status, body: parsed };
}

function approvalUrlFrom(subscription: PayPalSubscription): string | null {
  const link = subscription.links?.find((l) => l.rel === "approve");
  return link?.href ?? null;
}

function toRef(subscription: PayPalSubscription, fallbackPlan: PlanId): SubscriptionRef {
  return {
    id: subscription.id ?? "",
    planId: subscription.plan_id ? planIdFor(subscription.plan_id) : fallbackPlan,
    status: STATUS_MAP[subscription.status ?? ""] ?? "none",
    nextChargeOn: subscription.billing_info?.next_billing_time ?? null,
    approvalUrl: approvalUrlFrom(subscription),
  };
}

export const payPalProvider: PaymentProvider = {
  id: "paypal",

  /**
   * Create a subscription in `APPROVAL_PENDING` and return where to send the
   * payer.
   *
   * Nothing is charged here. The subscription only becomes `ACTIVE` once the
   * payer approves at PayPal, which arrives back as
   * `BILLING.SUBSCRIPTION.ACTIVATED` on the webhook. That is why this returns
   * `status: "none"` rather than optimistically marking the therapist paid —
   * the webhook is the only thing that may do that.
   *
   * `custom_id` carries our therapist id so a subscription can be traced back
   * to a profile from the PayPal dashboard, which is where support questions
   * start.
   */
  async createSubscription(therapistId: string, plan: PlanId): Promise<SubscriptionRef> {
    const returnUrl = process.env.PAYPAL_RETURN_URL;
    const cancelUrl = process.env.PAYPAL_CANCEL_URL;

    const { body } = await callPayPal("/v1/billing/subscriptions", {
      method: "POST",
      // Scoped to the therapist and the plan, so a retry of *this* request
      // deduplicates while a genuine second purchase does not.
      idempotencyKey: `sub-${therapistId}-${plan}`,
      body: {
        plan_id: payPalPlanId(plan),
        custom_id: therapistId,
        application_context: {
          brand_name: "MasseurMatch",
          user_action: "SUBSCRIBE_NOW",
          shipping_preference: "NO_SHIPPING",
          ...(returnUrl ? { return_url: returnUrl } : {}),
          ...(cancelUrl ? { cancel_url: cancelUrl } : {}),
        },
      },
    });

    const ref = toRef(body, plan);
    if (!ref.id) throw new Error("PayPal created no subscription id.");
    if (!ref.approvalUrl) {
      throw new Error("PayPal returned no approval link — the payer cannot complete the purchase.");
    }
    return ref;
  },

  /**
   * Cancel at PayPal.
   *
   * Returns without touching our own records: `BILLING.SUBSCRIPTION.CANCELLED`
   * arrives on the webhook and that is what updates the profile. Writing the
   * status here as well would mean two paths can set it, and they would
   * eventually disagree.
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    await callPayPal(`/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`, {
      method: "POST",
      body: { reason: "Cancelled by the therapist from the MasseurMatch dashboard." },
    });
  },

  /**
   * Change tier on an existing subscription.
   *
   * PayPal prorates and may require re-approval for an upgrade, in which case
   * the response carries a fresh `approve` link — so the caller must check
   * `approvalUrl` here too, not only on creation.
   */
  async updatePlan(subscriptionId: string, newPlan: PlanId): Promise<SubscriptionRef> {
    const id = encodeURIComponent(subscriptionId);
    const { body } = await callPayPal(`/v1/billing/subscriptions/${id}/revise`, {
      method: "POST",
      body: { plan_id: payPalPlanId(newPlan) },
    });

    // `revise` returns the revision, not the full subscription — re-read so the
    // status and next charge date are the subscription's own, not inferred.
    const { body: current } = await callPayPal(`/v1/billing/subscriptions/${id}`, {
      method: "GET",
    });

    return {
      ...toRef(current, newPlan),
      id: subscriptionId,
      approvalUrl: approvalUrlFrom(body) ?? approvalUrlFrom(current),
    };
  },

  /**
   * Read a subscription straight from PayPal.
   *
   * The plan comes back as PayPal's own plan id, which `planIdFor` maps through
   * the `PAYPAL_PLAN_*` variables. An unmapped plan resolves to `free` rather
   * than guessing at a tier, so a reconcile can never promote someone onto a
   * plan this deployment does not recognise.
   */
  async fetchSubscription(subscriptionId: string): Promise<SubscriptionRef | null> {
    const { status, body } = await callPayPal(
      `/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}`,
      { method: "GET", notFoundAsNull: true },
    );

    if (status === 404 || !body.id) return null;
    return { ...toRef(body, "free"), id: subscriptionId };
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
