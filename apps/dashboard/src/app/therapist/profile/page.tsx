import { redirect } from "next/navigation";

/**
 * Moved to `/pro/listing`.
 *
 * This route was a second, partial profile editor posting to an `/api/profile`
 * endpoint that does not exist. The canonical editor is the listing page.
 *
 * A redirect rather than a re-export: `/pro` is the front door, and it is the
 * only shell with a mobile navigation. Rendering the same page in the legacy
 * shell would keep a second, non-responsive route to it alive for no gain.
 */
export default function TherapistProfilePage() {
  redirect("/pro/listing");
}
