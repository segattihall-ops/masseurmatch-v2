import { redirect } from "next/navigation";

/**
 * Moved to `/pro/dashboard`.
 *
 * The page here read two columns and drew three cards around them, none of
 * which the Pro dashboard does not already show from more data.
 *
 * A redirect rather than a re-export: `/pro` is the front door, and it is the
 * only shell with a mobile navigation. Rendering the same page in the legacy
 * shell would keep a second, non-responsive route to it alive for no gain.
 */
export default function TherapistHomePage() {
  redirect("/pro/dashboard");
}
