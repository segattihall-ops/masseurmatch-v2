import { accessTo } from "@masseurmatch/billing";
import { getProfileBySlug } from "@masseurmatch/db/actions/directory";
import {
  citySlug,
  DIRECTORY_REVALIDATE_SECONDS,
  therapistName,
} from "@masseurmatch/db/actions/directory-config";
import { resolveTier } from "@masseurmatch/db/tier-grants";
import { formatVisitDates, upcomingVisits, type TravelEntry } from "@masseurmatch/db/travel";
import { Avatar, Card, CardContent, FadeIn } from "@masseurmatch/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { absoluteUrl, SITE_NAME } from "@/lib/site";

/**
 * `/{state}/{city}/visiting/{slug}` — a therapist's tour page for one city.
 *
 * Exists because a visiting therapist is invisible to the city's own search
 * results: they live in Austin, so Austin is what their profile says, and
 * someone searching Denver never sees them. This page is the thing that ranks
 * for "massage therapist visiting Denver" while the visit is on.
 *
 * It renders only while there is an unfinished visit to that city. A tour page
 * for a trip that ended is a page about nothing, and leaving it up teaches
 * search engines that the site is full of them.
 *
 * Not statically prerendered. `generateStaticParams` would freeze the set of
 * (city, therapist) pairs at build time, and a visit added on Tuesday would
 * have no page until the next deploy — the opposite of what a travel feature is
 * for. It revalidates on the directory's own schedule instead.
 */

export const revalidate = DIRECTORY_REVALIDATE_SECONDS;
export const dynamicParams = true;

interface TourParams {
  params: { state: string; city: string; slug: string };
}

type TourData = {
  profile: NonNullable<Awaited<ReturnType<typeof getProfileBySlug>>>;
  visits: TravelEntry[];
  next: TravelEntry;
};

/**
 * Everything the page needs, or null if it should not exist.
 *
 * One function so `generateMetadata` and the page itself cannot disagree about
 * whether the page exists — the failure there is a 404 that still emits a
 * `<title>` promising a visit.
 */
async function tourData(params: TourParams["params"]): Promise<TourData | null> {
  const profile = await getProfileBySlug(params.slug);
  if (!profile) return null;

  // Paid feature. Free profiles still get the Visiting badge on their listing;
  // the indexed page of their own is what Standard buys.
  if (accessTo("tour-pages", resolveTier(profile)) !== "full") return null;

  const visits = upcomingVisits(profile.travel_schedule, params.city);
  const next = visits[0];
  if (!next) return null;

  // The URL carries a state too, and it has to be the state of the visit — not
  // of the therapist's home city, which is usually a different one.
  if (next.state && next.state.toLowerCase() !== params.state.toLowerCase()) return null;

  return { profile, visits, next };
}

function cityLabel(entry: TravelEntry): string {
  return entry.state ? `${entry.city}, ${entry.state}` : entry.city;
}

export async function generateMetadata({ params }: TourParams): Promise<Metadata> {
  const data = await tourData(params);
  if (!data) return { title: "Not found", robots: { index: false, follow: false } };

  const name = therapistName(data.profile);
  const where = cityLabel(data.next);
  const when = formatVisitDates(data.next);

  return {
    title: `${name} is visiting ${where} — ${when}`,
    description: `${name} is taking appointments in ${where} from ${when}. See services, rates and how to book during the visit.`,
    alternates: {
      canonical: absoluteUrl(`/${params.state}/${params.city}/visiting/${params.slug}`),
    },
    openGraph: {
      type: "profile",
      siteName: SITE_NAME,
      title: `${name} is visiting ${where}`,
      description: `Taking appointments ${when}.`,
    },
  };
}

export default async function TourPage({ params }: TourParams) {
  const data = await tourData(params);
  if (!data) notFound();

  const { profile, visits, next } = data;
  const name = therapistName(profile);
  const home =
    profile.city && profile.state
      ? `/${profile.state.toLowerCase()}/${citySlug(profile.city)}/${profile.slug}`
      : null;

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <FadeIn className="flex items-center gap-4">
        <Avatar size="xl" name={name} src={profile.avatar_url ?? profile.photo_url ?? undefined} />
        <div className="space-y-1">
          <h1 className="font-display text-ds-32 font-bold tracking-tight text-text-primary">
            {name} is visiting {cityLabel(next)}
          </h1>
          <p className="text-sm text-text-secondary">{formatVisitDates(next)}</p>
        </div>
      </FadeIn>

      {profile.headline ? <p className="mt-6 text-text-secondary">{profile.headline}</p> : null}

      {visits.length > 1 ? (
        <Card className="mt-8">
          <CardContent className="space-y-2 pt-6">
            <h2 className="text-sm font-medium text-text-primary">Other dates in {next.city}</h2>
            <ul className="space-y-1 text-sm text-text-secondary">
              {visits.slice(1).map((visit) => (
                <li key={`${visit.start_date}-${visit.end_date}`}>{formatVisitDates(visit)}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {/* The profile is where rates, services and contact live. Repeating them
          here would be two pages to keep in step, and this one exists to be
          found rather than to be the destination. */}
      {home ? (
        <p className="mt-8 text-sm">
          <Link
            href={home}
            className="text-text-primary underline underline-offset-4 hover:opacity-80"
          >
            See {name}&rsquo;s full profile, services and rates
          </Link>
        </p>
      ) : null}
    </main>
  );
}
