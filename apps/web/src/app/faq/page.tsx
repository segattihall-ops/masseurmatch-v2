import type { Metadata } from "next";

import { absoluteUrl, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Common questions about finding and booking a massage therapist on MasseurMatch.",
  alternates: { canonical: absoluteUrl("/faq") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/faq"),
    siteName: SITE_NAME,
    title: "Frequently Asked Questions",
    description: "Common questions about finding and booking a massage therapist on MasseurMatch.",
  },
};

export default function FaqPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-16 pt-16">
      <h1 className="font-display text-ds-40 font-bold tracking-tight text-text-primary">
        Frequently Asked Questions
      </h1>

      <div className="mt-10 space-y-10">
        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            Is every therapist verified?
          </h2>
          <p className="text-text-secondary">
            {
              "Every profile is reviewed before publication. Therapists who complete identity verification carry an ID verified badge; those who have not are still reviewed but do not carry the badge."
            }
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            How is the directory ordered?
          </h2>
          <p className="text-text-secondary">
            {
              "City pages are ordered by subscription standing, then by featured status, rating and review volume. The order is deterministic \u2014 it does not change between visits."
            }
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            Do you take a booking fee?
          </h2>
          <p className="text-text-secondary">
            {"No. You contact the therapist directly using the details on their profile."}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            Why does a profile have no photo?
          </h2>
          <p className="text-text-secondary">
            {
              "Photos are published only after review. A profile awaiting photo review shows the therapist's initials instead \u2014 we never substitute a stock photograph for a real person."
            }
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            How do I remove my listing?
          </h2>
          <p className="text-text-secondary">
            {
              "Sign in to your dashboard and set your profile to private, or contact us and we will unpublish it."
            }
          </p>
        </section>
      </div>
    </main>
  );
}
