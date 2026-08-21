import { LifeBuoy, MessageCircle, Zap } from "lucide-react";

export default async function SupportPage() {
  return (
    <div className="space-y-8 p-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <LifeBuoy className="h-6 w-6 text-brand-primary" />
          <h1 className="text-3xl font-bold text-text-primary">Support</h1>
        </div>
        <p className="text-text-secondary">Get help with your MasseurMatch account</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border p-6">
          <MessageCircle className="h-6 w-6 text-brand-primary" />
          <h3 className="mt-3 font-semibold text-text-primary">Open Tickets</h3>
          <p className="mt-1 text-3xl font-bold text-text-primary">0</p>
          <p className="mt-1 text-xs text-text-secondary">In progress or awaiting response</p>
        </div>

        <div className="rounded-lg border border-border p-6">
          <Zap className="h-6 w-6 text-brand-primary" />
          <h3 className="mt-3 font-semibold text-text-primary">Response Time</h3>
          <p className="mt-1 text-3xl font-bold text-text-primary">24h</p>
          <p className="mt-1 text-xs text-text-secondary">Average support response</p>
        </div>

        <div className="rounded-lg border border-border p-6">
          <LifeBuoy className="h-6 w-6 text-brand-primary" />
          <h3 className="mt-3 font-semibold text-text-primary">Articles</h3>
          <p className="mt-1 text-3xl font-bold text-text-primary">50+</p>
          <p className="mt-1 text-xs text-text-secondary">Knowledge base articles</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Create a Support Ticket</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary">Subject</label>
            <input
              type="text"
              placeholder="How can we help?"
              className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-text-primary placeholder-text-secondary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary">Category</label>
            <select className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-text-primary">
              <option>Select a category...</option>
              <option>Profile & Photos</option>
              <option>Billing</option>
              <option>Availability</option>
              <option>Technical Issue</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary">Description</label>
            <textarea
              placeholder="Please describe your issue in detail..."
              rows={4}
              className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-text-primary placeholder-text-secondary"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-brand-primary px-6 py-2 font-medium text-white transition hover:bg-brand-primary/90"
          >
            Submit Ticket
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Recent Tickets</h2>
        <div className="space-y-2">
          <div className="rounded-lg border border-border p-4">
            <p className="font-medium text-text-primary">No open support tickets</p>
            <p className="mt-1 text-sm text-text-secondary">Create a ticket above to get support</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Frequently Asked Questions</h2>
        <div className="space-y-3">
          <details className="rounded-lg border border-border p-4">
            <summary className="cursor-pointer font-medium text-text-primary">
              How do I update my availability?
            </summary>
            <p className="mt-2 text-sm text-text-secondary">
              Go to Availability & Travel section to update your working hours, travel dates, and
              service areas.
            </p>
          </details>

          <details className="rounded-lg border border-border p-4">
            <summary className="cursor-pointer font-medium text-text-primary">
              How long does profile approval take?
            </summary>
            <p className="mt-2 text-sm text-text-secondary">
              Profile approval typically takes 24-48 hours. Check your Approval Status page for
              current status.
            </p>
          </details>

          <details className="rounded-lg border border-border p-4">
            <summary className="cursor-pointer font-medium text-text-primary">
              How do I upload photos?
            </summary>
            <p className="mt-2 text-sm text-text-secondary">
              Visit the Photos section to upload and manage your profile photos. Approved photos
              appear in your listing.
            </p>
          </details>

          <details className="rounded-lg border border-border p-4">
            <summary className="cursor-pointer font-medium text-text-primary">
              How do I track bookings?
            </summary>
            <p className="mt-2 text-sm text-text-secondary">
              Your analytics and contact activity are shown in the Growth Analytics section.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}
