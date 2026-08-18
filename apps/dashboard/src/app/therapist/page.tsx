import { createSessionClient } from "@masseurmatch/db/auth";
import { getProfile } from "@masseurmatch/db/actions/profile";
import Link from "next/link";
import { ArrowRight, CheckCircle, Clock, TrendingUp } from "lucide-react";

export default async function TherapistDashboard() {
  const supabase = createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const profile = await getProfile(user.id);

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-text-primary">Welcome, {profile?.display_name || "Therapist"}</h1>
        <p className="text-text-secondary">Manage your profile and track your growth</p>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Approval Status */}
        <div className="space-y-4 rounded-lg border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-text-primary">Approval Status</h3>
            {profile?.profile_status === "approved" ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Clock className="h-5 w-5 text-amber-500" />
            )}
          </div>
          <p className="text-sm text-text-secondary">
            {profile?.profile_status === "approved"
              ? "Your profile is live and visible"
              : "Your profile is under review"}
          </p>
          <Link href="/therapist/approval" className="inline-flex items-center gap-2 text-sm font-medium text-brand-primary hover:underline">
            View Details <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Visibility Status */}
        <div className="space-y-4 rounded-lg border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-text-primary">Visibility</h3>
            {profile?.visibility_status === "public" ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Clock className="h-5 w-5 text-text-secondary" />
            )}
          </div>
          <p className="text-sm text-text-secondary">
            {profile?.visibility_status === "public"
              ? "Your profile is publicly visible"
              : "Your profile is hidden from the directory"}
          </p>
          <Link href="/therapist/profile" className="inline-flex items-center gap-2 text-sm font-medium text-brand-primary hover:underline">
            Manage Profile <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Profile Stats */}
        <div className="space-y-4 rounded-lg border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-text-primary">Growth</h3>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-sm text-text-secondary">
            Track your views, bookings, and engagement
          </p>
          <Link href="/therapist/growth" className="inline-flex items-center gap-2 text-sm font-medium text-brand-primary hover:underline">
            View Analytics <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href="/therapist/profile"
            className="flex items-center gap-4 rounded-lg border border-border bg-surface p-6 hover:border-brand-primary"
          >
            <div className="flex-1">
              <h3 className="font-semibold text-text-primary">Edit Your Profile</h3>
              <p className="text-sm text-text-secondary">Update your services, rates, and availability</p>
            </div>
            <ArrowRight className="h-5 w-5 text-text-secondary" />
          </Link>

          <Link
            href="/therapist/growth"
            className="flex items-center gap-4 rounded-lg border border-border bg-surface p-6 hover:border-brand-primary"
          >
            <div className="flex-1">
              <h3 className="font-semibold text-text-primary">View Your Analytics</h3>
              <p className="text-sm text-text-secondary">See profile views, clicks, and booking trends</p>
            </div>
            <ArrowRight className="h-5 w-5 text-text-secondary" />
          </Link>
        </div>
      </div>
    </div>
  );
}
