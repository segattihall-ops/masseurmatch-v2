import { redirect } from "next/navigation";

/**
 * Moved to `/pro/analytics`.
 *
 * Same view counts as Analytics in a different layout, followed by four
 * hard-coded tip cards — one of which claimed complete profiles get 70% more
 * views, a figure with nothing behind it.
 *
 * A redirect rather than a re-export: `/pro` is the front door, and it is the
 * only shell with a mobile navigation. Rendering the same page in the legacy
 * shell would keep a second, non-responsive route to it alive for no gain.
 */
export default function TherapistGrowthPage() {
  redirect("/pro/analytics");
}
