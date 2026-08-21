import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn, Input, StaggerItem, StaggerList, buttonVariants } from "@masseurmatch/ui";
import {
  DIRECTORY_TIERS,
  type CityListing,
  type DirectoryFilters,
  type DirectorySort,
  type DirectoryTier,
} from "@masseurmatch/db/actions/directory-config";
import {
  getCities,
  getServiceCategories,
  searchTherapistsPage,
} from "@masseurmatch/db/actions/directory";

import { TherapistCard } from "@/components/therapist-card";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import { withApprovedProfilePhotos } from "@/lib/therapist-photos";

/** Filters live in the URL, so results are server-rendered and shareable. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Find a Massage Therapist",
  description: `Search verified male massage therapists by city, service, session type, price and availability on ${SITE_NAME}.`,
  alternates: { canonical: absoluteUrl("/search") },
  // Filter permutations are not useful in an index; the city pages are.
  robots: { index: false, follow: true },
};

interface SearchParams {
  searchParams: {
    city?: string;
    service?: string;
    q?: string;
    session?: string;
    available?: string;
    verified?: string;
    lgbtq?: string;
    min?: string;
    max?: string;
    tier?: string;
    master?: string;
    sort?: string;
    page?: string;
  };
}

const SORTS: { value: DirectorySort; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "price", label: "Lowest price" },
  { value: "rating", label: "Highest rated" },
];

const TIER_LABELS: Record<DirectoryTier, string> = {
  free: "Free",
  standard: "Standard",
  pro: "Pro",
  elite: "Elite",
};

function positiveNumber(raw: string | undefined): number | undefined {
  const parsed = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function positivePage(raw: string | undefined): number {
  const parsed = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function isDirectoryTier(value: string | undefined): value is DirectoryTier {
  return Boolean(value && (DIRECTORY_TIERS as readonly string[]).includes(value));
}

function resolveCity(raw: string | undefined, cities: CityListing[]): CityListing | null {
  const value = raw?.trim().toLowerCase();
  if (!value) return null;

  const [stateSlug, citySlug] = value.includes("/") ? value.split("/", 2) : [null, value];
  if (stateSlug) {
    return (
      cities.find(
        (city) => city.stateSlug.toLowerCase() === stateSlug && city.citySlug === citySlug,
      ) ?? null
    );
  }

  // Backwards compatibility with OLD/V2 links such as `?city=dallas`.
  return cities.find((city) => city.citySlug === citySlug) ?? null;
}

function pageHref(searchParams: SearchParams["searchParams"], page: number): string {
  const params = new URLSearchParams();
  const keys = [
    "city",
    "service",
    "q",
    "session",
    "available",
    "verified",
    "lgbtq",
    "min",
    "max",
    "tier",
    "master",
    "sort",
  ] as const;

  for (const key of keys) {
    const value = searchParams[key]?.trim();
    if (value) params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));

  const query = params.toString();
  return query ? `/search?${query}` : "/search";
}

export default async function SearchPage({ searchParams }: SearchParams) {
  const [cities, services] = await Promise.all([getCities(), getServiceCategories()]);
  const selectedCity = resolveCity(searchParams.city, cities);
  const minPrice = positiveNumber(searchParams.min);
  const maxPrice = positiveNumber(searchParams.max);
  const page = positivePage(searchParams.page);

  const filters: DirectoryFilters = {
    city: (selectedCity?.citySlug ?? searchParams.city?.trim()) || undefined,
    state: selectedCity?.stateSlug,
    service: searchParams.service?.trim() || undefined,
    query: searchParams.q?.trim() || undefined,
    session:
      searchParams.session === "incall" || searchParams.session === "outcall"
        ? searchParams.session
        : undefined,
    availableNow: searchParams.available === "1",
    verified: searchParams.verified === "1",
    lgbtq: searchParams.lgbtq === "1",
    minPrice,
    maxPrice,
    tier: isDirectoryTier(searchParams.tier) ? searchParams.tier : undefined,
    minExperienceYears: searchParams.master === "1" ? 10 : undefined,
    sort:
      searchParams.sort === "price" || searchParams.sort === "rating"
        ? searchParams.sort
        : undefined,
    page,
    pageSize: 24,
  };

  const search = await searchTherapistsPage(filters);
  const results = await withApprovedProfilePhotos(search.items);
  const pageCount = Math.max(1, Math.ceil(search.total / search.pageSize));
  const selectedCityValue = selectedCity
    ? `${selectedCity.stateSlug}/${selectedCity.citySlug}`
    : (searchParams.city?.trim() ?? "");

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-16">
      <h1 className="font-display text-ds-40 font-bold tracking-tight text-text-primary">
        Find a therapist
      </h1>
      <p className="mt-3 max-w-2xl text-text-secondary">
        Search by city, specialty, session format, price, experience and trust signals. City results
        also include therapists visiting there within the next 14 days.
      </p>

      <form method="get" className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <label htmlFor="q" className="mb-1.5 block text-sm font-medium text-text-primary">
            Search
          </label>
          <Input
            id="q"
            name="q"
            type="search"
            placeholder="Name, specialty, neighborhood or technique"
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
            defaultValue={selectedCityValue}
            className="motion-premium h-12 w-full rounded-xl border border-border/90 bg-white/92 px-4 text-sm text-foreground focus-visible:border-brand-secondary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:ring-offset-2"
          >
            <option value="">All cities</option>
            {cities.map((city) => (
              <option
                key={`${city.stateSlug}/${city.citySlug}`}
                value={`${city.stateSlug}/${city.citySlug}`}
              >
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

        <div>
          <label htmlFor="session" className="mb-1.5 block text-sm font-medium text-text-primary">
            Session type
          </label>
          <select
            id="session"
            name="session"
            defaultValue={filters.session ?? ""}
            className="motion-premium h-12 w-full rounded-xl border border-border/90 bg-white/92 px-4 text-sm text-foreground focus-visible:border-brand-secondary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:ring-offset-2"
          >
            <option value="">Studio or outcall</option>
            <option value="incall">Studio (incall)</option>
            <option value="outcall">Outcall (they travel to you)</option>
          </select>
        </div>

        <div>
          <label htmlFor="tier" className="mb-1.5 block text-sm font-medium text-text-primary">
            Profile tier
          </label>
          <select
            id="tier"
            name="tier"
            defaultValue={filters.tier ?? ""}
            className="motion-premium h-12 w-full rounded-xl border border-border/90 bg-white/92 px-4 text-sm text-foreground focus-visible:border-brand-secondary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:ring-offset-2"
          >
            <option value="">All tiers</option>
            {DIRECTORY_TIERS.map((tier) => (
              <option key={tier} value={tier}>
                {TIER_LABELS[tier]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="min" className="mb-1.5 block text-sm font-medium text-text-primary">
            Min price / hour
          </label>
          <Input
            id="min"
            name="min"
            type="number"
            min={0}
            step={10}
            placeholder="Any"
            defaultValue={filters.minPrice ?? ""}
          />
        </div>

        <div>
          <label htmlFor="max" className="mb-1.5 block text-sm font-medium text-text-primary">
            Max price / hour
          </label>
          <Input
            id="max"
            name="max"
            type="number"
            min={0}
            step={10}
            placeholder="Any"
            defaultValue={filters.maxPrice ?? ""}
          />
        </div>

        <div>
          <label htmlFor="sort" className="mb-1.5 block text-sm font-medium text-text-primary">
            Sort by
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={filters.sort ?? "recommended"}
            className="motion-premium h-12 w-full rounded-xl border border-border/90 bg-white/92 px-4 text-sm text-foreground focus-visible:border-brand-secondary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:ring-offset-2"
          >
            {SORTS.map((sort) => (
              <option key={sort.value} value={sort.value}>
                {sort.label}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="flex flex-wrap items-center gap-x-6 gap-y-3 sm:col-span-4">
          <legend className="sr-only">More filters</legend>
          <label className="flex items-center gap-2 text-sm text-text-primary">
            <input
              type="checkbox"
              name="available"
              value="1"
              defaultChecked={filters.availableNow}
              className="h-4 w-4 rounded border-border accent-brand-primary"
            />
            Available now
          </label>
          <label className="flex items-center gap-2 text-sm text-text-primary">
            <input
              type="checkbox"
              name="verified"
              value="1"
              defaultChecked={filters.verified}
              className="h-4 w-4 rounded border-border accent-brand-primary"
            />
            Verified only
          </label>
          <label className="flex items-center gap-2 text-sm text-text-primary">
            <input
              type="checkbox"
              name="lgbtq"
              value="1"
              defaultChecked={filters.lgbtq}
              className="h-4 w-4 rounded border-border accent-brand-primary"
            />
            LGBTQ+ affirming
          </label>
          <label className="flex items-center gap-2 text-sm text-text-primary">
            <input
              type="checkbox"
              name="master"
              value="1"
              defaultChecked={filters.minExperienceYears === 10}
              className="h-4 w-4 rounded border-border accent-brand-primary"
            />
            10+ years experience
          </label>
        </fieldset>

        <div className="flex flex-wrap gap-3 sm:col-span-4">
          <button type="submit" className={buttonVariants({ size: "lg" })}>
            Apply filters
          </button>
          <Link href="/search" className={buttonVariants({ variant: "secondary", size: "lg" })}>
            Clear
          </Link>
        </div>
      </form>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3 text-sm text-text-secondary">
        <p>
          {search.total} {search.total === 1 ? "therapist" : "therapists"} found
        </p>
        {search.total > 0 ? (
          <p>
            Page {Math.min(search.page, pageCount)} of {pageCount}
          </p>
        ) : null}
      </div>

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

      {pageCount > 1 ? (
        <nav aria-label="Search result pages" className="mt-10 flex items-center justify-between">
          {search.page > 1 ? (
            <Link
              href={pageHref(searchParams, search.page - 1)}
              className={buttonVariants({ variant: "secondary" })}
            >
              Previous
            </Link>
          ) : (
            <span />
          )}
          {search.page < pageCount ? (
            <Link
              href={pageHref(searchParams, search.page + 1)}
              className={buttonVariants({ variant: "secondary" })}
            >
              Next
            </Link>
          ) : null}
        </nav>
      ) : null}
    </main>
  );
}
