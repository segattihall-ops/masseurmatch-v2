import { QUEUEABLE_COLUMN_VALUES } from "./profile-status";

export type ReviewLifecycleSnapshot = {
  profileStatus: string | null | undefined;
  moderationStatus: string | null | undefined;
  isSuspended: boolean | null | undefined;
  isBanned: boolean | null | undefined;
};

export function isEnforcementBlocked(snapshot: ReviewLifecycleSnapshot): boolean {
  return snapshot.isSuspended === true || snapshot.isBanned === true;
}

export function isReviewableModerationState(snapshot: ReviewLifecycleSnapshot): boolean {
  if (isEnforcementBlocked(snapshot)) return false;
  if (QUEUEABLE_COLUMN_VALUES.some((value) => value === snapshot.profileStatus)) return true;
  return snapshot.profileStatus === "approved" && snapshot.moderationStatus === "pending_review";
}

export function canProviderResubmit(snapshot: ReviewLifecycleSnapshot): boolean {
  if (isEnforcementBlocked(snapshot)) return false;
  return snapshot.profileStatus === "rejected" || snapshot.profileStatus === "changes_requested";
}
