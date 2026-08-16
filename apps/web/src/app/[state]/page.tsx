import { notFound, permanentRedirect } from "next/navigation";

import { legacyCityTarget } from "@/lib/legacy-city";

/**
 * A single segment at the site root.
 *
 * This exists to catch the old site's bare `/{city}` URLs — `/new-york`,
 * `/san-francisco` and three others are in the live sitemap and would otherwise
 * 404 on cutover.
 *
 * It lives at `[state]` rather than a new `[city]` segment because Next.js
 * forbids two differently-named dynamic segments at the same level, and
 * `[state]/[city]` already claims this position. So the parameter is named for
 * what the route eventually becomes, and is tested here for what the old site
 * used it as.
 *
 * Static routes win over dynamic ones in Next's matcher, so `/about`, `/faq`,
 * `/search`, `/terms` and `/privacy` are unaffected by this file existing.
 *
 * A state slug with no city interpretation 404s. v2 has no state hub page yet —
 * `/states` and `/{state}` are on the not-built list in `PARITY.md` — and
 * redirecting `/ny` to the home page would be a soft 404.
 */
export default async function LegacyCityRedirect({ params }: { params: { state: string } }) {
  const target = await legacyCityTarget(params.state);
  if (!target) notFound();

  permanentRedirect(target);
}
