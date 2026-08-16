import type { Metadata } from "next";

import { absoluteUrl, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern use of the MasseurMatch directory.",
  alternates: { canonical: absoluteUrl("/terms") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/terms"),
    siteName: SITE_NAME,
    title: "Terms of Service",
    description: "The terms that govern use of the MasseurMatch directory.",
  },
};

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-16 pt-16">
      <h1 className="font-display text-ds-40 font-bold tracking-tight text-text-primary">
        Terms of Service
      </h1>

      <div className="mt-10 space-y-10">
        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            Acceptance
          </h2>
          <p className="text-text-secondary">
            {
              "By using MasseurMatch you agree to these terms. If you do not agree, do not use the site."
            }
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            Listings
          </h2>
          <p className="text-text-secondary">
            {
              "Therapists are responsible for the accuracy of their own listing, including services, pricing and availability. We review listings before publication but do not warrant their accuracy."
            }
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            Acceptable use
          </h2>
          <p className="text-text-secondary">
            {
              "You may not scrape the directory, misrepresent your identity, or use the site to advertise services that are illegal in the jurisdiction where they are offered."
            }
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            Independent practitioners
          </h2>
          <p className="text-text-secondary">
            {
              "Therapists listed here are independent practitioners, not employees or agents of MasseurMatch. Any agreement for a session is between you and the therapist."
            }
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            Changes
          </h2>
          <p className="text-text-secondary">
            {"We may update these terms. Continued use after a change constitutes acceptance."}
          </p>
        </section>
      </div>
    </main>
  );
}
