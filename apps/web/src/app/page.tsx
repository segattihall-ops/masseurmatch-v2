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

import { KnottyChat } from "./knotty-chat";

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
    <div className="overflow-clip bg-bg-surface text-text-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(siteJsonLd()) }}
      />

      <ScrollProgressBar className="bg-brand-secondary" />

      <section
        aria-labelledby="home-hero-title"
        className="relative isolate overflow-hidden bg-[#0d0d0f] text-white"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.035) 1px, transparent 0)",
            backgroundSize: "30px 30px",
          }}
        />
        <div aria-hidden="true" className="pointer-events-none absolute -right-36 top-8 sm:-right-20">
          <ScrollParallax
            distance={34}
            className="h-[30rem] w-[30rem] rounded-full bg-brand-secondary/15 blur-3xl sm:h-[38rem] sm:w-[38rem]"
          >
            <span className="block h-full w-full" />
          </ScrollParallax>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/30 to-transparent"
        />

        <div className="relative mx-auto flex min-h-[clamp(36rem,78svh,52rem)] w-full max-w-6xl flex-col justify-center px-6 pb-20 pt-24 sm:pb-24 sm:pt-28 lg:pb-28 lg:pt-32">
          <div className="max-w-5xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#d66b7a]">
              {SITE_NAME}
            </p>

            <h1
              id="home-hero-title"
              className="mt-5 max-w-5xl font-display text-[clamp(2.75rem,7vw,6.5rem)] font-bold leading-[0.96] tracking-[-0.045em] text-white"
            >
              Verified male massage therapists,
              <span className="mt-2 block text-[#d66b7a] sm:mt-3">without the guesswork.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-7 text-white/68 sm:text-lg sm:leading-8">
              {SITE_DESCRIPTION}
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/search"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand-secondary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-secondary/15 transition duration-300 hover:-translate-y-0.5 hover:bg-action-primary-hover hover:shadow-xl"
              >
                Find a therapist
                <span aria-hidden="true" className="ml-2">
                  →
                </span>
              </Link>
              <Link
                href="/for-therapists"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:border-white/25 hover:bg-white/[0.1]"
              >
                List your practice
                <span aria-hidden="true" className="ml-2">
                  →
                </span>
              </Link>
            </div>
          </div>

          <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.08] sm:grid-cols-3 lg:mt-20">
            {discoverySignals.map(([title, description]) => (
              <div key={title} className="bg-[#111113]/95 p-6 sm:p-7">
                <p className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  {title}
                </p>
                <p className="mt-2 text-sm leading-6 text-white/55">{description}</p>
              </div>
            ))}
          </div>

          <a
            href="#explore-home"
            className="absolute bottom-6 left-6 hidden text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35 hover:text-white/60 sm:block"
          >
            <ScrollCue>
              Scroll to explore <span aria-hidden="true">↓</span>
            </ScrollCue>
          </a>
        </div>
      </section>

      <div id="explore-home" className="scroll-mt-4">
        <HomeFeaturedTherapists therapists={featured} />
        <HomeDiscoverySection />
        <HomeCityDiscovery cities={cities} />

        {/* After the listings on purpose: someone who already found who they
            wanted should not be asked whether they need help finding someone. */}
        <section className="bg-bg-surface px-6 py-16 sm:py-20">
          <div className="mx-auto w-full max-w-6xl">
            <KnottyChat />
          </div>
        </section>

        <HomeHowItWorks />
        <HomeTrustSection />
        <HomeProviderGrowth />
        <HomeFaq />
        <HomeFinalCta />
      </div>
    </div>
  );
}
