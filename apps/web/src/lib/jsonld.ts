import type {
  CityListing,
  ProfileDetail,
  TherapistListing,
} from "@masseurmatch/db/actions/directory-config";
import { profilePath, therapistName } from "@masseurmatch/db/actions/directory-config";

import { absoluteUrl, SITE_NAME, SITE_URL } from "./site";

/**
 * JSON-LD builders.
 *
 * Returned as plain objects; pages serialise them into a
 * `<script type="application/ld+json">`. Nothing here is user-controlled
 * markup — values are JSON-encoded, never interpolated into HTML.
 */

/** LocalBusiness for one therapist. */
export function therapistJsonLd(profile: ProfileDetail) {
  const path = profilePath(profile);
  const name = therapistName(profile);

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": path ? absoluteUrl(path) : undefined,
    name,
    url: path ? absoluteUrl(path) : undefined,
    description: profile.seo_description ?? profile.headline ?? profile.bio ?? undefined,
    image: profile.avatar_url ?? profile.photo_url ?? undefined,
    ...(profile.city && profile.state
      ? {
          address: {
            "@type": "PostalAddress",
            addressLocality: profile.city,
            addressRegion: profile.state,
            postalCode: profile.zip_code ?? undefined,
            addressCountry: "US",
          },
        }
      : {}),
    ...(profile.latitude !== null && profile.longitude !== null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: profile.latitude,
            longitude: profile.longitude,
          },
        }
      : {}),
    ...(profile.rating_average && profile.review_count
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: profile.rating_average,
            reviewCount: profile.review_count,
          },
        }
      : {}),
    knowsLanguage: profile.languages ?? undefined,
    makesOffer: (profile.service_categories ?? []).map((service) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: service },
    })),
  };
}

/** ItemList for a city page. */
export function cityItemListJsonLd(city: CityListing, therapists: TherapistListing[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Massage therapists in ${city.name}, ${city.state}`,
    numberOfItems: therapists.length,
    itemListElement: therapists.map((therapist, index) => {
      const path = profilePath(therapist);
      return {
        "@type": "ListItem",
        position: index + 1,
        name: therapistName(therapist),
        url: path ? absoluteUrl(path) : undefined,
      };
    }),
  };
}

/** Organization + site search, emitted once on the home page. */
export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl("/search?q={search_term_string}"),
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** Serialise for a `<script type="application/ld+json">` body. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
