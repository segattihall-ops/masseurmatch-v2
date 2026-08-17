import { describe, expect, it } from "vitest";

import { accessTo, cheapestTierWith, featureById, FEATURES, featuresFor } from "../features";
import { PLAN_IDS } from "../plans";

/**
 * The entitlement table.
 *
 * The failure that costs money is granting something nobody paid for; the
 * failure that costs a sale is a therapist who cannot see what they would get.
 * Both are pinned.
 */

describe("accessTo", () => {
  it("locks an unknown feature rather than granting it", () => {
    // A typo must never hand out a paid tool.
    for (const tier of PLAN_IDS) {
      expect(accessTo("does-not-exist", tier), tier).toBe("locked");
    }
  });

  it("gives featured placement to Pro and Elite only", () => {
    expect(accessTo("featured-placement", "free")).toBe("locked");
    expect(accessTo("featured-placement", "standard")).toBe("locked");
    expect(accessTo("featured-placement", "pro")).toBe("full");
    expect(accessTo("featured-placement", "elite")).toBe("full");
  });

  it("treats an unrecognised tier as free, not as the feature's best case", () => {
    // The caller is `resolveTier()`, which returns whatever
    // `profiles.subscription_tier` holds — free text, and null on old rows.
    // Every one of these must land on the free row.
    for (const tier of [null, undefined, "", "ELITE ", "platinum", "Pro "]) {
      expect(accessTo("featured-placement", tier), JSON.stringify(tier)).toBe("locked");
    }
  });

  it("normalises case the same way planFor does", () => {
    // Same tier written differently must not mean different entitlements.
    expect(accessTo("featured-placement", "PRO")).toBe("full");
    expect(accessTo("visibility-spikes", "Standard")).toBe("full");
  });
});

describe("featureById", () => {
  it("returns null for an unknown id instead of throwing", () => {
    // The dashboard reads `previewNote` from this; a throw would take out the
    // whole page over a copy change.
    expect(featureById("does-not-exist")).toBeNull();
  });

  it("carries a preview note wherever a tier previews the feature", () => {
    // `preview` promises the therapist gets to see something. Without a note
    // the card renders an empty invitation.
    for (const feature of FEATURES) {
      const previews = PLAN_IDS.some((tier) => feature.access[tier] === "preview");
      if (previews) expect(feature.previewNote, feature.id).toBeTruthy();
    }
  });
});

describe("the table itself", () => {
  it("covers every tier for every feature", () => {
    // A missing tier key would read as undefined and render as nothing at all.
    for (const feature of FEATURES) {
      for (const tier of PLAN_IDS) {
        expect(feature.access[tier], `${feature.id}/${tier}`).toBeDefined();
      }
    }
  });

  it("never takes access away as the tier goes up", () => {
    // Paying more must never give less. This is the invariant most likely to
    // break by hand-editing one row.
    const rank = { locked: 0, preview: 1, full: 2 } as const;
    for (const feature of FEATURES) {
      const ladder = PLAN_IDS.map((tier) => ({ tier, level: rank[feature.access[tier]] }));
      ladder.forEach((step, i) => {
        if (i === 0) return;
        const previous = ladder[i - 1];
        if (!previous) return;
        expect(
          step.level,
          `${feature.id}: ${step.tier} vs ${previous.tier}`,
        ).toBeGreaterThanOrEqual(previous.level);
      });
    }
  });

  it("has unique ids", () => {
    const ids = FEATURES.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("explains what preview gives, wherever preview is offered", () => {
    // "Preview" with no explanation is just a broken tool from the user's side.
    for (const feature of FEATURES) {
      const previewed = PLAN_IDS.some((t) => feature.access[t] === "preview");
      if (previewed) expect(feature.previewNote, feature.id).toBeTruthy();
    }
  });
});

describe("cheapestTierWith", () => {
  it("names the cheapest tier that fully unlocks a feature", () => {
    // Not "go Elite" for something Pro already covers.
    expect(cheapestTierWith("featured-placement")).toBe("pro");
  });

  it("returns null when nothing unlocks it", () => {
    expect(cheapestTierWith("does-not-exist")).toBeNull();
  });
});

describe("featuresFor", () => {
  it("returns one entry per feature, with that tier's level", () => {
    const free = featuresFor("free");
    expect(free).toHaveLength(FEATURES.length);
    expect(free.find((f) => f.feature.id === "featured-placement")?.access).toBe("locked");
    expect(featuresFor("elite").find((f) => f.feature.id === "featured-placement")?.access).toBe(
      "full",
    );
  });
});
