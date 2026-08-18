import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FadeIn, StaggerItem, StaggerList } from "@masseurmatch/ui";
import { getCities, getCity, getTherapistsByCity } from "@masseurmatch/db/actions/directory";
import { DIRECTORY_REVALIDATE_SECONDS } from "@masseurmatch/db/actions/directory-config";

import { TherapistCard } from "@/components/therapist-card";
import { cityItemListJsonLd, jsonLdScript } from "@/lib/jsonld";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import { withApprovedProfilePhotos } from "@/lib/therapist-photos";

export const revalidate = DIRECTORY_REVALIDATE_SECONDS;
/** Only the cities we prerender are real; anything else is a 404. */
export const dynamicParams = false;

interface CityParams {
  params: { state: string; city: string };
}

export async function generateStaticParams() {
  const cities = await getCities();
  return cities.map((city) => ({ state: city.stateSlug, city: city.citySlug }));
}

export async function generateMetadata({ params }: CityParams): Promise<Metadata> {
  const city = await getCity(params.state, params.city);
  if (!city) return {};

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

export default async function CityPage({ params }: CityParams) {
  const city = await getCity(params.state, params.city);
  if (!city) notFound();

  const rawTherapists = await getTherapistsByCity(params.state, params.city);
  const therapists = await withApprovedProfilePhotos(rawTherapists);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(cityItemListJsonLd(city, therapists)) }}
      />

      <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-16">
        {/* LCP heading — rendered immediately, no entrance animation. */}
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
              {/* First card is above the fold on mobile: load its image eagerly. */}
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
