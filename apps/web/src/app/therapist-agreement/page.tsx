import type { Metadata } from "next";

import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Therapist Subscription Agreement";
const DESCRIPTION = "Terms for therapists who publish paid or free listings on MasseurMatch.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/therapist-agreement") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/therapist-agreement"),
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function TherapistAgreementPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-16 pt-16">
      <h1 className="font-display text-ds-40 font-bold tracking-tight text-text-primary">
        Therapist Subscription Agreement
      </h1>
      <p className="mt-4 text-text-secondary">
        {
          "This agreement applies to therapists and providers who create, maintain, or pay for a listing on MasseurMatch. It supplements the general Terms of Use and describes listing obligations, billing, and moderation expectations."
        }
      </p>

      <div className="mt-10 space-y-10">
        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            1. Independent Relationship
          </h2>
          <p className="text-text-secondary">
            {
              "Therapists listed on MasseurMatch are independent providers. The platform does not employ therapists, act as an agent, or become a party to any service arrangement between a visitor and a therapist."
            }
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            2. Listing Eligibility
          </h2>
          <ul className="list-disc space-y-2 pl-6">
            <li className="text-text-secondary">
              {
                "You must be 18 or older and legally permitted to provide the services you advertise."
              }
            </li>
            <li className="text-text-secondary">
              {"Your listing must be truthful, current, and not misleading."}
            </li>
            <li className="text-text-secondary">
              {
                "You are responsible for complying with all local laws, licensing rules, and professional standards."
              }
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            3. Content Rules
          </h2>
          <ul className="list-disc space-y-2 pl-6">
            <li className="text-text-secondary">
              {"Profile photos and text must be professional and accurate."}
            </li>
            <li className="text-text-secondary">
              {"No unlawful content, deceptive claims, or sexual solicitation."}
            </li>
            <li className="text-text-secondary">
              {"No stolen photos, impersonation, or false credentials."}
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            4. Billing
          </h2>
          <p className="text-text-secondary">
            {
              "Paid listings renew automatically until canceled. We may update plan pricing or features with notice. Failed or disputed payments may lead to listing suspension until the account is resolved."
            }
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            5. Cancellation and Removal
          </h2>
          <p className="text-text-secondary">
            {
              "Therapists may cancel at any time, with changes typically taking effect at the end of the current billing period. We may suspend or remove listings that violate policy, create trust-and-safety risk, or contain misleading information."
            }
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            6. License to Display Content
          </h2>
          <p className="text-text-secondary">
            {
              "You keep ownership of your content, but grant MasseurMatch a non-exclusive license to host, format, moderate, and display it as needed to operate the directory and promote the platform."
            }
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            7. Contact
          </h2>
          <p className="text-text-secondary">
            {"Billing or agreement questions can be sent to "}
            <a
              href="mailto:billing@masseurmatch.com"
              className="font-medium text-brand-secondary underline underline-offset-2"
            >
              billing@masseurmatch.com
            </a>
            {"."}
          </p>
        </section>
      </div>
    </main>
  );
}
