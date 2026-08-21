import { Bell, CheckCircle, Info, AlertCircle } from "lucide-react";

export default async function NotificationsPage() {
  return (
    <div className="space-y-8 p-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-brand-primary" />
          <h1 className="text-3xl font-bold text-text-primary">Notifications</h1>
        </div>
        <p className="text-text-secondary">Stay updated on your account activity</p>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Notification Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="font-medium text-text-primary">New booking inquiries</p>
              <p className="text-sm text-text-secondary">Get notified when someone contacts you</p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4" />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="font-medium text-text-primary">Profile updates</p>
              <p className="text-sm text-text-secondary">
                Alerts about your profile approval status
              </p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4" />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="font-medium text-text-primary">Messages</p>
              <p className="text-sm text-text-secondary">Direct messages from clients</p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4" />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="font-medium text-text-primary">Promotional</p>
              <p className="text-sm text-text-secondary">Updates about new features and offers</p>
            </div>
            <input type="checkbox" className="h-4 w-4" />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="font-medium text-text-primary">Email notifications</p>
              <p className="text-sm text-text-secondary">Receive notifications via email</p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4" />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="font-medium text-text-primary">Push notifications</p>
              <p className="text-sm text-text-secondary">Receive notifications on your devices</p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4" />
          </div>
        </div>
        <button className="mt-6 rounded-lg bg-brand-primary px-6 py-2 font-medium text-white transition hover:bg-brand-primary/90">
          Save Preferences
        </button>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Notification History</h2>
        <div className="space-y-2">
          <div className="flex items-start gap-3 rounded-lg border border-border p-4">
            <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text-primary">Profile approved</p>
              <p className="text-sm text-text-secondary">
                Your profile is now live and visible to clients
              </p>
              <p className="mt-1 text-xs text-text-secondary">2 days ago</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-border p-4">
            <Info className="mt-1 h-5 w-5 flex-shrink-0 text-blue-500" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text-primary">Profile submitted for review</p>
              <p className="text-sm text-text-secondary">
                Your profile has been submitted and is under review
              </p>
              <p className="mt-1 text-xs text-text-secondary">5 days ago</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-border p-4">
            <Info className="mt-1 h-5 w-5 flex-shrink-0 text-blue-500" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text-primary">Welcome to MasseurMatch Pro</p>
              <p className="text-sm text-text-secondary">Get started by completing your profile</p>
              <p className="mt-1 text-xs text-text-secondary">1 week ago</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Important Alerts</h2>
        <div className="space-y-2">
          <div className="flex items-start gap-3 rounded-lg border border-brand-primary/20 bg-brand-primary/5 p-4">
            <AlertCircle className="mt-1 h-5 w-5 flex-shrink-0 text-brand-primary" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text-primary">No active alerts</p>
              <p className="text-sm text-text-secondary">Your account is in good standing</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
