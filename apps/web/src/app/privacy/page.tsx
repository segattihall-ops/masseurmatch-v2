import type { Metadata } from "next";

import { absoluteUrl, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What data MasseurMatch collects, why, and how it is protected.",
  alternates: { canonical: absoluteUrl("/privacy") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/privacy"),
    siteName: SITE_NAME,
    title: "Privacy Policy",
    description: "What data MasseurMatch collects, why, and how it is protected.",
  },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-16 pt-16">
      <h1 className="font-display text-ds-40 font-bold tracking-tight text-text-primary">
        Privacy Policy
      </h1>

      <div className="mt-10 space-y-10">
        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            What we collect
          </h2>
          <p className="text-text-secondary">
            {
              "For visitors: standard request logs and privacy-respecting analytics. For therapists: the profile information you submit, plus verification status from our identity partner."
            }
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            Identity documents
          </h2>
          <p className="text-text-secondary">
            {
              "Identity documents are handled by our verification partner and are not stored on our servers. We retain only the outcome of the check."
            }
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            What is public
          </h2>
          <p className="text-text-secondary">
            {
              "Only the fields on your published profile are public. Contact details are shown only if you choose to display them."
            }
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            Data access
          </h2>
          <p className="text-text-secondary">
            {
              "Row Level Security is enforced at the database level: a logged-out visitor can read only approved, publicly visible profiles, and a therapist can edit only their own."
            }
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            Your rights
          </h2>
          <p className="text-text-secondary">
            {"You can request a copy of your data or its deletion at any time by contacting us."}
          </p>
        </section>
      </div>
    </main>
  );
}
