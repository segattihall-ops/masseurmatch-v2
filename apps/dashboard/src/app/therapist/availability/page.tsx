import { redirect } from "next/navigation";

/**
 * Moved to `/pro/growth`.
 *
 * Available Now and the travel schedule live with the other growth tools now.
 * This route's editor wrote `travel_schedule` through a second action that
 * replaced the whole array, alongside the add/remove pair the rest of the app
 * uses — two write paths into one column.
 *
 * A redirect rather than a re-export: `/pro` is the front door, and it is the
 * only shell with a mobile navigation. Rendering the same page in the legacy
 * shell would keep a second, non-responsive route to it alive for no gain.
 */
export default function TherapistAvailabilityPage() {
  redirect("/pro/growth");
}
