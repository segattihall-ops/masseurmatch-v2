import { demandLabel } from "@masseurmatch/db/demand";
import Link from "next/link";

import type { MyCityDemand } from "@/lib/demand";

import { PageHeader } from "./page-header";
import { DetailRow, EmptyState, Section } from "./section";

/**
 * Demand Radar.
 *
 * ---------------------------------------------------------------------------
 * What was removed, and why
 * ---------------------------------------------------------------------------
 * The page this replaces ended in three "Market Insights" cards that were
 * literal strings in the source: every therapist was told they rank "in the top
 * 25% for your service area", that "market rates for your services are trending
 * upward", and that "clients in your area frequently book on weekends". None of
 * it was measured. A therapist acting on the pricing line would be raising
 * their rates because of a sentence somebody typed.
 *
 * So the page now shows the four things the collector actually writes — the
 * week's score, its direction, how crowded the city is, and which searches are
 * rising — and says plainly when there is nothing. `packages/db/demand.ts`
 * already drops sample and expired rows, so a city with no reading reaches this
 * as `null` rather than as a stale number.
 *
 * `available: false` and `reading: null` are different answers and are worded
 * differently: the first means the radar could not be read at all, the second
 * means it was read and this city is not in it. Most cities are not in it.
 */
export function ProDemandRadar({ demand }: { demand: MyCityDemand }) {
  const place = [demand.city?.trim(), demand.state?.trim()].filter(Boolean).join(", ");
  const reading = demand.reading;

  return (
    <>
      <PageHeader
        eyebrow="Provider dashboard"
        title="Demand radar"
        subtitle={
          place
            ? `What we can see about demand in ${place}.`
            : "What we can see about demand where you work."
        }
      />

      {!place ? (
        <Section
          title="Your city"
          description="The radar reads one city — yours — so it needs to know which one."
        >
          <EmptyState>
            Add your city and state to your listing and the radar will start reporting on them.{" "}
            <Link href="/profile" className="underline underline-offset-4">
              Edit your listing
            </Link>
          </EmptyState>
        </Section>
      ) : !demand.available ? (
        <Section title="This week">
          <EmptyState>
            The radar is not reachable on this account right now. Nothing is wrong with your listing
            — try again later.
          </EmptyState>
        </Section>
      ) : (
        <>
          <Section
            title="This week"
            description={`Collected for ${place}. Sample and expired readings are never shown.`}
          >
            {reading ? (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <Stat label="Demand score" value={String(reading.score)} hint="Out of 100" />
                  <Stat
                    label="Direction"
                    value={
                      reading.direction === "rising"
                        ? "Rising"
                        : reading.direction === "cooling"
                          ? "Cooling"
                          : "Steady"
                    }
                    hint="Against last week"
                  />
                  <Stat
                    label="Competition"
                    value={reading.competition === null ? "—" : String(reading.competition)}
                    hint={
                      reading.competition === null ? "Not reported this week" : "Higher is busier"
                    }
                  />
                </div>

                <p className="mt-4 text-sm text-muted-foreground">
                  {demandLabel(reading)}
                  {reading.weekStart
                    ? ` Week beginning ${new Date(reading.weekStart).toLocaleDateString()}.`
                    : ""}
                </p>
              </>
            ) : (
              <EmptyState>
                No reading for {place} yet. Most cities have none — it means nobody has collected
                for yours, not that demand there is low.
              </EmptyState>
            )}
          </Section>

          <Section
            title="Searches gaining ground"
            description="Only terms that grew week over week. Words nobody is searching for are not something you can act on."
          >
            {demand.keywords.length === 0 ? (
              <EmptyState>Nothing is rising in {place} this week.</EmptyState>
            ) : (
              <ul className="space-y-2">
                {demand.keywords.map((keyword) => (
                  <li
                    key={keyword.keyword}
                    className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 rounded-lg border border-border p-3"
                  >
                    <span className="font-medium text-foreground">{keyword.keyword}</span>
                    <span className="text-xs text-muted-foreground">
                      Search score {keyword.score} · up {Math.round(keyword.change)}% this week
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Your city, in numbers">
            <div>
              <DetailRow label="City" value={place} />
              <DetailRow
                label="Other therapists listed here"
                value={
                  demand.peers === 0 ? "None we can see" : `${demand.peers} publicly listed today`
                }
              />
              <DetailRow
                label="Rising searches"
                value={demand.keywords.length === 0 ? "None this week" : demand.keywords.length}
              />
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              Rising searches are worth putting in your headline or bio — but only the ones you
              actually offer. The radar is a preview and reports what our collector has gathered for
              your city; it is not a forecast, and it does not know your calendar.
            </p>
          </Section>
        </>
      )}
    </>
  );
}

/** One reading. Small enough that a shared component would be indirection. */
function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold leading-tight text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
