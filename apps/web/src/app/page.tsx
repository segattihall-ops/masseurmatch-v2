import type { Metadata } from "next";
import Link from "next/link";
import { ScrollCue, ScrollParallax, ScrollProgressBar } from "@masseurmatch/ui";
import {
  getCities,
  getProfileBySlug,
  getVisibleTherapists,
} from "@masseurmatch/db/actions/directory";
import {
  DIRECTORY_REVALIDATE_SECONDS,
  type TherapistListing,
} from "@masseurmatch/db/actions/directory-config";

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

function usableImage(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

async function hydrateFeaturedPhotos(therapists: TherapistListing[]): Promise<TherapistListing[]> {
  const results = await Promise.allSettled(
    therapists.map(async (therapist) => {
      if (usableImage(therapist.avatar_url) || usableImage(therapist.photo_url)) {
        return therapist;
      }

      const profile = await getProfileBySlug(therapist.slug);
      const approvedPhoto = profile?.photos.find((photo) => usableImage(photo.url))?.url;

      return approvedPhoto ? { ...therapist, photo_url: approvedPhoto } : therapist;
    }),
  );

  return therapists.map((therapist, index) => {
    const result = results[index];
    return result?.status === "fulfilled" ? result.value : therapist;
  });
}

export default async function HomePage() {
  const [citiesResult, therapistsResult] = await Promise.allSettled([
    getCities(),
    getVisibleTherapists(),
  ]);

  const cities = citiesResult.status === "fulfilled" ? citiesResult.value : [];
  const therapists = therapistsResult.status === "fulfilled" ? therapistsResult.value : [];
  const featured = await hydrateFeaturedPhotos(therapists.slice(0, 6));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(siteJsonLd()) }}
      />

      <ScrollProgressBar className="bg-brand-secondary" />

      <section
        aria-labelledby="home-hero-title"
        className="relative flex min-h-[calc(100svh-4rem)] w-full flex-col overflow-hidden px-5 pb-5 sm:px-8 sm:pb-7 lg:px-12 xl:px-16 2xl:px-24"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 lg:block"
        >
          <ScrollParallax distance={24} className="absolute right-[-8%] top-[11%] h-[58%] w-[72%]">
            <div className="h-full w-full rounded-full bg-brand-soft/70 blur-3xl" />
          </ScrollParallax>
          <ScrollParallax distance={14} className="absolute bottom-[14%] right-[13%] h-44 w-44">
            <div className="h-full w-full rounded-full border border-brand-secondary/15 bg-bg-surface/60" />
          </ScrollParallax>
        </div>

        <div className="relative z-10 flex flex-1 items-center py-[clamp(2rem,6vh,5.5rem)]">
          <div className="w-full max-w-5xl text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary sm:text-sm">
              {SITE_NAME}
            </p>

            <h1
              id="home-hero-title"
              className="mt-[clamp(1rem,3vh,1.75rem)] max-w-[940px] text-left font-display text-[clamp(2.55rem,7.4vmin,5.25rem)] font-bold leading-[1.01] tracking-[-0.04em] text-text-primary"
            >
              Verified male massage therapists, without the guesswork.
            </h1>

            <h2 className="mt-[clamp(1rem,2.6vh,1.75rem)] max-w-4xl text-left font-sans text-[clamp(1rem,2.4vmin,1.35rem)] font-normal leading-[1.55] text-text-secondary">
              {SITE_DESCRIPTION}
            </h2>

            <div className="mt-[clamp(1.5rem,4vh,2.5rem)] flex max-w-[560px] flex-col gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/search"
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-brand-secondary px-6 text-sm font-semibold text-text-inverse transition duration-200 hover:-translate-y-0.5 hover:bg-action-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:min-h-14 sm:px-8 sm:text-base lg:min-h-[60px]"
              >
                Find a therapist
              </Link>
              <Link
                href="/for-therapists"
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-border-strong bg-bg-surface/90 px-6 text-sm font-semibold text-text-primary transition duration-200 hover:-translate-y-0.5 hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:min-h-14 sm:px-8 sm:text-base lg:min-h-[60px]"
              >
                List your practice
              </Link>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-auto pt-[clamp(1rem,3vh,2.25rem)]">
          <div className="grid grid-cols-3 gap-3 border-t border-border-subtle pt-4 sm:gap-6 sm:pt-6 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end lg:gap-10">
            {discoverySignals.map(([title, description]) => (
              <div key={title} className="min-w-0 text-left">
                <p className="font-display text-xs font-semibold leading-5 text-text-primary sm:text-base lg:text-ds-18">
                  {title}
                </p>
                <p className="mt-1 hidden text-sm text-text-secondary sm:block">{description}</p>
              </div>
            ))}

            <a
              href="#explore-home"
              className="col-span-3 mt-1 inline-flex w-fit text-sm font-semibold text-brand-secondary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:col-span-1 lg:mt-0 lg:justify-self-end"
            >
              <ScrollCue>
                Scroll to explore
                <span aria-hidden="true">↓</span>
              </ScrollCue>
            </a>
          </div>
        </div>
      </section>

      <div id="explore-home" className="scroll-mt-4">
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
