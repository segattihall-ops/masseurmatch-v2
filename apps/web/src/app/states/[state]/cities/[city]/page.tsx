import { notFound, permanentRedirect } from "next/navigation";

import { legacyCityTarget } from "@/lib/legacy-city";

/**
 * `/states/{state}/cities/{city}` — the old site's longest city URL.
 *
 * The state segment is ignored: the city slug alone identifies the page in v2,
 * and the resolved city carries its own state. Trusting the old URL's state
 * would propagate any mismatch in the old data.
 */
export default async function LegacyCityRedirect({ params }: { params: { city: string } }) {
  const target = await legacyCityTarget(params.city);
  if (!target) notFound();

  permanentRedirect(target);
}
