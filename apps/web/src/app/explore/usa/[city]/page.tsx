import { notFound, permanentRedirect } from "next/navigation";

import { legacyCityTarget } from "@/lib/legacy-city";

/** Preserve OLD `/explore/usa/{city}` links by resolving onto the canonical v2 city URL. */
export default async function LegacyExploreCityPage({ params }: { params: { city: string } }) {
  const target = await legacyCityTarget(params.city);
  if (!target) notFound();
  permanentRedirect(target);
}
