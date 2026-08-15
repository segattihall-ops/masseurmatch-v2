import { notFound } from "next/navigation";
import {
  Avatar,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FadeIn,
  StaggerItem,
  StaggerList,
} from "@masseurmatch/ui";
import { getRankedTherapists } from "@masseurmatch/db/actions/ranking";
import { RANKING_REVALIDATE_SECONDS } from "@masseurmatch/db/actions/ranking-config";

/**
 * City directory — the first consumer of the ranking action.
 *
 * Rendered on demand rather than at build time: the ranking depends on live
 * subscription and moderation state, and the action caches its own result for
 * an hour, so there is nothing to gain from prerendering it.
 */
export const dynamic = "force-dynamic";
export const revalidate = RANKING_REVALIDATE_SECONDS;

export default async function CityDirectoryPage({ params }: { params: { city: string } }) {
  const therapists = await getRankedTherapists(params.city, { limit: 24 });

  if (therapists.length === 0) {
    notFound();
  }

  const cityName = therapists[0]?.city ?? params.city;

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <FadeIn className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">
          Directory
        </p>
        <h1 className="font-display text-ds-40 font-bold tracking-tight text-text-primary">
          Massage therapists in {cityName}
        </h1>
        <p className="text-ds-18 text-text-secondary">
          {therapists.length} verified {therapists.length === 1 ? "therapist" : "therapists"},
          ranked by standing and distance.
        </p>
      </FadeIn>

      <StaggerList
        as="ul"
        className="mt-12 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3"
      >
        {therapists.map((therapist) => (
          <StaggerItem as="li" key={therapist.id}>
            <Card className="h-full">
              <CardHeader className="flex-row items-center gap-4 space-y-0">
                <Avatar size="lg" name={therapist.display_name} />
                <div className="space-y-1">
                  <CardTitle>{therapist.display_name}</CardTitle>
                  <CardDescription>
                    {therapist.city}
                    {therapist.state ? `, ${therapist.state}` : ""}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {therapist.headline ? (
                  <p className="text-sm text-text-secondary">{therapist.headline}</p>
                ) : null}
                <p className="text-xs text-text-muted">
                  {[
                    therapist.offers_incall ? "Incall" : null,
                    therapist.offers_outcall ? "Outcall" : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </StaggerList>
    </main>
  );
}
