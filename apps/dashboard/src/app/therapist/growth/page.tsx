import { createSessionClient } from "@masseurmatch/db/auth";
import { getProfile } from "@masseurmatch/db/actions/profile";
import { Eye, Click, MessageSquare, TrendingUp, Calendar } from "lucide-react";

export default async function GrowthAnalyticsPage() {
  const supabase = createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const profile = await getProfile(user.id);

  // Mock analytics data - replace with real data from database
  const stats = {
    views: 234,
    clicks: 45,
    inquiries: 12,
    bookings: 3,
  };

  return (
    <div className="space-y-8 p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-text-primary">Growth Analytics</h1>
        <p className="text-text-secondary">Track your profile performance and engagement</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2 rounded-lg border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-text-secondary">Profile Views</h3>
            <Eye className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-text-primary">{stats.views}</p>
          <p className="text-xs text-text-secondary">This month</p>
        </div>

        <div className="space-y-2 rounded-lg border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-text-secondary">Link Clicks</h3>
            <Click className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-text-primary">{stats.clicks}</p>
          <p className="text-xs text-text-secondary">This month</p>
        </div>

        <div className="space-y-2 rounded-lg border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-text-secondary">Inquiries</h3>
            <MessageSquare className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-text-primary">{stats.inquiries}</p>
          <p className="text-xs text-text-secondary">This month</p>
        </div>

        <div className="space-y-2 rounded-lg border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-text-secondary">Bookings</h3>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-text-primary">{stats.bookings}</p>
          <p className="text-xs text-text-secondary">This month</p>
        </div>
      </div>

      {/* Performance Timeline */}
      <div className="space-y-4 rounded-lg border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Performance Timeline</h2>
          <Calendar className="h-5 w-5 text-text-secondary" />
        </div>

        <div className="space-y-4">
          {/* Weekly breakdown */}
          {[
            { week: "This Week", views: 45, clicks: 8, inquiries: 2 },
            { week: "Last Week", views: 189, clicks: 37, inquiries: 10 },
          ].map((item) => (
            <div key={item.week} className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="font-medium text-text-primary">{item.week}</p>
              </div>
              <div className="flex gap-6 text-sm text-text-secondary">
                <div>
                  <p className="text-text-secondary">Views</p>
                  <p className="font-medium text-text-primary">{item.views}</p>
                </div>
                <div>
                  <p className="text-text-secondary">Clicks</p>
                  <p className="font-medium text-text-primary">{item.clicks}</p>
                </div>
                <div>
                  <p className="text-text-secondary">Inquiries</p>
                  <p className="font-medium text-text-primary">{item.inquiries}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Tips to Increase Your Views</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 rounded-lg border border-border bg-surface p-6">
            <h3 className="font-semibold text-text-primary">Complete Your Profile</h3>
            <p className="text-sm text-text-secondary">
              Therapists with complete profiles get 70% more views. Fill in all your services, availability, and photos.
            </p>
          </div>
          <div className="space-y-2 rounded-lg border border-border bg-surface p-6">
            <h3 className="font-semibold text-text-primary">Add Professional Photos</h3>
            <p className="text-sm text-text-secondary">
              High-quality photos increase bookings. Make sure your photos are clear and professional.
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
