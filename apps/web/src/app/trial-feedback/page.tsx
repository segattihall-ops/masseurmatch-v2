import type { Metadata } from "next";

import { TrialFeedbackForm } from "./feedback-form";

export const metadata: Metadata = {
  title: "Private Trial Feedback",
  description: "Share private feedback about your MasseurMatch provider experience.",
  robots: { index: false, follow: false },
};

export default function TrialFeedbackPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-16 pt-16">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">
          Private feedback
        </p>
        <h1 className="mt-4 font-display text-ds-40 font-bold tracking-tight text-text-primary">
          Help us improve MasseurMatch
        </h1>
        <p className="mt-4 text-ds-18 leading-8 text-text-secondary">
          Tell us what worked, what caused friction, and what should change. Responses are stored as
          private internal feedback and are not published on provider profiles.
        </p>
      </header>

      <section className="mt-10 rounded-3xl border border-border bg-white p-6 shadow-ds-sm sm:p-8">
        <TrialFeedbackForm />
      </section>
    </main>
  );
}
