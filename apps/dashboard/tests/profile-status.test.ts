import { describe, expect, it } from "vitest";

import {
  isProfileStatus,
  isPubliclyListable,
  PROFILE_STATUS_LABELS,
  PROFILE_STATUSES,
  REVIEWABLE_STATUSES,
  toProfileStatus,
} from "@masseurmatch/db/profile-status";

/**
 * Profile lifecycle states.
 *
 * These exist because of a real bug. The first version declared four states and
 * created new profiles as `pending`, which meant a therapist who merely signed
 * in had an empty profile queued for a human reviewer. Production already
 * distinguished the two with `draft`; the enum migration's own guard is what
 * surfaced it, by refusing to run.
 *
 * The tests below pin the distinction so it cannot quietly collapse again.
 */

describe("the state set", () => {
  it("includes draft, and puts it first in lifecycle order", () => {
    expect([...PROFILE_STATUSES]).toEqual([
      "draft",
      "pending",
      "approved",
      "rejected",
      "suspended",
    ]);
  });

  it("labels every state", () => {
    for (const status of PROFILE_STATUSES) {
      expect(PROFILE_STATUS_LABELS[status]).toBeTruthy();
    }
  });

  it("recognises draft as valid", () => {
    expect(isProfileStatus("draft")).toBe(true);
  });
});

describe("what reaches a reviewer", () => {
  it("queues pending and nothing else", () => {
    // A draft is unfinished, not submitted. Queuing it would manufacture work
    // for a human out of someone opening the dashboard.
    expect([...REVIEWABLE_STATUSES]).toEqual(["pending"]);
  });

  it("does not treat draft as reviewable", () => {
    expect((REVIEWABLE_STATUSES as readonly string[]).includes("draft")).toBe(false);
  });
});

describe("narrowing unknown values", () => {
  it("falls back to draft, not pending", () => {
    // The original fallback was `pending`, which would have swept every
    // null-status legacy row into the moderation queue.
    expect(toProfileStatus(null)).toBe("draft");
    expect(toProfileStatus(undefined)).toBe("draft");
    expect(toProfileStatus("")).toBe("draft");
    expect(toProfileStatus("some_legacy_value")).toBe("draft");
  });

  it("passes known values through untouched", () => {
    for (const status of PROFILE_STATUSES) {
      expect(toProfileStatus(status)).toBe(status);
    }
  });
});

describe("public listability", () => {
  it("lists approved only", () => {
    expect(isPubliclyListable("approved")).toBe(true);
    for (const status of ["draft", "pending", "rejected", "suspended"]) {
      expect(isPubliclyListable(status)).toBe(false);
    }
  });

  it("does not list an unrecognised value", () => {
    expect(isPubliclyListable(null)).toBe(false);
    expect(isPubliclyListable("live")).toBe(false);
  });
});
