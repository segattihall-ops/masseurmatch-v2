import { describe, expect, it } from "vitest";

import { ACTION_LABELS, FOSTA_CHECKS, MODERATION_ACTIONS } from "@/lib/moderation";

/**
 * Moderation vocabulary.
 *
 * The checklist is a legal-exposure control, so what is tested here is that it
 * cannot silently shrink: the server enforces "every check affirmed" by
 * comparing against this list, so an item deleted by accident would weaken the
 * gate without failing anything else.
 */

describe("moderation actions", () => {
  it("offers exactly approve, reject and suspend", () => {
    expect([...MODERATION_ACTIONS]).toEqual(["approve", "reject", "suspend"]);
  });

  it("labels every action", () => {
    for (const action of MODERATION_ACTIONS) {
      expect(ACTION_LABELS[action]).toBeTruthy();
    }
  });
});

describe("FOSTA-SESTA checklist", () => {
  it("covers all four surfaces the review has to look at", () => {
    expect(FOSTA_CHECKS.map((c) => c.id)).toEqual(["photos", "description", "services", "links"]);
  });

  it("gives every check a label and a description a reviewer can act on", () => {
    for (const check of FOSTA_CHECKS) {
      expect(check.label.length).toBeGreaterThan(0);
      expect(check.detail.length).toBeGreaterThan(20);
    }
  });

  it("uses ids with no duplicates, since the server matches submitted values by id", () => {
    const ids = FOSTA_CHECKS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("detects an incomplete checklist the way the server action does", () => {
    // Mirrors the server check: every id must be present in the submission.
    const submitted = ["photos", "description"];
    const missing = FOSTA_CHECKS.filter((c) => !submitted.includes(c.id));
    expect(missing.map((c) => c.id)).toEqual(["services", "links"]);
  });

  it("passes only when every check is affirmed", () => {
    const submitted = FOSTA_CHECKS.map((c) => c.id);
    expect(FOSTA_CHECKS.filter((c) => !submitted.includes(c.id))).toEqual([]);
  });
});
