import type { Metadata } from "next";
import Link from "next/link";
import { getCities, getVisibleTherapists } from "@masseurmatch/db/actions/directory";
import { DIRECTORY_REVALIDATE_SECONDS } from "@masseurmatch/db/actions/directory-config";

import {
  HomeCityDiscovery,
  HomeDiscoverySection,
  HomeFaq,
  HomeFeaturedTherapists,
  HomeFinalCta,
  HomeHowItWorks,
  HomeProviderGrowth,
  HomeTrustSection,
} from "@/components/home/home-showcase-sections";
import { jsonLdScript, siteJsonLd } from "@/lib/jsonld";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const revalidate = DIRECTORY_REVALIDATE_SECONDS;

const HOME_TITLE = `${SITE_NAME} — Verified Male Massage Therapists`;

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: SITE_DESCRIPTION,
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/"),
    siteName: SITE_NAME,
    title: HOME_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: HOME_TITLE,
    description: SITE_DESCRIPTION,
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
            Verified male massage therapists, without the guesswork.
          </h1>

          <p className="mt-7 max-w-4xl text-ds-18 leading-8 text-text-secondary sm:text-[1.35rem] sm:leading-9">
            {SITE_DESCRIPTION}
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
        <HomeFeaturedTherapists therapists={featured} />
        <HomeDiscoverySection />
        <HomeCityDiscovery cities={cities} />
        <HomeHowItWorks />
        <HomeTrustSection />
        <HomeProviderGrowth />
        <HomeFaq />
        <HomeFinalCta />
      </div>
    </>
  );
}
