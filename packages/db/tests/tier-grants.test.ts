import { describe, expect, it } from "vitest";

import { grantHasLapsed, isCourtesyGrant, resolveTier } from "../tier-grants";

/**
 * Courtesy tier grants and their expiry.
 *
 * Two failures matter in opposite directions: granting Elite to someone who
 * never paid, and revoking a tier from someone who did. Both are pinned.
 *
 * `now` is injected rather than mocked so these never depend on wall-clock
 * timing near a boundary.
 */

const NOW = new Date("2026-09-01T12:00:00Z");
const LATER = "2026-09-30T00:00:00Z";
const EARLIER = "2026-08-01T00:00:00Z";

describe("resolveTier", () => {
  it("honours a live subscription, deadline or not", () => {
    expect(resolveTier({ subscription_tier: "elite", subscription_status: "active" }, NOW)).toBe(
      "elite",
    );
    expect(resolveTier({ subscription_tier: "pro", subscription_status: "trialing" }, NOW)).toBe(
      "pro",
    );
  });

  it("never lets a stale deadline revoke a paid subscription", () => {
    expect(
      resolveTier(
        { subscription_tier: "elite", subscription_status: "active", tier_granted_until: EARLIER },
        NOW,
      ),
    ).toBe("elite");
  });

  it("honours a courtesy grant until its deadline", () => {
    expect(resolveTier({ subscription_tier: "elite", tier_granted_until: LATER }, NOW)).toBe(
      "elite",
    );
  });

  it("drops to free once the deadline has passed", () => {
    expect(resolveTier({ subscription_tier: "elite", tier_granted_until: EARLIER }, NOW)).toBe(
      "free",
    );
  });

  it("treats a paid tier with neither subscription nor deadline as free", () => {
    // The 25-profile case as found in production, before any grant is recorded.
    expect(resolveTier({ subscription_tier: "elite" }, NOW)).toBe("free");
  });

  it("grants nothing on an unparseable deadline", () => {
    expect(resolveTier({ subscription_tier: "elite", tier_granted_until: "whenever" }, NOW)).toBe(
      "free",
    );
  });

  it("does not treat past_due, canceled or expired as paid", () => {
    // past_due still entitles a LISTING (see entitlesListing) but must not keep
    // granting Elite photo limits after the courtesy window closes.
    for (const status of ["past_due", "canceled", "expired", "none", ""]) {
      expect(
        resolveTier(
          { subscription_tier: "elite", subscription_status: status, tier_granted_until: EARLIER },
          NOW,
        ),
        status || "(empty)",
      ).toBe("free");
    }
  });

  it("leaves free profiles alone", () => {
    expect(resolveTier({ subscription_tier: "free", tier_granted_until: LATER }, NOW)).toBe("free");
    expect(resolveTier({ subscription_tier: null }, NOW)).toBe("free");
    expect(resolveTier({}, NOW)).toBe("free");
  });

  it("normalises case and whitespace", () => {
    expect(resolveTier({ subscription_tier: " Elite ", tier_granted_until: LATER }, NOW)).toBe(
      "elite",
    );
    expect(resolveTier({ subscription_tier: "elite", subscription_status: "ACTIVE" }, NOW)).toBe(
      "elite",
    );
  });

  it("passes an unknown tier through for the plan layer to reject", () => {
    // Deciding what "platinum" is worth belongs to @masseurmatch/billing, whose
    // planFor() falls back to free. This layer only answers "does it apply?".
    expect(resolveTier({ subscription_tier: "platinum", tier_granted_until: LATER }, NOW)).toBe(
      "platinum",
    );
  });

  it("accepts a Date as well as a string", () => {
    expect(
      resolveTier({ subscription_tier: "pro", tier_granted_until: new Date(LATER) }, NOW),
    ).toBe("pro");
  });
});

describe("isCourtesyGrant / grantHasLapsed", () => {
  it("identifies unpaid tiers carrying a deadline", () => {
    expect(isCourtesyGrant({ subscription_tier: "elite", tier_granted_until: LATER })).toBe(true);
    expect(isCourtesyGrant({ subscription_tier: "elite", tier_granted_until: EARLIER })).toBe(true);
  });

  it("excludes paid subscribers and free profiles", () => {
    expect(
      isCourtesyGrant({
        subscription_tier: "elite",
        subscription_status: "active",
        tier_granted_until: LATER,
      }),
    ).toBe(false);
    expect(isCourtesyGrant({ subscription_tier: "free", tier_granted_until: LATER })).toBe(false);
    expect(isCourtesyGrant({ subscription_tier: "elite" })).toBe(false);
  });

  it("reports lapsed only after the deadline, and never for paid", () => {
    expect(grantHasLapsed({ subscription_tier: "elite", tier_granted_until: LATER }, NOW)).toBe(
      false,
    );
    expect(grantHasLapsed({ subscription_tier: "elite", tier_granted_until: EARLIER }, NOW)).toBe(
      true,
    );
    expect(
      grantHasLapsed(
        { subscription_tier: "elite", subscription_status: "active", tier_granted_until: EARLIER },
        NOW,
      ),
    ).toBe(false);
  });
});
