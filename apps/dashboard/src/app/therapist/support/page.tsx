import { redirect } from "next/navigation";

/**
 * Moved to `/pro/tickets`.
 *
 * The page here read nothing at all: static contact cards and example articles,
 * with no way to open a ticket or see one already open.
 *
 * A redirect rather than a re-export: `/pro` is the front door, and it is the
 * only shell with a mobile navigation. Rendering the same page in the legacy
 * shell would keep a second, non-responsive route to it alive for no gain.
 */
export default function TherapistSupportPage() {
  redirect("/pro/tickets");
}
