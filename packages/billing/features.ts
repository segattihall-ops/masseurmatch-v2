import { planFor, PLAN_IDS, type PlanId } from "./plans";

/**
 * What each tier unlocks, in one table.
 *
 * There are exactly three answers, and no fourth is coming:
 *
 *   full     — use it normally
 *   preview  — open it, see it work, but on a deliberately limited slice
 *   locked   — see that it exists and what it costs to have it
 *
 * `preview` is the whole point. A therapist who cannot open a tool has no
 * reason to believe it is worth $79, so every paid tool is reachable on the
 * free tier in some reduced form rather than behind a wall. That is a product
 * decision, not a technical one, and it is why this file exists instead of
 * scattered `tier === "pro"` checks.
 *
 * Adding a ported feature is one row here plus one `<Gate>` in the UI. Nothing
 * else should ever branch on a tier name — if you find yourself writing
 * `if (tier === …)` anywhere else, the answer belongs in this table.
 */

export type Access = "full" | "preview" | "locked";

export type Feature = {
  id: string;
  /** Shown to the therapist. Plain language, no jargon, no feature codenames. */
  label: string;
  /** One line saying what `preview` actually gives. Null when never previewable. */
  previewNote: string | null;
  access: Record<PlanId, Access>;
};

/**
 * The features that exist in this codebase today.
 *
 * Deliberately short. Rows are added as features land, not in advance — a table
 * listing tools nobody built is a promise the product cannot keep, and the
 * dashboard would render locks for things that do not exist.
 */
export const FEATURES: readonly Feature[] = [
  {
    id: "visibility-spikes",
    label: "Visibility Spikes — lift your listing for a day",
    previewNote: "Free shows how Spikes work and what they did for others, but cannot start one.",
    access: { free: "preview", standard: "full", pro: "full", elite: "full" },
  },
  {
    id: "featured-placement",
    label: "Featured placement on your city page",
    previewNote: null,
    access: { free: "locked", standard: "locked", pro: "full", elite: "full" },
  },
] as const;

const BY_ID = new Map(FEATURES.map((f) => [f.id, f]));

/**
 * What this tier gets for one feature.
 *
 * Takes a loose string rather than a `PlanId` because the callers have one:
 * `resolveTier()` returns whatever `profiles.subscription_tier` holds, which is
 * free text. Normalising here — through `planFor`, so there is one definition
 * of "unknown tier" and not two — keeps every call site from casting.
 *
 * Both unknowns fail closed. An unrecognised tier is `free`, and an unknown
 * feature id is `locked`: a typo must never hand out something nobody paid for.
 */
export function accessTo(featureId: string, tier: string | null | undefined): Access {
  return BY_ID.get(featureId)?.access[planFor(tier).id] ?? "locked";
}

/** Every feature with this tier's level — for rendering the plan comparison. */
export function featuresFor(
  tier: string | null | undefined,
): { feature: Feature; access: Access }[] {
  const id = planFor(tier).id;
  return FEATURES.map((feature) => ({ feature, access: feature.access[id] }));
}

/** One feature's row, or null if the id is unknown. */
export function featureById(featureId: string): Feature | null {
  return BY_ID.get(featureId) ?? null;
}

/**
 * The cheapest tier that gives full access, or null if none does.
 *
 * This is what an upgrade prompt should name. Telling someone on Free to "go
 * Elite" for something Pro already covers is the fastest way to lose the sale.
 */
export function cheapestTierWith(featureId: string): PlanId | null {
  return PLAN_IDS.find((id) => accessTo(featureId, id) === "full") ?? null;
}
