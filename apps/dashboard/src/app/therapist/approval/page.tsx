import { createSessionClient } from "@masseurmatch/db/auth";
import { getProfile } from "@masseurmatch/db/actions/profile";
import { AlertCircle, CheckCircle, Clock, AlertTriangle } from "lucide-react";

export default async function ApprovalStatusPage() {
  const supabase = createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const profile = await getProfile(user.id);

  const statusConfig = {
    approved: {
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      title: "Profile Approved",
      description: "Your profile is live and visible to clients in the directory",
    },
    pending: {
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      title: "Profile Under Review",
      description: "Your profile is currently being reviewed by our team. This typically takes 24-48 hours.",
    },
    rejected: {
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      title: "Profile Needs Changes",
      description: "Your profile requires some updates before it can be approved.",
    },
  };

  const status = (profile?.profile_status || "pending") as keyof typeof statusConfig;
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="space-y-8 p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-text-primary">Approval Status</h1>
        <p className="text-text-secondary">Current status of your profile review</p>
      </div>

      {/* Status Alert */}
      <div className={`rounded-lg border-l-4 border-l-current p-6 ${config.bgColor}`}>
        <div className="flex items-start gap-4">
          <Icon className={`mt-1 h-6 w-6 flex-shrink-0 ${config.color}`} />
          <div className="space-y-2">
            <h2 className={`text-lg font-semibold ${config.color}`}>{config.title}</h2>
            <p className="text-sm text-text-secondary">{config.description}</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-border bg-surface p-6">
          <h3 className="font-semibold text-text-primary">Profile Information</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-text-secondary">Status</p>
              <p className="font-medium capitalize text-text-primary">{profile?.profile_status || "pending"}</p>
            </div>
            <div>
              <p className="text-text-secondary">Display Name</p>
              <p className="font-medium text-text-primary">{profile?.display_name || "Not set"}</p>
            </div>
            <div>
              <p className="text-text-secondary">Visibility</p>
              <p className="font-medium capitalize text-text-primary">{profile?.visibility_status || "hidden"}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-lg border border-border bg-surface p-6">
          <h3 className="font-semibold text-text-primary">Next Steps</h3>
          <ul className="space-y-2 text-sm text-text-secondary">
            {status === "approved" ? (
              <>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Your profile is live
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Continue updating your information
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Monitor your growth analytics
                </li>
              </>
            ) : (
              <>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Review your profile completeness
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Ensure all photos are professional
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Complete your services and rates
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      {status !== "approved" && (
        <div className="rounded-lg bg-blue-50 p-6">
          <p className="text-sm text-blue-900">
            Need help? Contact our support team for assistance with your profile review.
          </p>
        </div>
      )}
    </div>
  );
}
