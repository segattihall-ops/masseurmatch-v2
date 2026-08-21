import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, Card, CardContent, FadeIn, StaggerItem, StaggerList } from "@masseurmatch/ui";
import {
  getCities,
  getProfileBySlug,
  getVisibleTherapists,
  searchTherapists,
} from "@masseurmatch/db/actions/directory";
import {
  citySlug,
  DIRECTORY_REVALIDATE_SECONDS,
  therapistName,
  type CityListing,
  type DirectoryFilters,
  type ProfileDetail,
} from "@masseurmatch/db/actions/directory-config";

import { LegacyDirectoryLanding } from "@/components/legacy-directory-landing";
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

/** Prerender every publicly visible profile that has a city to route under. */
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

/**
 * A slug alone is not enough to prove a canonical profile URL. Without this
 * location check, any `/anything/anything/{real-slug}` URL rendered the same
 * profile and created unlimited duplicate-content paths.
 */
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

function mergeLegacyFilters(
  first: DirectoryFilters,
  second: DirectoryFilters,
): DirectoryFilters {
  return {
    ...first,
    ...second,
    verified: Boolean(first.verified || second.verified) || undefined,
    lgbtq: Boolean(first.lgbtq || second.lgbtq) || undefined,
    availableNow: Boolean(first.availableNow || second.availableNow) || undefined,
  };
}

async function resolveLegacyLanding(params: ProfileParams["params"]): Promise<LegacyLanding | null> {
  const legacyCity = await getLegacyCity(params.state);
  if (!legacyCity) return null;

  const canonicalPath = `/${params.state}/${params.city}/${params.slug}`;

  // OLD neighborhood route: /{city}/areas/{area}
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

  // OLD long-tail route: /{city}/{segment}/{keyword}
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

export async function generateMetadata({ params }: ProfileParams): Promise<Metadata> {
  const profile = await getCanonicalProfile(params);
  if (profile) {
    const name = therapistName(profile);
    const location = profile.city && profile.state ? ` — ${profile.city}, ${profile.state}` : "";
    const title = profile.seo_title ?? `${name}${location}`;
    const description =
      profile.seo_description ??
      profile.headline ??
      profile.tagline ??
      `${name}, a verified male massage therapist on ${SITE_NAME}.`;
    const canonical = absoluteUrl(`/${params.state}/${params.city}/${params.slug}`);
    const image = profile.avatar_url ?? profile.photo_url;

    return {
      title,
      description,
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

  const name = therapistName(profile);
  const hero = profile.avatar_url ?? profile.photo_url;
  const services = [
    ...new Set([...(profile.service_categories ?? []), ...(profile.massage_techniques ?? [])]),
  ];

  return (
    <>
      {/* Client-side on purpose: this page is ISR-cached, so counting in the
          server component would report cache misses rather than visitors. */}
      <ViewBeacon profileId={profile.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(therapistJsonLd(profile)) }}
      />

      <main className="mx-auto w-full max-w-5xl px-6 pb-16 pt-12">
        <nav aria-label="Breadcrumb" className="text-sm text-text-secondary">
          <Link href={`/${params.state}/${params.city}`} className="hover:text-brand-secondary">
            {profile.city}, {profile.state}
          </Link>
        </nav>

        <header className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
          {hasImage(hero) ? (
            <Image
              src={hero}
              alt={name}
              width={160}
              height={160}
              sizes="160px"
              priority
              className="h-40 w-40 shrink-0 rounded-full border border-border object-cover shadow-soft"
            />
          ) : (
            <Avatar size="2xl" name={name} className="shrink-0" />
          )}

          <div className="space-y-2">
            <h1 className="font-display text-ds-40 font-bold tracking-tight text-text-primary">
              {name}
            </h1>
            {profile.headline ? (
              <p className="text-ds-18 text-text-secondary">{profile.headline}</p>
            ) : null}
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-secondary">
              {profile.city && profile.state ? (
                <span>
                  {profile.city}, {profile.state}
                </span>
              ) : null}
              {profile.is_verified_identity ? (
                <span className="font-semibold text-badge-verified">ID verified</span>
              ) : null}
              {profile.years_experience ? (
                <span>{profile.years_experience} years experience</span>
              ) : null}
              {profile.lgbtq_affirming ? <span>LGBTQ+ affirming</span> : null}
            </p>
          </div>
        </header>

        {profile.bio ? (
          <FadeIn whileInView className="mt-12 max-w-3xl">
            <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
              About
            </h2>
            <p className="mt-3 whitespace-pre-line text-text-secondary">{profile.bio}</p>
          </FadeIn>
        ) : null}

        {services.length > 0 ? (
          <FadeIn whileInView className="mt-12">
            <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
              Services
            </h2>
            <ul className="mt-4 flex list-none flex-wrap gap-2 p-0">
              {services.map((service) => (
                <li
                  key={service}
                  className="rounded-full bg-brand-soft px-3 py-1.5 text-sm font-medium text-brand-secondary"
                >
                  {service}
                </li>
              ))}
            </ul>
          </FadeIn>
        ) : null}

        {(profile.incall_price ?? profile.outcall_price) ? (
          <FadeIn whileInView className="mt-12">
            <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
              Pricing
            </h2>
            <Card className="mt-4">
              <CardContent className="flex flex-wrap gap-8 p-6 pt-6">
                {profile.incall_price ? (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-text-secondary">Incall</p>
                    <p className="font-stat text-ds-24 font-bold text-text-primary">
                      ${profile.incall_price}
                    </p>
                  </div>
                ) : null}
                {profile.outcall_price ? (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-text-secondary">Outcall</p>
                    <p className="font-stat text-ds-24 font-bold text-text-primary">
                      ${profile.outcall_price}
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </FadeIn>
        ) : null}

        {profile.photos.length > 0 ? (
          <section className="mt-12">
            <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
              Gallery
            </h2>
            <StaggerList
              whileInView
              as="ul"
              className="mt-4 grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-3"
            >
              {profile.photos.map((photo) => {
                const src = photo.url ?? photo.storagePath;
                if (!hasImage(src)) return null;
                return (
                  <StaggerItem as="li" key={photo.id}>
                    <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-bg-subtle">
                      <Image
                        src={src}
                        alt={`${name} — photo`}
                        fill
                        sizes="(min-width: 640px) 30vw, 45vw"
                        className="object-cover"
                      />
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerList>
          </section>
        ) : null}
      </main>
    </>
  );
}
