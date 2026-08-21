import { permanentRedirect } from "next/navigation";

/** Legacy country hub. V2's canonical nationwide browse surface is /therapists. */
export default function LegacyExploreUsaPage() {
  permanentRedirect("/therapists");
}
