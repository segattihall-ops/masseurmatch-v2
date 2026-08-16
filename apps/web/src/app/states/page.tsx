import { getCities } from "@masseurmatch/db/actions/directory";
import { cityPath, DIRECTORY_REVALIDATE_SECONDS } from "@masseurmatch/db/actions/directory-config";
import type { Metadata } from "next";
import Link from "next/link";

import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "States";
const DESCRIPTION =
  "Browse male massage therapists by state, then narrow to a city on MasseurMatch.";
const PATH = "/states";

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
 * The state index.
 *
 * Derived from the city list rather than from a hardcoded table of US states:
 * a page listing all fifty when four have therapists would be forty-six dead
 * ends, each an indexable URL with nothing on it.
 *
 * There is deliberately no `/states/[state]` page. `/{state}` is already taken
 * by the legacy bare-city redirect, and a second state route would either
 * collide with it or duplicate the city list under a different URL. Each state
 * here links straight to its cities.
 */
export default async function StatesPage() {
  const cities = await getCities();

  const byState = new Map<string, { state: string; cities: typeof cities }>();
  for (const city of cities) {
    const existing = byState.get(city.stateSlug);
    if (existing) {
      existing.cities.push(city);
    } else {
      byState.set(city.stateSlug, { state: city.state, cities: [city] });
    }
  }

  const states = [...byState.values()].sort((a, b) => a.state.localeCompare(b.state));

  return (
    <main className="mx-auto w-full max-w-4xl px-6 pb-16 pt-16">
      <header>
        <h1 className="font-display text-ds-40 font-bold tracking-tight text-text-primary">
          {TITLE}
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-text-secondary">{DESCRIPTION}</p>
      </header>

      {states.length === 0 ? (
        <p className="mt-10 text-text-secondary">No states are listed yet.</p>
      ) : (
        <div className="mt-10 space-y-8">
          {states.map((entry) => (
            <section key={entry.state}>
              <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
                {entry.state}
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {entry.cities.map((city) => (
                  <li key={`${city.stateSlug}/${city.citySlug}`}>
                    <Link
                      href={cityPath(city)}
                      className="rounded-full border border-border-subtle px-3 py-1.5 text-sm text-text-secondary transition hover:border-brand-secondary hover:text-text-primary"
                    >
                      {city.name}
                      <span className="ml-1.5 tabular-nums text-xs text-text-secondary">
                        {city.therapistCount}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
