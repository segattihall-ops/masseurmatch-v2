import { redirect } from "next/navigation";

/**
 * Moved to `/pro/approval-status`.
 *
 * The page here had no auth guard, painted its cards with a `bg-surface` class
 * this Tailwind preset does not define, and never read `moderation_notes` — so
 * a rejected profile was told it needed changes without being told which.
 *
 * A redirect rather than a re-export: `/pro` is the front door, and it is the
 * only shell with a mobile navigation. Rendering the same page in the legacy
 * shell would keep a second, non-responsive route to it alive for no gain.
 */
export default function TherapistApprovalPage() {
  redirect("/pro/approval-status");
}
