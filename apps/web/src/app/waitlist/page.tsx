import { permanentRedirect } from "next/navigation";

/**
 * The OLD waitlist was a pre-launch acquisition page. The public directory is
 * live now, so keeping the pre-launch claims would be misleading. Preserve old
 * links by sending prospective therapists to the current provider information.
 */
export default function LegacyWaitlistPage() {
  permanentRedirect("/for-therapists");
}
