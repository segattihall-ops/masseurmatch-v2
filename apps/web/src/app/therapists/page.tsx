import { getVisibleTherapists } from "@masseurmatch/db/actions/directory";
import {
  DIRECTORY_REVALIDATE_SECONDS,
  profilePath,
  therapistName,
} from "@masseurmatch/db/actions/directory-config";
import type { Metadata } from "next";
import Link from "next/link";

import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "All Therapists";
const DESCRIPTION =
  "Every verified male massage therapist listed on MasseurMatch, grouped by city.";
const PATH = "/therapists";

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
 * The full therapist index.
 *
 * This sits alongside `/therapists/[slug]`, which is the *legacy redirect* for
 * the old site's profile URLs — a static segment and a dynamic one at the same
 * level, which Next resolves in that order, so neither shadows the other.
 *
 * Grouped by city rather than listed flat: a directory's index is a navigation
 * aid, and 28 names in one column tells a reader nothing about where anyone is.
 */
export default async function TherapistsIndexPage() {
  const therapists = await getVisibleTherapists();

  const byCity = new Map<string, { label: string; href: string; people: typeof therapists }>();
  for (const therapist of therapists) {
    if (!therapist.city || !therapist.state) continue;
    const key = `${therapist.state}/${therapist.city}`;
    const existing = byCity.get(key);
    if (existing) {
      existing.people.push(therapist);
    } else {
      byCity.set(key, {
        label: `${therapist.city}, ${therapist.state}`,
        href: `/${therapist.state.toLowerCase()}/${therapist.city.toLowerCase().replace(/\s+/g, "-")}`,
        people: [therapist],
      });
    }
  }

  const cities = [...byCity.values()].sort(
    (a, b) => b.people.length - a.people.length || a.label.localeCompare(b.label),
  );

  return (
    <main className="mx-auto w-full max-w-4xl px-6 pb-16 pt-16">
      <header>
        <h1 className="font-display text-ds-40 font-bold tracking-tight text-text-primary">
          {TITLE}
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-text-secondary">
          {therapists.length} {therapists.length === 1 ? "therapist" : "therapists"} across{" "}
          {cities.length} {cities.length === 1 ? "city" : "cities"}.
        </p>
      </header>

      {cities.length === 0 ? (
        <p className="mt-10 text-text-secondary">No therapists are listed yet.</p>
      ) : (
        <div className="mt-10 space-y-10">
          {cities.map((city) => (
            <section key={city.href}>
              <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
                <Link href={city.href} className="hover:text-brand-secondary">
                  {city.label}
                </Link>
              </h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {city.people.map((therapist) => {
                  const href = profilePath(therapist);
                  if (!href) return null;
                  return (
                    <li key={therapist.id}>
                      <Link
                        href={href}
                        className="block rounded-2xl border border-border-subtle px-4 py-3 text-sm transition hover:border-brand-secondary"
                      >
                        <span className="font-medium text-text-primary">
                          {therapistName(therapist)}
                        </span>
                        {therapist.headline ? (
                          <span className="mt-0.5 block text-xs text-text-secondary">
                            {therapist.headline}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
