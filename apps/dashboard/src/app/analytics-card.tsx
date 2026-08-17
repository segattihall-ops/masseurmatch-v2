import { trendLabel, type ViewStats } from "@masseurmatch/db/analytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@masseurmatch/ui";

/**
 * Profile views, on the dashboard home.
 *
 * A server component: numbers and two short lists, no interaction.
 *
 * The page this replaces printed "1,284 profile views, +12% vs last week" with
 * nothing behind it. Everything here is counted from real rows, and where the
 * sample is too small to support a comparison the card says so instead of
 * manufacturing one.
 */
export function AnalyticsCard({
  stats,
  windowDays,
}: {
  stats: ViewStats & { available: boolean };
  windowDays: number;
}) {
  if (!stats.available) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile views</CardTitle>
        <CardDescription>Last {windowDays} days</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="font-stat text-ds-32 text-text-primary">
          {stats.total}
          <span className="text-base font-normal text-text-secondary">
            {" "}
            from {stats.people} {stats.people === 1 ? "person" : "people"}
          </span>
        </p>

        <p className="text-sm text-text-secondary">{trendLabel(stats.trend, windowDays)}</p>

        {stats.topPlaces.length > 0 ? (
          <p className="text-sm text-text-secondary">
            <span className="text-text-muted">Mostly from</span>{" "}
            {stats.topPlaces.map((p) => p.label).join(", ")}
          </p>
        ) : null}

        {stats.topSources.length > 0 ? (
          <p className="text-sm text-text-secondary">
            <span className="text-text-muted">Found via</span>{" "}
            {stats.topSources.map((s) => s.label).join(", ")}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
