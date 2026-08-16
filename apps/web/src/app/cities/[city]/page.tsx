import { notFound, permanentRedirect } from "next/navigation";

import { legacyCityTarget } from "@/lib/legacy-city";

/** An alternate old city URL shape. See `lib/legacy-city.ts`. */
export default async function LegacyCityRedirect({ params }: { params: { city: string } }) {
  const target = await legacyCityTarget(params.city);
  if (!target) notFound();

  permanentRedirect(target);
}
