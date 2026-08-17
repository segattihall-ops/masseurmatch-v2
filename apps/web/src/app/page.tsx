import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardContent,
  FadeIn,
  StaggerItem,
  StaggerList,
  buttonVariants,
} from "@masseurmatch/ui";
import { getCities, getVisibleTherapists } from "@masseurmatch/db/actions/directory";
import { cityPath, DIRECTORY_REVALIDATE_SECONDS } from "@masseurmatch/db/actions/directory-config";

import { TherapistCard } from "@/components/therapist-card";
import { jsonLdScript, siteJsonLd } from "@/lib/jsonld";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

export const revalidate = DIRECTORY_REVALIDATE_SECONDS;

const HOME_TITLE = `${SITE_NAME} — Male Massage Therapist Directory`;
const HOME_DESCRIPTION =
  "Discover reviewed public profiles from independent male massage therapists. Browse by city and service, then contact therapists directly.";

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/"),
    siteName: SITE_NAME,
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
};

const discoverySignals = [
  ["Reviewed profiles", "Before public approval"],
  ["Direct contact", "No booking middleman"],
  ["Local discovery", "City and service pages"],
] as const;

export default async function HomePage() {
  const [citiesResult, therapistsResult] = await Promise.allSettled([
    getCities(),
    getVisibleTherapists(),
  ]);

  const cities = citiesResult.status === "fulfilled" ? citiesResult.value : [];
  const therapists = therapistsResult.status === "fulfilled" ? therapistsResult.value : [];
  const featured = therapists.slice(0, 6);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(siteJsonLd()) }}
      />

      {/* The H1 is intentionally static so the first meaningful paint is not animation-blocked. */}
      <section className="flex min-h-[calc(100svh-1rem)] w-full flex-col px-6 pb-8 pt-16 sm:px-10 sm:pb-10 sm:pt-20 lg:px-16 xl:px-24">
        <div className="max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary sm:text-sm">
            {SITE_NAME}
          </p>

          <h1 className="mt-7 max-w-[940px] font-display text-[clamp(3.25rem,5vw,5.25rem)] font-bold leading-[1.02] tracking-[-0.035em] text-text-primary">
            Reviewed male massage therapist profiles, without the guesswork.
          </h1>

          <p className="mt-7 max-w-4xl text-ds-18 leading-8 text-text-secondary sm:text-[1.35rem] sm:leading-9">
            A premium directory for discovering independent male massage therapists, comparing
            public profile details, and contacting providers directly.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/search"
              className="inline-flex min-h-14 items-center justify-center rounded-full bg-brand-secondary px-9 text-base font-semibold text-text-inverse transition-colors hover:bg-action-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:min-h-[68px] sm:min-w-[242px] sm:text-lg"
            >
              Find a therapist
            </Link>
            <Link
              href="/for-therapists"
              className="inline-flex min-h-14 items-center justify-center rounded-full border border-border-strong bg-bg-surface px-9 text-base font-semibold text-text-primary transition-colors hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:min-h-[68px] sm:min-w-[260px] sm:text-lg"
            >
              List your practice
            </Link>
          </div>
        </div>

        <div className="mt-auto pt-14 sm:pt-16 lg:pt-20">
          <div className="grid gap-7 border-t border-border-subtle pt-7 sm:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end lg:gap-10">
            {discoverySignals.map(([title, description]) => (
              <div key={title}>
                <p className="font-display text-base font-semibold text-text-primary sm:text-ds-18">
                  {title}
                </p>
                <p className="mt-1 text-sm text-text-secondary">{description}</p>
              </div>
            ))}

            <a
              href="#explore-home"
              className="text-sm font-semibold text-brand-secondary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:col-span-3 lg:col-span-1 lg:justify-self-end"
            >
              Scroll to explore.
            </a>
          </div>
        </div>
      </section>

      <div id="explore-home">
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
              <p className="text-text-secondary">Reviewed public profiles, ranked by standing.</p>
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
                  Create a reviewed public profile, improve local discovery, and let prospective
                  clients contact you directly.
                </p>
              </div>
              <Link href="/for-therapists" className={buttonVariants({ size: "lg" })}>
                Join MasseurMatch
              </Link>
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
}
