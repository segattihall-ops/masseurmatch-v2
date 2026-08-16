import type { Metadata } from "next";
import Link from "next/link";
import {
  buttonVariants,
  Card,
  CardContent,
  FadeIn,
  StaggerItem,
  StaggerList,
} from "@masseurmatch/ui";
import { getCities, getVisibleTherapists } from "@masseurmatch/db/actions/directory";
import { cityPath, DIRECTORY_REVALIDATE_SECONDS } from "@masseurmatch/db/actions/directory-config";

import { TherapistCard } from "@/components/therapist-card";
import { jsonLdScript, siteJsonLd } from "@/lib/jsonld";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const revalidate = DIRECTORY_REVALIDATE_SECONDS;

export const metadata: Metadata = {
  title: `${SITE_NAME} — Verified Male Massage Therapists`,
  description: SITE_DESCRIPTION,
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/"),
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Verified Male Massage Therapists`,
    description: SITE_DESCRIPTION,
  },
};

export default async function HomePage() {
  const [cities, therapists] = await Promise.all([getCities(), getVisibleTherapists()]);
  const featured = therapists.slice(0, 6);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(siteJsonLd()) }}
      />

      {/*
        The hero heading is the LCP element, so it carries no entrance
        animation — it must paint on the first frame.
      */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-16 pt-20">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">
          {SITE_NAME}
        </p>
        <h1 className="mt-5 max-w-3xl font-display text-ds-56 font-bold tracking-tight text-text-primary">
          Verified male massage therapists, without the guesswork.
        </h1>
        <p className="mt-5 max-w-2xl text-ds-18 text-text-secondary">{SITE_DESCRIPTION}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/search" className={buttonVariants({ size: "lg" })}>
            Find a therapist
          </Link>
          <Link href="/about" className={buttonVariants({ size: "lg", variant: "outline" })}>
            List your practice
          </Link>
        </div>
      </section>

      {cities.length > 0 ? (
        <section className="mx-auto w-full max-w-6xl px-6 py-12">
          <FadeIn whileInView className="space-y-2">
            <h2 className="font-display text-ds-32 font-bold tracking-tight text-text-primary">
              Browse by city
            </h2>
            <p className="text-text-secondary">
              {cities.length} {cities.length === 1 ? "city" : "cities"} with therapists listed
              today.
            </p>
          </FadeIn>

          <StaggerList
            whileInView
            as="ul"
            className="mt-8 grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-3 lg:grid-cols-4"
          >
            {cities.map((city) => (
              <StaggerItem as="li" key={cityPath(city)}>
                <Link
                  href={cityPath(city)}
                  className="block rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <Card className="h-full">
                    <CardContent className="p-5 pt-5">
                      <p className="font-display text-ds-18 font-semibold text-text-primary">
                        {city.name}
                      </p>
                      <p className="mt-1 text-sm text-text-secondary">{city.state}</p>
                      <p className="mt-3 text-xs text-text-secondary">
                        {city.therapistCount}{" "}
                        {city.therapistCount === 1 ? "therapist" : "therapists"}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </StaggerItem>
            ))}
          </StaggerList>
        </section>
      ) : null}

      {featured.length > 0 ? (
        <section className="mx-auto w-full max-w-6xl px-6 py-12">
          <FadeIn whileInView className="space-y-2">
            <h2 className="font-display text-ds-32 font-bold tracking-tight text-text-primary">
              Featured therapists
            </h2>
            <p className="text-text-secondary">Verified profiles, ranked by standing.</p>
          </FadeIn>

          <StaggerList
            whileInView
            as="ul"
            className="mt-8 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3"
          >
            {featured.map((therapist) => (
              <StaggerItem as="li" key={therapist.id}>
                <TherapistCard therapist={therapist} />
              </StaggerItem>
            ))}
          </StaggerList>
        </section>
      ) : null}

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <Card>
          <CardContent className="flex flex-col gap-5 p-10 pt-10 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
                Are you a massage therapist?
              </h2>
              <p className="max-w-xl text-text-secondary">
                Get a verified profile, real booking requests, and a listing clients can trust.
              </p>
            </div>
            <Link href="/about" className={buttonVariants({ size: "lg" })}>
              Join MasseurMatch
            </Link>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
