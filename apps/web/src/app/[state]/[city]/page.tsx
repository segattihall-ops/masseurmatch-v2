import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FadeIn, StaggerItem, StaggerList } from "@masseurmatch/ui";
import {
  getCities,
  getCity,
  getTherapistsByCity,
  searchTherapists,
  searchTherapistsPage,
} from "@masseurmatch/db/actions/directory";
import {
  citySlug,
  type CityListing,
  type TherapistListing,
} from "@masseurmatch/db/actions/directory-config";

import { LegacyDirectoryLanding } from "@/components/legacy-directory-landing";
import { TherapistCard } from "@/components/therapist-card";
import { getLegacySegment } from "@/content/legacy-directory";
import { cityItemListJsonLd, jsonLdScript } from "@/lib/jsonld";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import { withApprovedProfilePhotos } from "@/lib/therapist-photos";

/**
 * Do not put the city route itself in Next's Full Route Cache.
 *
 * A city can become valid the moment an admin approves the first profile in
 * that location. Admin and Public are separate Vercel projects, so the Admin
 * deployment cannot invalidate a 404 already cached by the Public deployment.
 * Keeping this route dynamic lets the fresh Postgres fallback below run on the
 * very next request. The established-directory reads remain cached internally,
 * so this fixes stale 404s without turning every directory query into a cold
 * database read.
 */
export const revalidate = 0;

/**
 * Canonical v2 cities are pre-rendered below, while valid legacy
 * `/{city}/{segment}` pages are resolved on demand. Unknown combinations still
 * return a real 404.
 */
export const dynamicParams = true;

interface CityParams {
  params: { state: string; city: string };
}

type FreshCanonicalCity = {
  city: CityListing;
  therapists: TherapistListing[];
};

export async function generateStaticParams() {
  const cities = await getCities();
  return cities.map((city) => ({ state: city.stateSlug, city: city.citySlug }));
}

async function getLegacyCity(citySlugValue: string): Promise<CityListing | null> {
  const cities = await getCities();
  return cities.find((city) => city.citySlug === citySlugValue.toLowerCase()) ?? null;
}

/**
 * Recover a canonical city that was approved after the hourly directory cache
 * was populated.
 *
 * Admin and Public are separate Vercel applications, so a revalidation in the
 * Admin app cannot invalidate Public's Next.js data cache. Search already uses
 * the uncached Postgres RPC; use it only as a fallback when `getCities()` has
 * not learned the city yet. That prevents a newly approved city/profile from
 * returning a false 404 for up to an hour while preserving the cached path for
 * established cities.
 */
async function getFreshCanonicalCity(
  state: string,
  city: string,
): Promise<FreshCanonicalCity | null> {
  const normalizedState = state.toLowerCase();
  const normalizedCity = city.toLowerCase();
  const therapists: TherapistListing[] = [];
  let page = 1;
  let total = 0;

  do {
    const result = await searchTherapistsPage({
      state: normalizedState,
      city: normalizedCity,
      page,
      pageSize: 48,
    });

    total = result.total;
    therapists.push(
      ...result.items.filter(
        (therapist) =>
          therapist.state?.toLowerCase() === normalizedState &&
          therapist.city !== null &&
          citySlug(therapist.city) === normalizedCity,
      ),
    );

    if (result.items.length < result.pageSize || page * result.pageSize >= total) break;
    page += 1;
  } while (page <= Math.ceil(total / 48));

  const first = therapists[0];
  if (!first?.city || !first.state) return null;

  return {
    city: {
      citySlug: citySlug(first.city),
      stateSlug: first.state.toLowerCase(),
      name: first.city,
      state: first.state,
      therapistCount: therapists.length,
    },
    therapists,
  };
}

export async function generateMetadata({ params }: CityParams): Promise<Metadata> {
  const cachedCity = await getCity(params.state, params.city);
  const city = cachedCity ?? (await getFreshCanonicalCity(params.state, params.city))?.city ?? null;

  if (city) {
    const title = `Massage Therapists in ${city.name}, ${city.state}`;
    const description = `${city.therapistCount} verified male massage ${
      city.therapistCount === 1 ? "therapist" : "therapists"
    } in ${city.name}, ${city.state}. Compare services, pricing and availability on ${SITE_NAME}.`;
    const canonical = absoluteUrl(`/${city.stateSlug}/${city.citySlug}`);

    return {
      title,
      description,
      alternates: { canonical },
      openGraph: { type: "website", url: canonical, siteName: SITE_NAME, title, description },
    };
  }

  const [legacyCity, segment] = await Promise.all([
    getLegacyCity(params.state),
    Promise.resolve(getLegacySegment(params.city)),
  ]);
  if (!legacyCity || !segment) return {};

  const filters = { ...segment.filters, city: legacyCity.citySlug };
  const matches = await searchTherapists(filters);
  const title = `${segment.label} in ${legacyCity.name}, ${legacyCity.state}`;
  const description = `${segment.intro} Browse current public profiles in ${legacyCity.name}, ${legacyCity.state} on ${SITE_NAME}.`;
  const canonical = absoluteUrl(`/${params.state}/${params.city}`);

  return {
    title,
    description,
    alternates: { canonical },
    robots: matches.length === 0 ? { index: false, follow: true } : undefined,
    openGraph: { type: "website", url: canonical, siteName: SITE_NAME, title, description },
  };
}

export default async function CityPage({ params }: CityParams) {
  const cachedCity = await getCity(params.state, params.city);
  const freshCity = cachedCity ? null : await getFreshCanonicalCity(params.state, params.city);
  const city = cachedCity ?? freshCity?.city ?? null;

  if (city) {
    const rawTherapists =
      freshCity?.therapists ?? (await getTherapistsByCity(params.state, params.city));
    const therapists = await withApprovedProfilePhotos(rawTherapists);

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(cityItemListJsonLd(city, therapists)) }}
        />

        <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">
            {city.state}
          </p>
          <h1 className="mt-4 font-display text-ds-40 font-bold tracking-tight text-text-primary">
            Massage therapists in {city.name}
          </h1>
          <p className="mt-4 max-w-2xl text-ds-18 text-text-secondary">
            {therapists.length} verified {therapists.length === 1 ? "therapist" : "therapists"},
            ranked by standing.
          </p>

          <StaggerList
            whileInView
            as="ul"
            className="mt-12 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3"
          >
            {therapists.map((therapist, index) => (
              <StaggerItem as="li" key={therapist.id}>
                <TherapistCard therapist={therapist} priority={index === 0} headingLevel={2} />
              </StaggerItem>
            ))}
          </StaggerList>

          {therapists.length === 0 ? (
            <FadeIn className="mt-12">
              <p className="text-text-secondary">No therapists are listed here right now.</p>
            </FadeIn>
          ) : null}
        </main>
      </>
    );
  }

  const legacyCity = await getLegacyCity(params.state);
  const segment = getLegacySegment(params.city);
  if (!legacyCity || !segment) notFound();

  const filters = { ...segment.filters, city: legacyCity.citySlug };
  const rawTherapists = await searchTherapists(filters);
  const therapists = await withApprovedProfilePhotos(rawTherapists);

  return (
    <LegacyDirectoryLanding
      city={legacyCity}
      title={`${segment.label} in ${legacyCity.name}, ${legacyCity.state}`}
      intro={segment.intro}
      canonicalPath={`/${params.state}/${params.city}`}
      filters={segment.filters}
      therapists={therapists}
    />
  );
}
