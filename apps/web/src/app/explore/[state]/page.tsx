import { permanentRedirect } from "next/navigation";

/**
 * OLD state explore pages were navigation helpers rather than canonical content.
 * V2 keeps one state index at `/states`; do not create a second state taxonomy.
 */
export default function LegacyExploreStatePage() {
  permanentRedirect("/states");
}
