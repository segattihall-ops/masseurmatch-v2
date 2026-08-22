import { PLANS, type PlanId } from "./plans";

export type PayPalPlanDetails = {
  id?: string;
  status?: string;
  billing_cycles?: Array<{
    tenure_type?: string;
    frequency?: {
      interval_unit?: string;
      interval_count?: number;
    };
    pricing_scheme?: {
      fixed_price?: {
        value?: string;
        currency_code?: string;
      };
    };
  }>;
};

function moneyToCents(value: unknown): number | null {
  if (typeof value !== "string" || !/^\d+(?:\.\d{1,2})?$/.test(value)) return null;

  const [whole = "0", fractional = ""] = value.split(".");
  const cents = Number(whole) * 100 + Number(`${fractional}00`.slice(0, 2));
  return Number.isSafeInteger(cents) ? cents : null;
}

/**
 * Check that a PayPal plan is safe to sell as one of the MasseurMatch plans.
 *
 * The local catalogue controls the price we advertise. PayPal controls what is
 * actually charged. A deployment is allowed to create/revise a subscription
 * only when both agree on an ACTIVE, monthly USD regular billing cycle.
 */
export function payPalPlanMatchesCatalog(plan: PlanId, details: PayPalPlanDetails): boolean {
  const expected = PLANS[plan];
  if (expected.priceCents <= 0 || details.status !== "ACTIVE") return false;

  const regular = details.billing_cycles?.find((cycle) => cycle.tenure_type === "REGULAR");
  if (!regular) return false;

  const frequency = regular.frequency;
  if (frequency?.interval_unit !== "MONTH" || frequency.interval_count !== 1) return false;

  const fixedPrice = regular.pricing_scheme?.fixed_price;
  if (fixedPrice?.currency_code !== "USD") return false;

  return moneyToCents(fixedPrice.value) === expected.priceCents;
}

function apiBase(): string {
  return process.env.PAYPAL_API_BASE ?? "https://api-m.paypal.com";
}

function configuredPlanId(plan: PlanId): string {
  const key = `PAYPAL_PLAN_${plan.toUpperCase()}`;
  const value = process.env[key];
  if (!value) throw new Error(`Missing ${key}.`);
  return value;
}

async function accessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) throw new Error("PayPal credentials are not configured.");

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

  if (!response.ok) throw new Error(`PayPal token request failed (${response.status}).`);

  const body = (await response.json()) as { access_token?: string };
  if (!body.access_token) throw new Error("PayPal returned no access token.");
  return body.access_token;
}

/**
 * Fail closed before money can move when the configured PayPal plan differs
 * from the catalogue shown to the therapist.
 */
export async function assertPayPalPlanMatchesCatalog(plan: PlanId): Promise<void> {
  const providerPlanId = configuredPlanId(plan);
  const token = await accessToken();
  const response = await fetch(
    `${apiBase()}/v1/billing/plans/${encodeURIComponent(providerPlanId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`PayPal plan lookup failed (${response.status}).`);
  }

  const details = (await response.json()) as PayPalPlanDetails;
  if (!payPalPlanMatchesCatalog(plan, details)) {
    throw new Error(
      `Configured PayPal plan for ${plan} does not match the MasseurMatch catalogue price/frequency.`,
    );
  }
}
