import { redirect } from "next/navigation";

/**
 * Moved to `/pro/photos`.
 *
 * Same uploader, without the slot count or the moderation state, and with no
 * auth guard.
 *
 * A redirect rather than a re-export: `/pro` is the front door, and it is the
 * only shell with a mobile navigation. Rendering the same page in the legacy
 * shell would keep a second, non-responsive route to it alive for no gain.
 */
export default function TherapistPhotosPage() {
  redirect("/pro/photos");
}
