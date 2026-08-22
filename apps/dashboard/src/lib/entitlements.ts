import { accessTo, cheapestTierWith, featureById, formatPrice, PLANS } from "@masseurmatch/billing";
import type { Access } from "@masseurmatch/billing";

/**
 * One feature, as the dashboard needs to render it.
 *
 * Three questions get asked together everywhere a gated tool appears — what do
 * I get, what would the free version give me, and what is the cheapest plan
 * that unlocks it — and answering them separately at each call site is how a
 * card ends up telling someone on Free to buy Elite for something Standard
 * already covers.
 *
 * Nothing here decides entitlement. `@masseurmatch/billing` owns that; this
 * only gathers its answers.
 */
export type FeatureEntitlement = {
  access: Access;
  /** What the preview tier actually gives, in the feature table's own words. */
  previewNote: string | null;
  /** The cheapest plan with full access, already priced. Null when none has it. */
  upgrade: { name: string; price: string } | null;
};

export function entitlementFor(
  featureId: string,
  tier: string | null | undefined,
): FeatureEntitlement {
  const access = accessTo(featureId, tier);
  const cheapest = access === "full" ? null : cheapestTierWith(featureId);

  return {
    access,
    previewNote: featureById(featureId)?.previewNote ?? null,
    upgrade: cheapest ? { name: PLANS[cheapest].name, price: formatPrice(PLANS[cheapest]) } : null,
  };
}
