import type { Metadata } from "next";

import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Law Enforcement Guidelines";
const DESCRIPTION =
  "How law enforcement and government agencies can request records from MasseurMatch, our legal-process requirements, emergency disclosure, and data-preservation practices.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/law-enforcement") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/law-enforcement"),
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function LawEnforcementPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-16 pt-16">
      <h1 className="font-display text-ds-40 font-bold tracking-tight text-text-primary">
        Law Enforcement Guidelines
      </h1>
      <p className="mt-3 text-sm text-text-secondary">{"Last updated: July 12, 2026"}</p>
      <p className="mt-4 text-text-secondary">
        {
          "These guidelines explain how MasseurMatch responds to requests for user information from law enforcement and government agencies. MasseurMatch is operated by XRankFlow Media Group LLC (Dover, Delaware, USA). We are committed to user safety and to cooperating with valid legal process, including investigations into human trafficking, sexual exploitation, and other criminal activity."
        }
      </p>

      <div className="mt-10 space-y-10">
        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            1. How to submit a request
          </h2>
          <p className="text-text-secondary">
            {"Send legal process and law-enforcement requests to "}
            <a
              href="mailto:legal@masseurmatch.com"
              className="font-medium text-brand-secondary underline underline-offset-2"
            >
              legal@masseurmatch.com
            </a>
            {
              " from an official government email address. Please include the requesting agency, the name and contact information of the requesting officer, the legal authority for the request, and a reasonable deadline. We may contact you to verify the request before responding."
            }
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            2. Legal process we require
          </h2>
          <ul className="list-disc space-y-3 pl-6">
            <li className="text-text-secondary">
              <strong className="font-semibold text-text-primary">
                Basic subscriber information
              </strong>
              {
                " (such as the name, email, and account timestamps a user provided) requires a valid subpoena, court order, or equivalent legal process."
              }
            </li>
            <li className="text-text-secondary">
              <strong className="font-semibold text-text-primary">Non-content records</strong>
              {
                " (such as account or transaction logs) generally require a court order or equivalent."
              }
            </li>
            <li className="text-text-secondary">
              <strong className="font-semibold text-text-primary">
                Content and other stored communications
              </strong>
              {
                " require a valid search warrant issued on a showing of probable cause, or other legal process required by applicable law."
              }
            </li>
          </ul>
          <p className="text-text-secondary">
            {
              "We review every request for legal sufficiency and may object to, narrow, or seek to quash requests that are overbroad, vague, or legally deficient. We disclose only the information the applicable legal process requires."
            }
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            3. Emergency disclosure requests
          </h2>
          <p className="text-text-secondary">
            {
              "If we receive a request based on a good-faith belief that there is an emergency involving a danger of death or serious physical injury to a person, we may voluntarily disclose information necessary to prevent that harm, consistent with applicable law. Mark emergency requests "
            }
            <strong className="font-semibold text-text-primary">
              {'"EMERGENCY DISCLOSURE REQUEST"'}
            </strong>
            {
              " in the subject line and describe the nature of the emergency, the person at risk, and the information needed."
            }
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            4. Data preservation
          </h2>
          <p className="text-text-secondary">
            {
              "On receipt of a valid preservation request, we will preserve available account records for 90 days, and for an additional 90 days on renewal, pending service of formal legal process. Send preservation requests to "
            }
            <a
              href="mailto:legal@masseurmatch.com"
              className="font-medium text-brand-secondary underline underline-offset-2"
            >
              legal@masseurmatch.com
            </a>
            {" with the relevant account identifiers (profile URL, email, or username)."}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            5. Human trafficking and child exploitation
          </h2>
          <p className="text-text-secondary">
            {
              "Consistent with FOSTA-SESTA (18 U.S.C. § 2421A) and our obligations under 18 U.S.C. § 2258A, MasseurMatch prohibits any use of the platform to facilitate prostitution or sex trafficking, and reports apparent child sexual abuse material to the National Center for Missing & Exploited Children (NCMEC) CyberTipline. Trafficking tips from the public can also be directed to the National Human Trafficking Hotline at "
            }
            <strong className="font-semibold text-text-primary">1-888-373-7888</strong>
            {", and child-exploitation reports to the NCMEC CyberTipline at "}
            <strong className="font-semibold text-text-primary">1-800-843-5678</strong>
            {" or "}
            <a
              href="https://report.cybertip.org"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand-secondary underline underline-offset-2"
            >
              report.cybertip.org
            </a>
            {"."}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            6. User notice
          </h2>
          <p className="text-text-secondary">
            {
              "Our policy is to notify users of requests for their information before disclosure, so that they may seek to protect their rights, unless we are legally prohibited from doing so (for example, by a valid non-disclosure order) or where we believe notice would create a risk of harm, endanger an investigation, or involve child exploitation."
            }
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            7. Contact
          </h2>
          <p className="text-text-secondary">
            {"Legal and law-enforcement requests: "}
            <a
              href="mailto:legal@masseurmatch.com"
              className="font-medium text-brand-secondary underline underline-offset-2"
            >
              legal@masseurmatch.com
            </a>
            {". Operator: XRankFlow Media Group LLC — Dover, Delaware, USA."}
          </p>
        </section>
      </div>
    </main>
  );
}
