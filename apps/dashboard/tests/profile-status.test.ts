import { describe, expect, it } from "vitest";

import {
  COLUMN_VALUES_FOR,
  isProfileStatus,
  isPubliclyListable,
  PROFILE_STATUS_LABELS,
  PROFILE_STATUSES,
  QUEUEABLE_COLUMN_VALUES,
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

/**
 * The live CHECK constraint permits eight values, read from `pg_constraint` on
 * 2026-08-16:
 *
 *   draft, pending, pending_approval, under_review,
 *   approved, suspended, rejected, changes_requested
 *
 * The old application still runs against this database until cutover, so it can
 * write any of them. Folding the extra three to `draft` — the old behaviour —
 * would have hidden a submitted profile from the moderation queue while telling
 * its owner it was still a draft.
 */
describe("legacy spellings the old application can still write", () => {
  it("treats pending_approval and under_review as pending, not draft", () => {
    expect(toProfileStatus("pending_approval")).toBe("pending");
    expect(toProfileStatus("under_review")).toBe("pending");
  });

  it("treats changes_requested as rejected", () => {
    expect(toProfileStatus("changes_requested")).toBe("rejected");
  });

  it("never folds an unreviewed state to approved", () => {
    for (const value of ["pending_approval", "under_review", "changes_requested"]) {
      expect(isPubliclyListable(value)).toBe(false);
    }
  });

  it("queues every column value that means 'awaiting review'", () => {
    expect([...QUEUEABLE_COLUMN_VALUES]).toEqual(["pending", "pending_approval", "under_review"]);
  });

  it("maps every status to the column values that normalise to it", () => {
    // Whatever a status covers, `toProfileStatus` must agree — otherwise the
    // admin count and the queue disagree about the same rows.
    for (const status of PROFILE_STATUSES) {
      for (const raw of COLUMN_VALUES_FOR[status]) {
        expect(toProfileStatus(raw)).toBe(status);
      }
    }
  });

  it("covers all eight values the constraint permits", () => {
    const covered = new Set(PROFILE_STATUSES.flatMap((s) => [...COLUMN_VALUES_FOR[s]]));
    expect([...covered].sort()).toEqual(
      [
        "approved",
        "changes_requested",
        "draft",
        "pending",
        "pending_approval",
        "rejected",
        "suspended",
        "under_review",
      ].sort(),
    );
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
