/**
 * Where the profile stands with review.
 *
 * Re-exported rather than copied so there is one implementation to fix. The
 * page renders inside the Pro shell here and the legacy shell at its old path,
 * which is what lets `/therapist/*` keep working while `/pro/*` becomes the
 * front door.
 */
export { default } from "@/app/therapist/approval/page";
