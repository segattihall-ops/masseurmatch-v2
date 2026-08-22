import { redirect } from "next/navigation";

/**
 * Moved to `/pro/notifications`.
 *
 * The page here read nothing at all — a static list of example notifications
 * and preference checkboxes with no form behind them, so ticking one saved
 * nothing.
 *
 * A redirect rather than a re-export: `/pro` is the front door, and it is the
 * only shell with a mobile navigation. Rendering the same page in the legacy
 * shell would keep a second, non-responsive route to it alive for no gain.
 */
export default function TherapistNotificationsPage() {
  redirect("/pro/notifications");
}
