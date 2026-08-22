import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getCities,
  getProfileBySlug,
  getVisibleTherapists,
  searchTherapists,
} from "@masseurmatch/db/actions/directory";
import {
  getPublicImportedReviews,
  getPublicProfileSupplement,
  type PublicProfileSupplement,
} from "@masseurmatch/db/actions/public-profile";
import {
  citySlug,
  DIRECTORY_REVALIDATE_SECONDS,
  therapistName,
  type CityListing,
  type DirectoryFilters,
  type ProfileDetail,
} from "@masseurmatch/db/actions/directory-config";

import { LegacyDirectoryLanding } from "@/components/legacy-directory-landing";
import { PublicProfilePage, type ProfileFaqItem } from "@/components/public-profile-page";
import { getLegacyKeyword, getLegacySegment, formatLegacyArea } from "@/content/legacy-directory";
import { hasImage } from "@/lib/cloudinary";
import { jsonLdScript, therapistJsonLd } from "@/lib/jsonld";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import { withApprovedProfilePhotos } from "@/lib/therapist-photos";

import { ViewBeacon } from "../../../view-beacon";

export const revalidate = DIRECTORY_REVALIDATE_SECONDS;

interface ProfileParams {
  params: { state: string; city: string; slug: string };
}

type LegacyLanding = {
  city: CityListing;
  title: string;
  intro: string;
  filters: DirectoryFilters;
  canonicalPath: string;
};

export async function generateStaticParams() {
  const therapists = await getVisibleTherapists();
  return therapists
    .filter((therapist) => therapist.city && therapist.state)
    .map((therapist) => ({
      state: therapist.state!.toLowerCase(),
      city: citySlug(therapist.city!),
      slug: therapist.slug,
    }));
}

async function getCanonicalProfile(params: ProfileParams["params"]): Promise<ProfileDetail | null> {
  const profile = await getProfileBySlug(params.slug);
  if (!profile?.city || !profile.state) return null;

  const stateMatches = profile.state.toLowerCase() === params.state.toLowerCase();
  const cityMatches = citySlug(profile.city) === params.city.toLowerCase();
  return stateMatches && cityMatches ? profile : null;
}

async function getLegacyCity(slug: string): Promise<CityListing | null> {
  const cities = await getCities();
  return cities.find((city) => city.citySlug === slug.toLowerCase()) ?? null;
}

function mergeLegacyFilters(first: DirectoryFilters, second: DirectoryFilters): DirectoryFilters {
  return {
    ...first,
    ...second,
    verified: Boolean(first.verified || second.verified) || undefined,
    lgbtq: Boolean(first.lgbtq || second.lgbtq) || undefined,
    availableNow: Boolean(first.availableNow || second.availableNow) || undefined,
  };
}

async function resolveLegacyLanding(
  params: ProfileParams["params"],
): Promise<LegacyLanding | null> {
  const legacyCity = await getLegacyCity(params.state);
  if (!legacyCity) return null;

  const canonicalPath = `/${params.state}/${params.city}/${params.slug}`;

  if (params.city === "areas") {
    const area = formatLegacyArea(params.slug);
    if (!area) return null;
    return {
      city: legacyCity,
      title: `Massage therapists in ${area}, ${legacyCity.name}, ${legacyCity.state}`,
      intro: `Browse public therapist profiles associated with ${area} and ${legacyCity.name}. Compare services, pricing, trust signals and direct-contact options.`,
      filters: { query: area },
      canonicalPath,
    };
  }

  const segment = getLegacySegment(params.city);
  const keyword = getLegacyKeyword(params.slug);
  if (!segment || !keyword) return null;

  return {
    city: legacyCity,
    title: `${keyword.label} in ${legacyCity.name}, ${legacyCity.state}`,
    intro: `${keyword.intro} ${segment.intro}`,
    filters: mergeLegacyFilters(segment.filters, keyword.filters),
    canonicalPath,
  };
}

function customFaqItems(value: unknown): ProfileFaqItem[] {
  let raw = value;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw) as unknown;
    } catch {
      return [];
    }
  }
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const question = String(record.question ?? record.q ?? "").trim();
      const answer = String(record.answer ?? record.a ?? "").trim();
      return question && answer ? { question, answer } : null;
    })
    .filter((item): item is ProfileFaqItem => Boolean(item));
}

function buildProfileFaq(
  profile: ProfileDetail,
  supplement: PublicProfileSupplement,
): ProfileFaqItem[] {
  const name = therapistName(profile).split(/\s+/)[0] || therapistName(profile);
  const custom = customFaqItems(supplement.custom_faq);
  const standard: ProfileFaqItem[] = [
    {
      question: `How do I contact ${name}?`,
      answer: `Use the public contact options shown on this profile. MasseurMatch is a directory, so availability, exact location, services and final rates are confirmed directly with ${name}.`,
    },
    {
      question: `Does ${name} offer incall or outcall?`,
      answer:
        profile.offers_incall && profile.offers_outcall
          ? `${name} lists both incall and outcall. Confirm the exact location or travel area directly before meeting.`
          : profile.offers_incall
            ? `${name} lists incall. Confirm the exact location and access details directly.`
            : profile.offers_outcall
              ? `${name} lists outcall. Confirm that your location is within the provider's service area.`
              : `The profile does not currently specify incall or outcall. Ask ${name} directly.`,
    },
    {
      question: `What do MasseurMatch verification badges mean on ${name}'s profile?`,
      answer:
        "Badges describe specific MasseurMatch profile or identity checks. They are not a professional-license verification, background check, guarantee, or endorsement.",
    },
  ];
  return [...custom, ...standard].filter(
    (item, index, array) =>
      array.findIndex((candidate) => candidate.question === item.question) === index,
  );
}

export async function generateMetadata({ params }: ProfileParams): Promise<Metadata> {
  const profile = await getCanonicalProfile(params);
  if (profile) {
    const [supplement] = await Promise.all([getPublicProfileSupplement(profile.id)]);
    const name = therapistName(profile);
    const location = profile.city && profile.state ? ` — ${profile.city}, ${profile.state}` : "";
    const title = profile.seo_title ?? `${name}${location}`;
    const description =
      profile.seo_description ??
      profile.headline ??
      profile.tagline ??
      `${name}, an independent massage therapist listed on ${SITE_NAME}.`;
    const canonical = absoluteUrl(`/${params.state}/${params.city}/${params.slug}`);
    const image = profile.avatar_url ?? profile.photo_url ?? profile.photos[0]?.url ?? null;

    return {
      title,
      description,
      keywords: supplement.seo_keywords ?? undefined,
      alternates: { canonical },
      openGraph: {
        type: "profile",
        url: canonical,
        siteName: SITE_NAME,
        title,
        description,
        ...(hasImage(image) ? { images: [{ url: image, alt: name }] } : {}),
      },
    };
  }

  const legacy = await resolveLegacyLanding(params);
  if (!legacy) return {};

  const matches = await searchTherapists({ ...legacy.filters, city: legacy.city.citySlug });
  const description = `${legacy.intro} Browse current public profiles on ${SITE_NAME}.`;
  const canonical = absoluteUrl(legacy.canonicalPath);

  return {
    title: legacy.title,
    description,
    alternates: { canonical },
    robots: matches.length === 0 ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      url: canonical,
      siteName: SITE_NAME,
      title: legacy.title,
      description,
    },
  };
}

export default async function ProfilePage({ params }: ProfileParams) {
  const profile = await getCanonicalProfile(params);

  if (!profile) {
    const legacy = await resolveLegacyLanding(params);
    if (!legacy) notFound();

    const rawTherapists = await searchTherapists({
      ...legacy.filters,
      city: legacy.city.citySlug,
    });
    const therapists = await withApprovedProfilePhotos(rawTherapists);

    return (
      <LegacyDirectoryLanding
        city={legacy.city}
        title={legacy.title}
        intro={legacy.intro}
        canonicalPath={legacy.canonicalPath}
        filters={legacy.filters}
        therapists={therapists}
      />
    );
  }

  const [supplement, reviews, nearby] = await Promise.all([
    getPublicProfileSupplement(profile.id),
    getPublicImportedReviews(profile.id, 100),
    profile.city
      ? searchTherapists({ city: citySlug(profile.city), state: profile.state?.toLowerCase() })
      : Promise.resolve([]),
  ]);
  const relatedProfiles = await withApprovedProfilePhotos(
    nearby.filter((therapist) => therapist.id !== profile.id).slice(0, 3),
  );
  const faqItems = buildProfileFaq(profile, supplement);
  const canonicalPath = `/${params.state}/${params.city}/${params.slug}`;
  const name = therapistName(profile);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      {
        "@type": "ListItem",
        position: 2,
        name: `${profile.city}, ${profile.state}`,
        item: absoluteUrl(`/${params.state}/${params.city}`),
      },
      { "@type": "ListItem", position: 3, name, item: absoluteUrl(canonicalPath) },
    ],
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <ViewBeacon profileId={profile.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(therapistJsonLd(profile)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(faqJsonLd) }}
      />
      <PublicProfilePage
        profile={profile}
        supplement={supplement}
        reviews={reviews}
        relatedProfiles={relatedProfiles}
        faqItems={faqItems}
        cityHref={`/${params.state}/${params.city}`}
      />
    </>
  );
}
