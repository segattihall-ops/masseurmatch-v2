import { getCities } from "@masseurmatch/db/actions/directory";
import { cityPath, DIRECTORY_REVALIDATE_SECONDS } from "@masseurmatch/db/actions/directory-config";
import type { Metadata } from "next";
import Link from "next/link";

import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Cities";
const DESCRIPTION = "Every city with male massage therapists listed on MasseurMatch.";
const PATH = "/cities";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl(PATH) },
  openGraph: {
    type: "website",
    url: absoluteUrl(PATH),
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const revalidate = DIRECTORY_REVALIDATE_SECONDS;

/**
 * The city index.
 *
 * Note this coexists with `/cities/[city]`, the legacy redirect for the old
 * site's alternate city URL shape. A static page at `/cities` and a dynamic
 * segment beneath it are different routes; neither shadows the other.
 */
export default async function CitiesPage() {
  const cities = await getCities();

  return (
    <main className="mx-auto w-full max-w-4xl px-6 pb-16 pt-16">
      <header>
        <h1 className="font-display text-ds-40 font-bold tracking-tight text-text-primary">
          {TITLE}
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-text-secondary">{DESCRIPTION}</p>
      </header>

      {cities.length === 0 ? (
        <p className="mt-10 text-text-secondary">No cities are listed yet.</p>
      ) : (
        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <li key={`${city.stateSlug}/${city.citySlug}`}>
              <Link
                href={cityPath(city)}
                className="flex items-baseline justify-between rounded-2xl border border-border-subtle px-4 py-3 transition hover:border-brand-secondary"
              >
                <span>
                  <span className="font-medium text-text-primary">{city.name}</span>
                  <span className="ml-1.5 text-sm text-text-secondary">{city.state}</span>
                </span>
                <span className="tabular-nums text-sm text-text-muted">{city.therapistCount}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
