import { createSessionClient } from "@masseurmatch/db/auth";
import { TrendingUp } from "lucide-react";

import { getCityDemand } from "@/lib/demand";
import { getOrCreateMyProfile } from "@/lib/profile";

export default async function DemandRadarPage() {
  const supabase = createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { profile } = await getOrCreateMyProfile(user.id);
  const demand = await getCityDemand(profile?.city ?? null, profile?.state ?? null, user.id);

  return (
    <div className="space-y-6 px-4 py-6 sm:space-y-8 sm:p-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-brand-primary" />
          <h1 className="text-2xl font-bold sm:text-3xl text-text-primary">Demand Radar</h1>
        </div>
        <p className="text-text-secondary">
          Track local demand trends for your services and optimize your strategy
        </p>
      </div>

      {demand.available ? (
        <div className="rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">Local Market Demand</h2>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs font-medium uppercase text-text-secondary">Demand Score</p>
                <p className="mt-2 text-2xl font-bold text-text-primary">
                  {demand.reading?.score ?? "—"}
                </p>
                <p className="mt-1 text-xs text-text-secondary">Your local market strength</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs font-medium uppercase text-text-secondary">Trend</p>
                <p className="mt-2 text-2xl font-bold text-text-primary">
                  {demand.reading?.direction === "rising"
                    ? "↑ Rising"
                    : demand.reading?.direction === "cooling"
                      ? "↓ Cooling"
                      : "→ Steady"}
                </p>
                <p className="mt-1 text-xs text-text-secondary">Market movement</p>
              </div>
            </div>

            <div className="rounded-lg bg-background p-4">
              <p className="text-sm text-text-secondary">
                Demand Radar shows keyword trends, competitor activity, and local search interest
                for your service area. Use this data to optimize your availability, pricing, and
                marketing.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">Local Market Demand</h2>
          <p className="text-sm text-text-secondary">
            No demand data available for your location yet. Complete your profile with your city and
            state to see market insights.
          </p>
        </div>
      )}

      {demand.keywords.length > 0 ? (
        <div className="rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">Top Keywords</h2>
          <div className="space-y-2">
            {demand.keywords.map((keyword) => (
              <div key={keyword.keyword} className="rounded-lg border border-border p-3">
                <p className="text-sm font-medium text-text-primary">{keyword.keyword}</p>
                <p className="text-xs text-text-secondary">
                  Search score: {keyword.score} · Week-over-week: +{keyword.change}%
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Market Insights</h2>
        <div className="space-y-3">
          <div className="rounded-lg border border-border p-4">
            <p className="font-medium text-text-primary">Competitive positioning</p>
            <p className="mt-1 text-sm text-text-secondary">
              You rank in the top 25% for your service area. Consider highlighting your specialties
              to attract more bookings.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="font-medium text-text-primary">Pricing opportunity</p>
            <p className="mt-1 text-sm text-text-secondary">
              Market rates for your services are trending upward. Consider reviewing your pricing
              strategy.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="font-medium text-text-primary">Availability trends</p>
            <p className="mt-1 text-sm text-text-secondary">
              Clients in your area frequently book on weekends. Ensure your availability matches
              demand peaks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
