import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn, StaggerItem, StaggerList, buttonVariants } from "@masseurmatch/ui";
import {
  DIRECTORY_TIERS,
  cityPath,
  isDirectoryObjective,
  profilePath,
  therapistName,
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
import { jsonLdScript } from "@/lib/jsonld";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import { withApprovedProfilePhotos } from "@/lib/therapist-photos";
import { SearchControls } from "./search-controls";

/** Filters live in the URL, so results are server-rendered and shareable. */
export const dynamic = "force-dynamic";

const SEARCH_FAQS = [
  {
    question: "How do I find a therapist near me?",
    answer:
      "Use your location or the city filter to narrow results to your area. Then compare specialties, public profile details, availability, and pricing before contacting a therapist directly.",
  },
  {
    question: "Does MasseurMatch handle booking or payments?",
    answer:
      "No. MasseurMatch is a discovery directory. You review public profiles and contact independent therapists directly to confirm availability, rates, and location.",
  },
  {
    question: "What does the verified badge mean?",
    answer:
      "A verification badge reflects the specific profile or identity checks described by MasseurMatch. It is not a professional-license guarantee or endorsement of a service.",
  },
  {
    question: "Can I filter by specialty or session type?",
    answer:
      "Yes. Search by service or technique, objective, incall or outcall, price range, availability, experience, tier, verification, and LGBTQ+ affirming status.",
  },
] as const;

interface SearchParams {
  searchParams: {
    city?: string;
    service?: string;
    q?: string;
    goal?: string;
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

const TIER_LABELS: Record<DirectoryTier, string> = {
  free: "Access",
  standard: "Active",
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

  // Backwards compatibility with current links such as `?city=dallas`.
  return cities.find((city) => city.citySlug === citySlug) ?? null;
}

function pageHref(searchParams: SearchParams["searchParams"], page: number): string {
  const params = new URLSearchParams();
  const keys = [
    "city",
    "service",
    "q",
    "goal",
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

function hasIndexChangingFilters(searchParams: SearchParams["searchParams"]): boolean {
  return [
    searchParams.city,
    searchParams.service,
    searchParams.q,
    searchParams.goal,
    searchParams.session,
    searchParams.available,
    searchParams.verified,
    searchParams.lgbtq,
    searchParams.min,
    searchParams.max,
    searchParams.tier,
    searchParams.master,
    searchParams.sort,
  ].some((value) => Boolean(value?.trim()));
}

export async function generateMetadata({ searchParams }: SearchParams): Promise<Metadata> {
  const cities = await getCities();
  const selectedCity = resolveCity(searchParams.city, cities);
  const title = selectedCity
    ? `${selectedCity.name} Massage Therapists — Directory Search`
    : "Search Massage Therapists";
  const description = selectedCity
    ? `Search massage therapists in ${selectedCity.name}, ${selectedCity.state}. Compare services, availability, public profile details and pricing, then contact providers directly.`
    : `Search the ${SITE_NAME} directory by city, service, session format, price, availability and trust signals.`;

  return {
    title,
    description,
    alternates: { canonical: absoluteUrl("/search") },
    robots: hasIndexChangingFilters(searchParams)
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      url: absoluteUrl("/search"),
      title,
      description,
    },
  };
}

export default async function SearchPage({ searchParams }: SearchParams) {
  const [cities, services] = await Promise.all([getCities(), getServiceCategories()]);
  const selectedCity = resolveCity(searchParams.city, cities);
  const minPrice = positiveNumber(searchParams.min);
  const maxPrice = positiveNumber(searchParams.max);
  const page = positivePage(searchParams.page);
  const goal = isDirectoryObjective(searchParams.goal) ? searchParams.goal : undefined;
  const sort: DirectorySort =
    searchParams.sort === "price" || searchParams.sort === "rating"
      ? searchParams.sort
      : "recommended";

  const filters: DirectoryFilters = {
    city: (selectedCity?.citySlug ?? searchParams.city?.trim()) || undefined,
    state: selectedCity?.stateSlug,
    service: searchParams.service?.trim() || undefined,
    query: searchParams.q?.trim() || undefined,
    goal,
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
    sort,
    page,
    pageSize: 24,
  };

  const search = await searchTherapistsPage(filters);
  const results = await withApprovedProfilePhotos(search.items);
  const pageCount = Math.max(1, Math.ceil(search.total / search.pageSize));
  const selectedCityValue = selectedCity
    ? `${selectedCity.stateSlug}/${selectedCity.citySlug}`
    : (searchParams.city?.trim() ?? "");
  const quickCities = cities.slice(0, 12);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Search", item: absoluteUrl("/search") },
    ],
  };
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Search massage therapists",
    description:
      "Search public massage therapist listings by city, service, session format, price and profile details.",
    url: absoluteUrl("/search"),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: search.total,
      itemListElement: results.map((therapist, index) => ({
        "@type": "ListItem",
        position: (search.page - 1) * search.pageSize + index + 1,
        name: therapistName(therapist),
        url: profilePath(therapist) ? absoluteUrl(profilePath(therapist)!) : undefined,
      })),
    },
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: SEARCH_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(faqJsonLd) }}
      />

      <header className="grid gap-4 lg:grid-cols-[1fr_440px] lg:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-secondary">
            Find a therapist
          </p>
          <h1 className="mt-3 font-display text-ds-40 font-bold tracking-tight text-text-primary sm:text-5xl">
            {selectedCity
              ? `Massage therapists in ${selectedCity.name}`
              : "Browse massage therapists"}
          </h1>
        </div>
        <p className="text-sm leading-7 text-text-secondary">
          Search public profiles by location, service, goal, availability, session format, price,
          experience, trust signals and physical profile terms. Contact independent providers
          directly.
        </p>
      </header>

      <SearchControls
        cities={cities}
        services={services}
        resultCount={search.total}
        values={{
          q: filters.query ?? "",
          city: selectedCityValue,
          service: filters.service ?? "",
          goal: filters.goal ?? "",
          session: filters.session ?? "",
          tier: filters.tier ?? "",
          min: typeof filters.minPrice === "number" ? String(filters.minPrice) : "",
          max: typeof filters.maxPrice === "number" ? String(filters.maxPrice) : "",
          sort,
          available: Boolean(filters.availableNow),
          verified: Boolean(filters.verified),
          lgbtq: Boolean(filters.lgbtq),
          master: filters.minExperienceYears === 10,
        }}
      />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm text-text-secondary">
        <p>
          <strong className="font-semibold text-text-primary">{search.total}</strong>{" "}
          {search.total === 1 ? "therapist" : "therapists"} found
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
        <FadeIn className="mt-8 rounded-3xl border border-border bg-bg-surface p-8 text-center shadow-ds-sm">
          <h2 className="font-display text-xl font-semibold text-text-primary">
            No profiles matched this search.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
            Try a nearby city, a broader service term, or clear one of the trust, price or
            availability filters.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/search" className={buttonVariants({ variant: "secondary" })}>
              Clear all filters
            </Link>
            <Link href="/cities" className={buttonVariants()}>
              Browse cities
            </Link>
          </div>
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

      {quickCities.length > 0 ? (
        <nav aria-label="Popular cities" className="mt-10 flex flex-wrap gap-2">
          {quickCities.map((city) => (
            <Link
              key={`${city.stateSlug}/${city.citySlug}`}
              href={cityPath(city)}
              className="rounded-full border border-border bg-bg-surface px-3 py-2 text-xs font-semibold text-text-secondary transition hover:border-brand-secondary/30 hover:text-text-primary"
            >
              {city.name}, {city.state}
            </Link>
          ))}
        </nav>
      ) : null}

      <section className="mt-14 grid gap-6 rounded-3xl border border-border bg-bg-surface p-6 shadow-ds-sm lg:grid-cols-2 lg:p-8">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-secondary">
            Directory help
          </p>
          <h2 className="mt-3 font-display text-2xl font-semibold text-text-primary">
            Helpful detail without blocking discovery.
          </h2>
          <p className="mt-3 text-sm leading-7 text-text-secondary">
            MasseurMatch is a directory, not the provider of the massage service. Review public
            profile information, then confirm exact location, timing, rates and service details
            directly with the therapist.
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold">
            <Link href="/how-it-works" className="text-brand-secondary hover:underline">
              How it works
            </Link>
            <Link href="/trust" className="text-brand-secondary hover:underline">
              Trust &amp; safety
            </Link>
          </div>
        </div>
        <div className="space-y-3">
          {SEARCH_FAQS.map((faq) => (
            <details
              key={faq.question}
              className="rounded-2xl border border-border bg-bg-subtle p-4"
            >
              <summary className="cursor-pointer font-semibold text-text-primary">
                {faq.question}
              </summary>
              <p className="mt-3 text-sm leading-6 text-text-secondary">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <p className="mt-8 text-xs leading-5 text-text-muted">
        Tier labels:{" "}
        {Object.entries(TIER_LABELS)
          .map(([tier, label]) => `${tier}: ${label}`)
          .join(" · ")}
        .
      </p>
    </main>
  );
}
