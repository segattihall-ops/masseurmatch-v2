import type { Metadata } from "next";

import { absoluteUrl, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "About MasseurMatch",
  description: "How MasseurMatch verifies therapists and what listing on the directory involves.",
  alternates: { canonical: absoluteUrl("/about") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/about"),
    siteName: SITE_NAME,
    title: "About MasseurMatch",
    description: "How MasseurMatch verifies therapists and what listing on the directory involves.",
  },
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-16 pt-16">
      <h1 className="font-display text-ds-40 font-bold tracking-tight text-text-primary">
        About MasseurMatch
      </h1>

      <div className="mt-10 space-y-10">
        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            What MasseurMatch is
          </h2>
          <p className="text-text-secondary">
            {
              "MasseurMatch is a directory of male massage therapists. Every listed profile is reviewed before it goes public, and identity-verified therapists carry a badge you can see on their card."
            }
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            How verification works
          </h2>
          <p className="text-text-secondary">
            {
              "Therapists submit government ID through our verification partner. We never publish the document itself \u2014 only whether the check passed. Photos are reviewed separately before they appear."
            }
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            Listing your practice
          </h2>
          <p className="text-text-secondary">
            {
              "Create a profile, add your services and pricing, and submit for review. Once approved, your profile appears in your city's directory and becomes indexable by search engines."
            }
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            What we do not do
          </h2>
          <p className="text-text-secondary">
            {
              "We do not take a cut of your session fee, we do not broker bookings on your behalf, and we do not publish reviews you cannot see."
            }
          </p>
        </section>
      </div>
    </main>
  );
}
