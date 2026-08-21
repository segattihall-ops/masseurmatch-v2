import Link from "next/link";
import { StaggerItem, StaggerList } from "@masseurmatch/ui";
import type {
  CityListing,
  DirectoryFilters,
  TherapistListing,
} from "@masseurmatch/db/actions/directory-config";
import { cityPath, profilePath, therapistName } from "@masseurmatch/db/actions/directory-config";

import { TherapistCard } from "@/components/therapist-card";
import { jsonLdScript } from "@/lib/jsonld";
import { absoluteUrl } from "@/lib/site";

function searchHref(city: CityListing, filters: DirectoryFilters): string {
  const params = new URLSearchParams({ city: city.citySlug });
  if (filters.query) params.set("q", filters.query);
  if (filters.service) params.set("service", filters.service);
  if (filters.session) params.set("session", filters.session);
  if (filters.availableNow) params.set("available", "1");
  if (filters.verified) params.set("verified", "1");
  if (filters.lgbtq) params.set("lgbtq", "1");
  if (typeof filters.maxPrice === "number") params.set("max", String(filters.maxPrice));
  if (filters.sort) params.set("sort", filters.sort);
  return `/search?${params.toString()}`;
}

export function LegacyDirectoryLanding({
  city,
  title,
  intro,
  canonicalPath,
  filters,
  therapists,
}: {
  city: CityListing;
  title: string;
  intro: string;
  canonicalPath: string;
  filters: DirectoryFilters;
  therapists: TherapistListing[];
}) {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    url: absoluteUrl(canonicalPath),
    description: intro,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: therapists.length,
      itemListElement: therapists.flatMap((therapist, index) => {
        const path = profilePath(therapist);
        if (!path) return [];
        return [
          {
            "@type": "ListItem",
            position: index + 1,
            name: therapistName(therapist),
            url: absoluteUrl(path),
          },
        ];
      }),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(itemList) }}
      />

      <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-16">
        <nav aria-label="Breadcrumb" className="text-sm text-text-secondary">
          <Link href={cityPath(city)} className="hover:text-brand-secondary">
            {city.name}, {city.state}
          </Link>
        </nav>

        <header className="mt-6 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">
            Local directory
          </p>
          <h1 className="mt-4 font-display text-ds-40 font-bold tracking-tight text-text-primary">
            {title}
          </h1>
          <p className="mt-4 text-ds-18 leading-8 text-text-secondary">{intro}</p>
          <Link
            href={searchHref(city, filters)}
            className="mt-5 inline-block text-sm font-semibold text-brand-secondary underline underline-offset-4"
          >
            Refine this search
          </Link>
        </header>

        <section className="mt-12" aria-labelledby="legacy-directory-results">
          <h2
            id="legacy-directory-results"
            className="font-display text-ds-24 font-bold tracking-tight text-text-primary"
          >
            Therapists in {city.name}
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            {therapists.length} matching {therapists.length === 1 ? "profile" : "profiles"}
          </p>

          {therapists.length > 0 ? (
            <StaggerList
              as="ul"
              className="mt-6 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3"
            >
              {therapists.map((therapist) => (
                <StaggerItem as="li" key={therapist.id}>
                  <TherapistCard therapist={therapist} headingLevel={3} />
                </StaggerItem>
              ))}
            </StaggerList>
          ) : (
            <div className="mt-6 rounded-2xl border border-border bg-bg-subtle p-6">
              <p className="text-text-secondary">
                No matching public profiles are listed right now. Browse the full city directory
                for current options.
              </p>
              <Link
                href={cityPath(city)}
                className="mt-3 inline-block text-sm font-semibold text-brand-secondary underline underline-offset-4"
              >
                View all therapists in {city.name}
              </Link>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
