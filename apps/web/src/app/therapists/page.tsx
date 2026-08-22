import { getVisibleTherapists } from "@masseurmatch/db/actions/directory";
import {
  DIRECTORY_REVALIDATE_SECONDS,
  profilePath,
  therapistName,
} from "@masseurmatch/db/actions/directory-config";
import type { Metadata } from "next";
import Link from "next/link";

import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Male Massage Therapists";
const DESCRIPTION =
  "Browse male massage therapists by city on MasseurMatch. Compare public profiles, services, rates, gay-friendly details, availability and direct-contact options.";
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
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">
          Male massage directory
        </p>
        <h1 className="mt-4 font-display text-ds-40 font-bold tracking-tight text-text-primary">
          Male massage therapists
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-text-secondary">
          Browse {therapists.length} public male massage therapist{" "}
          {therapists.length === 1 ? "profile" : "profiles"} across {cities.length}{" "}
          {cities.length === 1 ? "city" : "cities"}. Compare services, rates, availability, LGBTQ+
          affirming profile details and location before contacting a provider directly.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
          <Link href="/near-me" className="text-brand-secondary hover:underline">
            Male massage therapist near me
          </Link>
          <Link href="/gay-massage" className="text-brand-secondary hover:underline">
            Gay-friendly massage
          </Link>
          <Link href="/services" className="text-brand-secondary hover:underline">
            Browse massage services
          </Link>
        </div>
      </header>

      {cities.length === 0 ? (
        <p className="mt-10 text-text-secondary">No therapists are listed yet.</p>
      ) : (
        <div className="mt-10 space-y-10">
          {cities.map((city) => (
            <section key={city.href}>
              <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
                <Link href={city.href} className="hover:text-brand-secondary">
                  Male massage therapists in {city.label}
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
