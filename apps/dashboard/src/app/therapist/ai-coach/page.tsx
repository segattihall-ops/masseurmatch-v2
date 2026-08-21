import { Sparkles } from "lucide-react";

export default async function AiCoachPage() {
  return (
    <div className="space-y-8 p-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-brand-primary" />
          <h1 className="text-3xl font-bold text-text-primary">AI Coach</h1>
        </div>
        <p className="text-text-secondary">
          Get personalized recommendations to improve your profile visibility and bookings
        </p>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Profile Analysis</h2>

        <div className="space-y-4">
          <div className="rounded-lg bg-background p-4">
            <p className="text-sm text-text-secondary">
              AI Coach analyzes your profile completeness, photos, pricing, availability and
              engagement metrics to provide actionable recommendations for increasing visibility and
              bookings.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs font-medium uppercase text-text-secondary">Profile Score</p>
              <p className="mt-2 text-2xl font-bold text-text-primary">—</p>
              <p className="mt-1 text-xs text-text-secondary">Analysis in progress</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs font-medium uppercase text-text-secondary">Completeness</p>
              <p className="mt-2 text-2xl font-bold text-text-primary">—</p>
              <p className="mt-1 text-xs text-text-secondary">Profile data coverage</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs font-medium uppercase text-text-secondary">Visibility Score</p>
              <p className="mt-2 text-2xl font-bold text-text-primary">—</p>
              <p className="mt-1 text-xs text-text-secondary">Discovery potential</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Top Recommendations</h2>
        <div className="space-y-3">
          <div className="rounded-lg border border-border p-4">
            <p className="font-medium text-text-primary">1. Complete your profile information</p>
            <p className="mt-1 text-sm text-text-secondary">
              Therapists with complete profiles get 70% more views. Fill in all your services,
              specialties, and experience.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="font-medium text-text-primary">2. Add high-quality photos</p>
            <p className="mt-1 text-sm text-text-secondary">
              Professional photos increase bookings. Upload clear, well-lit photos that represent
              your services.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="font-medium text-text-primary">3. Set competitive pricing</p>
            <p className="mt-1 text-sm text-text-secondary">
              Keep your rates updated and competitive. Review local demand for your services to
              optimize pricing.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="font-medium text-text-primary">4. Activate Available Now badge</p>
            <p className="mt-1 text-sm text-text-secondary">
              Turn on the Available Now badge to highlight yourself to clients looking to book
              today.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
