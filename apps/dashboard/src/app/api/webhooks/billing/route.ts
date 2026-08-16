import {
  activeProviderId,
  applyBillingEvent,
  getProvider,
  initialState,
  type SubscriptionState,
} from "@masseurmatch/billing";
import { createServiceClient } from "@masseurmatch/db/client";
import { PAUSED, PUBLIC } from "@masseurmatch/db/visibility";
import { NextResponse, type NextRequest } from "next/server";

import { alreadyProcessed, annotateEvent, claimEvent } from "@/lib/billing-events";
import { clientAddress, LIMITS, rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/webhooks/billing
 *
 * One endpoint for whichever provider `BILLING_PROVIDER` selects. Nothing here
 * knows what Authorize.Net or PayPal is — the adapter verifies and normalises;
 * this handles idempotency and persistence.
 *
 * Runs as `service_role`. There is no user session — the caller is a payment
 * processor — so RLS cannot be the authorisation boundary. The signature is,
 * which is why verification happens before anything touches the database.
 */

export const runtime = "nodejs"; // node:crypto for HMAC verification
export const dynamic = "force-dynamic";

/**
 * Providers differ in where the signature lives.
 *
 * Authorize.Net sends one header. PayPal's verify endpoint needs five values,
 * bundled here into a JSON string — see `providers/paypal.ts` for why the
 * interface was not widened for one provider.
 */
function extractSignature(request: NextRequest): string {
  if (activeProviderId() === "paypal") {
    return JSON.stringify({
      transmissionId: request.headers.get("paypal-transmission-id") ?? "",
      transmissionTime: request.headers.get("paypal-transmission-time") ?? "",
      transmissionSig: request.headers.get("paypal-transmission-sig") ?? "",
      certUrl: request.headers.get("paypal-cert-url") ?? "",
      authAlgo: request.headers.get("paypal-auth-algo") ?? "",
    });
  }
  return request.headers.get("x-anet-signature") ?? "";
}

export async function POST(request: NextRequest) {
  // Before the signature check, which is the expensive part — PayPal's is a
  // round trip to their verification endpoint, so an unlimited caller could
  // make us hammer PayPal on their behalf. The limit is far above PayPal's real
  // delivery rate; see lib/rate-limit.ts for why this is a speed bump and not a
  // guarantee.
  const limited = rateLimit(
    `webhook:${clientAddress(request.headers)}`,
    LIMITS.webhook.limit,
    LIMITS.webhook.windowMs,
  );
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
    );
  }

  // Read the raw body once and never re-serialise it: providers sign the exact
  // bytes, so parsing and re-stringifying breaks verification.
  const rawBody = await request.text();

  let provider;
  let result;
  try {
    provider = activeProviderId();
    result = await getProvider(provider).handleWebhook(rawBody, extractSignature(request));
  } catch {
    // A misconfigured provider must never read as verified.
    return NextResponse.json({ error: "Billing is not configured." }, { status: 503 });
  }

  if (!result.ok) {
    if (result.reason === "invalid_signature") {
      return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
    }
    // Unrecognised and malformed get 200: the delivery was authentic, we simply
    // have nothing to do with it. An error would make the provider retry
    // forever over an event we will never handle.
    return NextResponse.json({ ignored: result.reason }, { status: 200 });
  }

  const { event } = result;

  if (await alreadyProcessed(provider, event.eventId)) {
    return NextResponse.json({ status: "already_processed" }, { status: 200 });
  }

  const claim = await claimEvent(provider, event);
  if (claim === "duplicate") {
    return NextResponse.json({ status: "already_processed" }, { status: 200 });
  }
  if (claim === "failed") {
    // Without a claim we cannot promise not to double-apply, so ask for a retry
    // rather than proceeding.
    return NextResponse.json({ error: "Could not record the event." }, { status: 500 });
  }

  const supabase = createServiceClient();

  const subscription = await supabase
    .from("therapist_subscriptions")
    .select("id,profile_id,status,current_period_end,cancel_at_period_end")
    .eq("provider_subscription_id", event.subscriptionId)
    .maybeSingle();

  if (!subscription.data) {
    // Recorded, so it will not be reprocessed, but there is nothing to update.
    // Normal during a provider migration, and worth leaving visible.
    await annotateEvent(provider, event.eventId, "No matching subscription.");
    return NextResponse.json({ status: "no_subscription" }, { status: 200 });
  }

  const row = subscription.data as unknown as {
    id: string;
    profile_id: string | null;
    status: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean | null;
  };

  const current: SubscriptionState = {
    ...initialState(),
    status: (row.status as SubscriptionState["status"]) ?? "none",
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: row.cancel_at_period_end ?? false,
  };

  const { next, listed, note } = applyBillingEvent(current, event.kind, new Date());

  await supabase
    .from("therapist_subscriptions")
    .update({
      status: next.status,
      current_period_end: next.currentPeriodEnd,
      cancel_at_period_end: next.cancelAtPeriodEnd,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id);

  if (row.profile_id) {
    await supabase
      .from("profiles")
      .update({ subscription_status: next.status, updated_at: new Date().toISOString() })
      .eq("id", row.profile_id);

    // Only ever *removes* visibility. Restoring a listing is the moderation
    // queue's decision, not billing's — paying again must never silently
    // republish a profile that was suspended for its content.
    //
    // The `.eq(PUBLIC)` is the other half of that: it means billing can unlist
    // a live profile and nothing else. Without it, a lapsed subscription on an
    // admin-suspended profile would overwrite `suspended` with `paused` and
    // quietly downgrade a moderation decision to a billing one.
    //
    // `paused`, not `hidden`: the profile was not withdrawn and was not
    // moderated: it is unpaid. Keeping those apart means "why am I not
    // listed?" has a truthful answer.
    if (!listed) {
      await supabase
        .from("profiles")
        .update({ visibility_status: PAUSED, updated_at: new Date().toISOString() })
        .eq("id", row.profile_id)
        .eq("visibility_status", PUBLIC);
    }
  }

  await annotateEvent(provider, event.eventId, null);

  return NextResponse.json({ status: "processed", note }, { status: 200 });
}
