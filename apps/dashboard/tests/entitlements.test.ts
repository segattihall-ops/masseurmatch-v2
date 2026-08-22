import { describe, expect, it } from "vitest";

import { entitlementFor } from "@/lib/entitlements";

describe("entitlementFor", () => {
  it("names the cheapest plan that unlocks a feature, not the dearest", () => {
    // Telling somebody on Free to "go Elite" for something Standard already
    // covers is the fastest way to lose the sale.
    const spikes = entitlementFor("visibility-spikes", "free");
    expect(spikes.access).toBe("preview");
    expect(spikes.upgrade?.name).toBe("Standard");
    expect(spikes.upgrade?.price).toBe("$39");
  });

  it("offers no upgrade once the tier already has full access", () => {
    const spikes = entitlementFor("visibility-spikes", "pro");
    expect(spikes.access).toBe("full");
    expect(spikes.upgrade).toBeNull();
  });

  it("carries the preview note the feature table wrote", () => {
    expect(entitlementFor("available-now", "free").previewNote).toContain("cannot switch it on");
  });

  it("fails closed on an unknown tier and an unknown feature", () => {
    // An unrecognised tier is Free; an unknown id is locked. A typo must never
    // hand out something nobody paid for.
    expect(entitlementFor("visibility-spikes", "platinum").access).toBe("preview");
    expect(entitlementFor("teleportation", "elite").access).toBe("locked");
  });

  it("reports a feature no plan unlocks as locked with nothing to sell", () => {
    const unknown = entitlementFor("teleportation", "free");
    expect(unknown.upgrade).toBeNull();
    expect(unknown.previewNote).toBeNull();
  });
});
