import { activeProviderId } from "@masseurmatch/billing";
import { assertPayPalPlanMatchesCatalog } from "@masseurmatch/billing/paypal-plan-configuration";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PAID_PLANS = ["standard", "pro", "elite"] as const;

/**
 * Operational billing health without exposing account ids, plan ids or secrets.
 *
 * A 200 means the configured live PayPal account can authenticate and all three
 * advertised paid plans are ACTIVE monthly USD plans at exactly $39/$79/$129.
 * Anything else is a 503, so deployment monitors can fail closed before a
 * therapist reaches checkout.
 */
export async function GET(): Promise<Response> {
  if (activeProviderId() !== "paypal") {
    return Response.json({ ok: false, billing: "unavailable" }, { status: 503 });
  }

  try {
    await Promise.all(PAID_PLANS.map((plan) => assertPayPalPlanMatchesCatalog(plan)));
    return Response.json(
      { ok: true, billing: "ready" },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    console.error("Billing health check failed", error);
    return Response.json(
      { ok: false, billing: "unavailable" },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
