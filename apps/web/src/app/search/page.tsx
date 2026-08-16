import type { Metadata } from "next";
import { FadeIn, Input, StaggerItem, StaggerList, buttonVariants } from "@masseurmatch/ui";
import {
  getCities,
  getServiceCategories,
  searchTherapists,
} from "@masseurmatch/db/actions/directory";

import { TherapistCard } from "@/components/therapist-card";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

/** Filters live in the URL, so results are server-rendered and shareable. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Find a Massage Therapist",
  description: `Search verified male massage therapists by city and service on ${SITE_NAME}.`,
  alternates: { canonical: absoluteUrl("/search") },
  // Filter permutations are not useful in an index; the city pages are.
  robots: { index: false, follow: true },
};

interface SearchParams {
  searchParams: { city?: string; service?: string; q?: string };
}

export default async function SearchPage({ searchParams }: SearchParams) {
  const filters = {
    city: searchParams.city?.trim() || undefined,
    service: searchParams.service?.trim() || undefined,
    query: searchParams.q?.trim() || undefined,
  };

  const [results, cities, services] = await Promise.all([
    searchTherapists(filters),
    getCities(),
    getServiceCategories(),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-16">
      <h1 className="font-display text-ds-40 font-bold tracking-tight text-text-primary">
        Find a therapist
      </h1>

      {/*
        A plain GET form: no client JavaScript, filters land in searchParams
        and the server renders the result set.
      */}
      <form method="get" className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <label htmlFor="q" className="mb-1.5 block text-sm font-medium text-text-primary">
            Search
          </label>
          <Input
            id="q"
            name="q"
            type="search"
            placeholder="Name or city"
            defaultValue={filters.query ?? ""}
          />
        </div>

        <div>
          <label htmlFor="city" className="mb-1.5 block text-sm font-medium text-text-primary">
            City
          </label>
          <select
            id="city"
            name="city"
            defaultValue={filters.city ?? ""}
            className="motion-premium h-12 w-full rounded-xl border border-border/90 bg-white/92 px-4 text-sm text-foreground focus-visible:border-brand-secondary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:ring-offset-2"
          >
            <option value="">All cities</option>
            {cities.map((city) => (
              <option key={city.citySlug} value={city.citySlug}>
                {city.name}, {city.state}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="service" className="mb-1.5 block text-sm font-medium text-text-primary">
            Service
          </label>
          <select
            id="service"
            name="service"
            defaultValue={filters.service ?? ""}
            className="motion-premium h-12 w-full rounded-xl border border-border/90 bg-white/92 px-4 text-sm text-foreground focus-visible:border-brand-secondary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:ring-offset-2"
          >
            <option value="">All services</option>
            {services.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-4">
          <button type="submit" className={buttonVariants({ size: "lg" })}>
            Apply filters
          </button>
        </div>
      </form>

      <p className="mt-10 text-sm text-text-secondary">
        {results.length} {results.length === 1 ? "therapist" : "therapists"} found
      </p>

      <StaggerList
        as="ul"
        className="mt-6 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3"
      >
        {results.map((therapist) => (
          <StaggerItem as="li" key={therapist.id}>
            <TherapistCard therapist={therapist} headingLevel={2} />
          </StaggerItem>
        ))}
      </StaggerList>

      {results.length === 0 ? (
        <FadeIn className="mt-10">
          <p className="text-text-secondary">
            Nothing matched those filters. Try widening your search.
          </p>
        </FadeIn>
      ) : null}
    </main>
  );
}
