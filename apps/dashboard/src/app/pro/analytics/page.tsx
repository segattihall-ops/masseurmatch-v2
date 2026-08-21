import { trendLabel } from "@masseurmatch/db/analytics";

import { PageHeader } from "@/components/pro/page-header";
import { DetailRow, EmptyState, Section } from "@/components/pro/section";
import { ANALYTICS_WINDOW_DAYS, getMyViewAnalytics } from "@/lib/analytics";
import { requireTherapist } from "@/lib/guards";
import { getOrCreateMyProfile } from "@/lib/profile";

export const metadata = { title: "Analytics | MasseurMatch" };
export const dynamic = "force-dynamic";

/**
 * Views, where they came from, and where the people were.
 *
 * Everything here is counted from real rows. Where the sample is too small to
 * support a comparison the page says so rather than manufacturing a percentage
 * — the figure it replaced was decoration.
 */
export default async function ProAnalyticsPage() {
  const viewer = await requireTherapist("/pro/analytics");
  const { profile } = await getOrCreateMyProfile(viewer.user.id);
  const stats = await getMyViewAnalytics(profile.id);

  return (
    <>
      <PageHeader
        eyebrow="Provider dashboard"
        title="Analytics"
        subtitle={`Profile views over the last ${ANALYTICS_WINDOW_DAYS} days.`}
      />

      {!stats.available ? (
        <Section title="Profile views">
          <EmptyState>View analytics are not available on this account yet.</EmptyState>
        </Section>
      ) : (
        <>
          <Section
            title="Profile views"
            description={trendLabel(stats.trend, ANALYTICS_WINDOW_DAYS)}
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Views
                </p>
                <p className="mt-1 text-2xl font-semibold text-foreground">{stats.total}</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  People
                </p>
                <p className="mt-1 text-2xl font-semibold text-foreground">{stats.people}</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Previous window
                </p>
                <p className="mt-1 text-2xl font-semibold text-foreground">{stats.previous}</p>
              </div>
            </div>
          </Section>

          <Section title="Where they came from">
            {stats.topSources.length === 0 ? (
              <EmptyState>Not enough visits yet to say where people are finding you.</EmptyState>
            ) : (
              <div>
                {stats.topSources.map((source) => (
                  <DetailRow key={source.label} label={source.label} value={source.count} />
                ))}
              </div>
            )}
          </Section>

          <Section title="Where they were">
            {stats.topPlaces.length === 0 ? (
              <EmptyState>No location signal on this window&apos;s visits.</EmptyState>
            ) : (
              <div>
                {stats.topPlaces.map((place) => (
                  <DetailRow key={place.label} label={place.label} value={place.count} />
                ))}
              </div>
            )}
          </Section>
        </>
      )}
    </>
  );
}
