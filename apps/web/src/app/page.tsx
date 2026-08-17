import type { Metadata } from "next";
import { getCities, getVisibleTherapists } from "@masseurmatch/db/actions/directory";
import {
  DIRECTORY_REVALIDATE_SECONDS,
  profilePath,
  therapistName,
} from "@masseurmatch/db/actions/directory-config";

import {
  CityDiscoverySection,
  DifferentiatorsSection,
  FeaturedTherapistsSection,
  FinalCtaSection,
  HomeFaqSection,
  HomeHero,
  HowItWorksSection,
  ProviderCtaSection,
  TrustSection,
} from "@/components/home/home-sections";
import { jsonLdScript, siteJsonLd } from "@/lib/jsonld";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

export const revalidate = DIRECTORY_REVALIDATE_SECONDS;

const HOME_TITLE = `${SITE_NAME} — Find Independent Massage Therapists`;
const HOME_DESCRIPTION =
  "Discover independent massage therapists by city, specialties and public profile details. Compare profiles on MasseurMatch and contact therapists directly.";

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

export default async function HomePage() {
  const [citiesResult, therapistsResult] = await Promise.allSettled([
    getCities(),
    getVisibleTherapists(),
  ]);

  const cities = citiesResult.status === "fulfilled" ? citiesResult.value : [];
  const therapists = therapistsResult.status === "fulfilled" ? therapistsResult.value : [];
  const featured = therapists.slice(0, 6);

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: absoluteUrl("/"),
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
    ...(featured.length > 0
      ? {
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: featured.length,
            itemListElement: featured.flatMap((therapist, index) => {
              const path = profilePath(therapist);
              if (!path) return [];

              return [
                {
                  "@type": "ListItem",
                  position: index + 1,
                  name: therapistName(therapist),
                  url: absoluteUrl(path),
                },
              ];
            }),
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(siteJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(collectionJsonLd) }}
      />

      <HomeHero therapistCount={therapists.length} cityCount={cities.length} />
      <FeaturedTherapistsSection therapists={featured} />
      <CityDiscoverySection cities={cities} />
      <HowItWorksSection />
      <DifferentiatorsSection />
      <TrustSection therapistCount={therapists.length} cityCount={cities.length} />
      <ProviderCtaSection />
      <HomeFaqSection />
      <FinalCtaSection />
    </>
  );
}
