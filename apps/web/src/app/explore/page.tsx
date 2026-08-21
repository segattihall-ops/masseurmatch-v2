import { permanentRedirect } from "next/navigation";

/**
 * The OLD explore surface duplicated directory discovery. V2 has one canonical
 * browse surface (`/therapists`) and one faceted surface (`/search`), so keep
 * the legacy URL alive without maintaining two competing indexes.
 */
export default function LegacyExplorePage() {
  permanentRedirect("/therapists");
}
