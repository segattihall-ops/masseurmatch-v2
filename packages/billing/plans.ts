/**
 * Plans — the single source of truth for what each tier costs and includes.
 *
 * Nothing else in the monorepo may hard-code a price or a per-tier limit.
 * `apps/dashboard/src/lib/cloudinary.ts` previously held its own copy of the
 * photo limits; it now reads `photoLimit` from here, because two lists that are
 * supposed to agree eventually do not, and the failure is silent — a therapist
 * on Pro quietly capped at the Standard limit.
 *
 * Plain module, no `server-only`: prices are shown in the browser. It contains
 * no credentials and no provider logic.
 *
 * ---------------------------------------------------------------------------
 * Relationship to `subscription_plans` in the database
 * ---------------------------------------------------------------------------
 * That table predates this repository and still exists, because
 * `therapist_subscriptions.plan_id` is a `uuid NOT NULL` foreign key into it.
 * **It is the FK target, not the price list.** Only its `code` column is read
 * (see `apps/dashboard/src/lib/subscription.ts`); its `price_cents` and
 * `max_photos` are ignored.
 *
 * Prices agree with it on every tier. Photo limits deliberately do not — the
 * database has 1/5/12/20 and this file has 3/10/15/20, which is the product
 * decision, made 2026-08-16.
 *
 * The number that actually gets charged is neither of these: PayPal bills
 * whatever its own plan says. So every `PAYPAL_PLAN_*` must be created at the
 * price below, or a therapist is shown one figure and billed another. Changing
 * a price means creating a NEW PayPal plan and repointing the variable —
 * editing a live plan re-prices existing subscribers.
 */

export const PLAN_IDS = ["free", "standard", "pro", "elite"] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export type Plan = {
  id: PlanId;
  name: string;
  /** Monthly price in **cents**, to keep money out of floating point. */
  priceCents: number;
  photoLimit: number;
  /** Eligible for the featured rotation on city pages. */
  featured: boolean;
  blurb: string;
};

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    priceCents: 0,
    photoLimit: 3,
    featured: false,
    blurb: "A listing in the directory.",
  },
  standard: {
    id: "standard",
    name: "Standard",
    priceCents: 3_900,
    photoLimit: 6,
    featured: false,
    blurb: "More photos and a fuller profile.",
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceCents: 7_900,
    photoLimit: 9,
    featured: true,
    blurb: "Featured placement on your city page.",
  },
  elite: {
    id: "elite",
    name: "Elite",
    // $129, not $99. At $99 the gap to Pro was $20 for a step that is meant to
    // be the largest in the ladder. PayPal charges whatever ITS plan says, so
    // PAYPAL_PLAN_ELITE must point at a $129 plan — see docs/DEPLOY.md. The id
    // configured today (P-9US760508D1062104NJ5TX7Y) is a $99 plan and must be
    // replaced, or a therapist is shown one price and billed another.
    priceCents: 12_900,
    photoLimit: 12,
    featured: true,
    blurb: "Top placement and the highest photo limit.",
  },
};

/** Plans a therapist can actually buy — `free` is the absence of a subscription. */
export const PAID_PLAN_IDS = PLAN_IDS.filter((id) => PLANS[id].priceCents > 0);

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === "string" && (PLAN_IDS as readonly string[]).includes(value);
}

/**
 * Resolve a tier string from the database to a plan.
 *
 * `profiles.subscription_tier` is free text and may hold anything — including
 * `null` for the rows that predate tiers. Unknown values fall back to `free`,
 * which is the safe direction: a typo grants nothing rather than granting Elite.
 */
export function planFor(tier: string | null | undefined): Plan {
  const id = (tier ?? "").toLowerCase();
  return isPlanId(id) ? PLANS[id] : PLANS.free;
}

/** Photo allowance for a tier, with an optional per-account override. */
export function photoLimitFor(tier: string | null | undefined, override?: number | null): number {
  if (typeof override === "number" && override > 0) return override;
  return planFor(tier).photoLimit;
}

/** `$39` / `Free` — for display only; never parse this back. */
export function formatPrice(plan: Plan): string {
  if (plan.priceCents === 0) return "Free";
  const dollars = plan.priceCents / 100;
  return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

/**
 * Subscription states, as this product understands them.
 *
 * `past_due` is deliberately *not* the same as unpublished. A failed payment
 * starts a grace period; the profile stays live until it expires. Conflating
 * the two would delist a therapist over a card that needed re-authorising.
 */
export const SUBSCRIPTION_STATUSES = [
  "none",
  "active",
  "trialing",
  "past_due",
  "canceled",
  "expired",
] as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

/** Days a profile stays live after a failed payment before it is unpublished. */
export const GRACE_PERIOD_DAYS = 7;

/** Whether a status still entitles the profile to be publicly listed. */
export function entitlesListing(status: SubscriptionStatus): boolean {
  return status === "active" || status === "trialing" || status === "past_due";
}
