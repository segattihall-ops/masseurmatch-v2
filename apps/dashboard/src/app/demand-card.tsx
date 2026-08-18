import { demandLabel, type DemandReading, type KeywordOpportunity } from "@masseurmatch/db/demand";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@masseurmatch/ui";

/**
 * Demand Radar, on the dashboard home.
 *
 * The city, not the therapist. What they do about it is the Coach's job, and
 * splitting them keeps this card from turning into a second to-do list.
 *
 * Renders nothing when the city has no reading. Most cities do not have one,
 * and a card saying "0" would read as "nobody wants you here" rather than
 * "we have not measured this yet".
 */
export function DemandCard({
  city,
  reading,
  keywords,
}: {
  city: string | null;
  reading: DemandReading | null;
  keywords: KeywordOpportunity[];
}) {
  if (!reading && keywords.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demand in {city ?? "your city"}</CardTitle>
        <CardDescription>{demandLabel(reading)}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {reading ? (
          <p className="font-stat text-ds-32 text-text-primary">
            {reading.score}
            <span className="text-base font-normal text-text-secondary"> out of 100</span>
          </p>
        ) : null}

        {keywords.length > 0 ? (
          <div className="space-y-1">
            <p className="text-sm text-text-muted">Searched more this week</p>
            <ul className="space-y-1 text-sm text-text-secondary">
              {keywords.map((k) => (
                <li key={k.keyword}>
                  {k.keyword} <span className="text-text-muted">+{Math.round(k.change)}%</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
