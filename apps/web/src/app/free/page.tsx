import { permanentRedirect } from "next/navigation";

/**
 * OLD `/free` advertised a time-limited 14-day trial. V2 has a permanent Free
 * tier, so preserve the inbound URL without reviving stale campaign terms.
 */
export default function LegacyFreePage() {
  permanentRedirect("/pricing");
}
