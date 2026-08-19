import { trendLabel } from "@masseurmatch/db/analytics";
import { createSessionClient } from "@masseurmatch/db/auth";
import { Eye, MessageSquare, MousePointerClick, TrendingUp, Users } from "lucide-react";

import { ANALYTICS_WINDOW_DAYS, getMyViewAnalytics } from "@/lib/analytics";
import { getOrCreateMyProfile } from "@/lib/profile";

export default async function GrowthAnalyticsPage() {
  const supabase = createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { profile } = await getOrCreateMyProfile(user.id);

  const [views, clicksRow, inquiryCount] = await Promise.all([
    getMyViewAnalytics(profile.id),
    supabase.from("profiles").select("contact_clicks").eq("id", user.id).maybeSingle(),
    supabase
      .from("contact_inquiries")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profile.id),
  ]);

  const contactClicks = (clicksRow.data as { contact_clicks?: number | null } | null)
    ?.contact_clicks;
  const inquiries = inquiryCount.count ?? 0;

  const cards = [
    {
      label: `Profile views · last ${ANALYTICS_WINDOW_DAYS} days`,
      value: views.available ? String(views.total) : "—",
      sub: views.available
        ? trendLabel(views.trend, ANALYTICS_WINDOW_DAYS)
        : "Analytics is warming up",
      icon: Eye,
      tint: "text-blue-500",
    },
    {
      label: "Unique visitors",
      value: views.available ? String(views.people) : "—",
      sub: `Distinct sessions, last ${ANALYTICS_WINDOW_DAYS} days`,
      icon: Users,
      tint: "text-green-500",
    },
    {
      label: "Contact clicks",
      value: contactClicks == null ? "—" : String(contactClicks),
      sub: "All time",
      icon: MousePointerClick,
      tint: "text-purple-500",
    },
    {
      label: "Inquiries",
      value: String(inquiries),
      sub: "All time",
      icon: MessageSquare,
      tint: "text-orange-500",
    },
  ];

  return (
    <div className="space-y-8 p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-text-primary">Growth Analytics</h1>
        <p className="text-text-secondary">
          Live numbers from your public profile — views, visitors, and how people reach out
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="space-y-2 rounded-lg border border-border bg-surface p-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-text-secondary">{card.label}</h3>
                <Icon className={`h-4 w-4 ${card.tint}`} />
              </div>
              <p className="text-3xl font-bold text-text-primary">{card.value}</p>
              <p className="text-xs text-text-secondary">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {views.available && (views.topSources.length > 0 || views.topPlaces.length > 0) ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4 rounded-lg border border-border bg-surface p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Where views come from</h2>
              <TrendingUp className="h-5 w-5 text-text-secondary" />
            </div>
            {views.topSources.length > 0 ? (
              <ul className="space-y-2">
                {views.topSources.map((source) => (
                  <li
                    key={source.label}
                    className="flex items-center justify-between border-b border-border pb-2 text-sm last:border-b-0"
                  >
                    <span className="text-text-primary">{source.label}</span>
                    <span className="font-medium text-text-secondary">{source.count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-text-secondary">No source data yet.</p>
            )}
          </div>

          <div className="space-y-4 rounded-lg border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold text-text-primary">Where your visitors are</h2>
            {views.topPlaces.length > 0 ? (
              <ul className="space-y-2">
                {views.topPlaces.map((place) => (
                  <li
                    key={place.label}
                    className="flex items-center justify-between border-b border-border pb-2 text-sm last:border-b-0"
                  >
                    <span className="text-text-primary">{place.label}</span>
                    <span className="font-medium text-text-secondary">{place.count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-text-secondary">No location data yet.</p>
            )}
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Tips to Increase Your Views</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 rounded-lg border border-border bg-surface p-6">
            <h3 className="font-semibold text-text-primary">Complete Your Profile</h3>
            <p className="text-sm text-text-secondary">
              Therapists with complete profiles get 70% more views. Fill in all your services,
              availability, and photos.
            </p>
          </div>
          <div className="space-y-2 rounded-lg border border-border bg-surface p-6">
            <h3 className="font-semibold text-text-primary">Add Professional Photos</h3>
            <p className="text-sm text-text-secondary">
              High-quality photos increase bookings. Make sure your photos are clear and
              professional.
            </p>
          </div>
          <div className="space-y-2 rounded-lg border border-border bg-surface p-6">
            <h3 className="font-semibold text-text-primary">Keep Rates Updated</h3>
            <p className="text-sm text-text-secondary">
              Regularly update your rates and availability to stay competitive in your market.
            </p>
          </div>
          <div className="space-y-2 rounded-lg border border-border bg-surface p-6">
            <h3 className="font-semibold text-text-primary">Respond to Inquiries</h3>
            <p className="text-sm text-text-secondary">
              Quick responses boost your rankings. Reply to inquiries within 2 hours when possible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
