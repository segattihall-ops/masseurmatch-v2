import type { Metadata } from "next";
import Link from "next/link";
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

export const revalidate = 0;
export const dynamicParams = true;

interface CityParams {
  params: { state: string; city: string };
}

type FreshCanonicalCity = {
  city: CityListing;
  therapists: TherapistListing[];
};

function cityFaqs(city: CityListing) {
  return [
    {
      question: `How do I find a male massage therapist in ${city.name}?`,
      answer: `Browse public male massage therapist profiles in ${city.name}, compare listed services, rates, availability and session format, then contact the independent provider directly to confirm the details.`,
    },
    {
      question: `Can I find gay-friendly or LGBTQ+ affirming massage therapists in ${city.name}?`,
      answer: `Yes. Provider profiles can include LGBTQ+ affirming information and other trust signals. Review each public profile and contact the therapist directly about the setting, service and fit you want.`,
    },
    {
      question: `Can I compare incall and outcall massage in ${city.name}?`,
      answer: `Yes. Profiles can show whether a therapist offers incall, outcall or both. Confirm the exact location, travel area, timing and total rate directly with the provider before arranging a session.`,
    },
  ] as const;
}

export async function generateStaticParams() {
  const cities = await getCities();
  return cities.map((city) => ({ state: city.stateSlug, city: city.citySlug }));
}

async function getLegacyCity(citySlugValue: string): Promise<CityListing | null> {
  const cities = await getCities();
  return cities.find((city) => city.citySlug === citySlugValue.toLowerCase()) ?? null;
}

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
    const title = `Male Massage Therapists in ${city.name}, ${city.state}`;
    const description = `Find male massage therapists in ${city.name}, ${city.state}. Compare public profiles, gay-friendly options, services, rates, incall/outcall and availability.`;
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
    const faqs = cityFaqs(city);
    const faqJsonLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(cityItemListJsonLd(city, therapists)) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(faqJsonLd) }}
        />

        <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">
            {city.state}
          </p>
          <h1 className="mt-4 font-display text-ds-40 font-bold tracking-tight text-text-primary">
            Male massage therapists in {city.name}
          </h1>
          <p className="mt-4 max-w-3xl text-ds-18 leading-8 text-text-secondary">
            Browse {therapists.length} public {therapists.length === 1 ? "profile" : "profiles"} in{" "}
            {city.name}. Compare services, rates, availability, incall or outcall options and
            LGBTQ+ affirming profile details before contacting an independent therapist directly.
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

          <section className="mt-16 border-t border-border pt-12">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">
                  Local massage directory
                </p>
                <h2 className="mt-3 font-display text-ds-32 font-bold tracking-tight text-text-primary">
                  Find massage for men in {city.name}
                </h2>
                <p className="mt-4 max-w-2xl leading-7 text-text-secondary">
                  Looking for a male massage therapist or gay-friendly massage option in {city.name}?{" "}
                  MasseurMatch helps you compare independent providers by public profile details,
                  listed techniques, session format, rates, availability and trust signals. The
                  directory does not handle booking or payment, so confirm final details directly
                  with the provider you choose.
                </p>
                <nav aria-label={`${city.name} massage resources`} className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/near-me"
                    className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-text-primary transition hover:border-brand-secondary hover:text-brand-secondary"
                  >
                    Male massage near me
                  </Link>
                  <Link
                    href="/therapists"
                    className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-text-primary transition hover:border-brand-secondary hover:text-brand-secondary"
                  >
                    All male massage therapists
                  </Link>
                  <Link
                    href="/gay-massage"
                    className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-text-primary transition hover:border-brand-secondary hover:text-brand-secondary"
                  >
                    Gay & LGBTQ+ friendly massage
                  </Link>
                  <Link
                    href="/services"
                    className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-text-primary transition hover:border-brand-secondary hover:text-brand-secondary"
                  >
                    Browse massage services
                  </Link>
                </nav>
              </div>

              <div>
                <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
                  Frequently asked questions
                </h2>
                <div className="mt-5 space-y-6">
                  {faqs.map((faq) => (
                    <div key={faq.question}>
                      <h3 className="font-semibold text-text-primary">{faq.question}</h3>
                      <p className="mt-2 text-sm leading-6 text-text-secondary">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
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
