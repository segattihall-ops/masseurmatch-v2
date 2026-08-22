import { describe, expect, it } from "vitest";

import {
  canProviderResubmit,
  isEnforcementBlocked,
  isReviewableModerationState,
} from "../review-lifecycle";

const base = {
  profileStatus: "draft",
  moderationStatus: "draft",
  isSuspended: false,
  isBanned: false,
};

describe("review lifecycle", () => {
  it("allows only queued or pending-review profiles to receive an approval decision", () => {
    expect(isReviewableModerationState({ ...base, profileStatus: "pending" })).toBe(true);
    expect(isReviewableModerationState({ ...base, profileStatus: "pending_approval" })).toBe(true);
    expect(
      isReviewableModerationState({
        ...base,
        profileStatus: "approved",
        moderationStatus: "pending_review",
      }),
    ).toBe(true);
    expect(isReviewableModerationState({ ...base, profileStatus: "approved" })).toBe(false);
    expect(isReviewableModerationState({ ...base, profileStatus: "draft" })).toBe(false);
  });

  it("allows ordinary rejections to be resubmitted but never enforcement states", () => {
    expect(canProviderResubmit({ ...base, profileStatus: "rejected" })).toBe(true);
    expect(canProviderResubmit({ ...base, profileStatus: "changes_requested" })).toBe(true);
    expect(canProviderResubmit({ ...base, profileStatus: "rejected", isSuspended: true })).toBe(
      false,
    );
    expect(canProviderResubmit({ ...base, profileStatus: "rejected", isBanned: true })).toBe(false);
    expect(canProviderResubmit({ ...base, profileStatus: "suspended" })).toBe(false);
  });

  it("treats either enforcement flag as a hard block", () => {
    expect(isEnforcementBlocked({ ...base, isSuspended: true })).toBe(true);
    expect(isEnforcementBlocked({ ...base, isBanned: true })).toBe(true);
    expect(isEnforcementBlocked(base)).toBe(false);
  });

  it("preserves the launch journey from requested changes through re-approval", () => {
    const requestedChanges = {
      ...base,
      profileStatus: "rejected",
      moderationStatus: "rejected",
    };
    expect(canProviderResubmit(requestedChanges)).toBe(true);
    expect(isReviewableModerationState(requestedChanges)).toBe(false);

    const resubmitted = {
      ...base,
      profileStatus: "pending",
      moderationStatus: "pending",
    };
    expect(canProviderResubmit(resubmitted)).toBe(false);
    expect(isReviewableModerationState(resubmitted)).toBe(true);

    const approved = {
      ...base,
      profileStatus: "approved",
      moderationStatus: "approved",
    };
    expect(canProviderResubmit(approved)).toBe(false);
    expect(isReviewableModerationState(approved)).toBe(false);
  });
});
