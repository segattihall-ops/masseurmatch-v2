import { redirect } from "next/navigation";

/**
 * Moved to `/pro/demand-radar`.
 *
 * One implementation, in the shell that has a mobile navigation.
 *
 * A redirect rather than a re-export: `/pro` is the front door, and it is the
 * only shell with a mobile navigation. Rendering the same page in the legacy
 * shell would keep a second, non-responsive route to it alive for no gain.
 */
export default function TherapistDemandRadarPage() {
  redirect("/pro/demand-radar");
}
