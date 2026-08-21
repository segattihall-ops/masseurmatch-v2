import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FadeIn, StaggerItem, StaggerList } from "@masseurmatch/ui";
import {
  getCities,
  getCity,
  getTherapistsByCity,
  searchTherapists,
} from "@masseurmatch/db/actions/directory";
import {
  DIRECTORY_REVALIDATE_SECONDS,
  type CityListing,
} from "@masseurmatch/db/actions/directory-config";

import { LegacyDirectoryLanding } from "@/components/legacy-directory-landing";
import { TherapistCard } from "@/components/therapist-card";
import { getLegacySegment } from "@/content/legacy-directory";
import { cityItemListJsonLd, jsonLdScript } from "@/lib/jsonld";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import { withApprovedProfilePhotos } from "@/lib/therapist-photos";

export const revalidate = DIRECTORY_REVALIDATE_SECONDS;

/**
 * Canonical v2 cities are pre-rendered below, while valid legacy
 * `/{city}/{segment}` pages are resolved on demand. Unknown combinations still
 * return a real 404.
 */
export const dynamicParams = true;

interface CityParams {
  params: { state: string; city: string };
}

export async function generateStaticParams() {
  const cities = await getCities();
  return cities.map((city) => ({ state: city.stateSlug, city: city.citySlug }));
}

async function getLegacyCity(citySlug: string): Promise<CityListing | null> {
  const cities = await getCities();
  return cities.find((city) => city.citySlug === citySlug.toLowerCase()) ?? null;
}

export async function generateMetadata({ params }: CityParams): Promise<Metadata> {
  const city = await getCity(params.state, params.city);
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
  const city = await getCity(params.state, params.city);

  if (city) {
    const rawTherapists = await getTherapistsByCity(params.state, params.city);
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
