import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Badge and Verification Disclaimer";
const DESCRIPTION =
  "What MasseurMatch badges and profile signals mean — and what they do not mean. Badges are platform indicators, not license verification or background checks.";
const PATH = "/badge-disclaimer";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl(PATH) },
  openGraph: {
    type: "website",
    url: absoluteUrl(PATH),
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function Page() {
  return (
    <LegalPage title={TITLE} path={PATH} lastUpdated="June 29, 2026">
      <>
        <div>
          <section>
            <p>Trust Signals</p>

            <p>
              Badges and profile signals on MasseurMatch are limited platform indicators. This page
              explains exactly what each badge means — and what it does not mean — so you can make
              informed decisions.
            </p>
          </section>

          <section>
            <div>
              <div>
                <h2>Important disclaimer — please read</h2>
                <p>
                  Badges and profile signals are <strong>limited platform indicators only</strong>.
                  They are not professional license verification, background checks, criminal
                  history checks, insurance confirmation, endorsements, quality guarantees, or proof
                  that a provider is safe, qualified, legal, available, or suitable for any
                  particular client or purpose.
                </p>
                <p>
                  You are solely responsible for independently verifying any provider&rsquo;s
                  credentials, licensing, safety, and suitability before contacting, scheduling, or
                  meeting with them.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2>What each badge means</h2>
            <div>
              <h3>Verified Profile</h3>
              <p>
                The provider has completed a basic identity confirmation step to confirm they are a
                real person operating a genuine account.
              </p>
              <p>
                This badge does not verify professional licenses, certifications, background
                history, insurance, qualifications, or that the provider is safe or suitable for any
                purpose.
              </p>
              <h3>Licensed Practitioner (self-declared)</h3>
              <p>
                The provider has self-reported holding a professional license or certification
                relevant to their listed services.
              </p>
              <p>
                MasseurMatch does not independently verify the existence, validity, currency, or
                scope of any self-declared license or certification. Clients must verify licenses
                directly with the relevant licensing authority.
              </p>
              <h3>LGBTQ+ Affirming</h3>
              <p>
                The provider has self-declared that they are inclusive, welcoming, and affirming of
                LGBTQ+ clients.
              </p>
              <p>
                This is a self-declaration and has not been independently assessed or verified by
                MasseurMatch.
              </p>
              <h3>Profile Complete</h3>
              <p>
                The provider has filled in all recommended profile fields, including bio, service
                description, photos, and contact information.
              </p>
              <p>
                Profile completeness is a formatting indicator. It does not reflect the accuracy,
                truthfulness, or quality of any information provided.
              </p>
            </div>
          </section>

          <section>
            <div>
              <div>
                <h2>MasseurMatch does not verify licenses</h2>
                <div>
                  <p>
                    MasseurMatch does not independently verify, confirm, or audit professional
                    licenses, certifications, background history, insurance, or any other credential
                    claimed by a provider. Profile content — including credentials — is
                    self-declared by providers.
                  </p>
                  <p>
                    To verify a provider&apos;s license, contact the relevant licensing authority in
                    the provider&apos;s jurisdiction directly. Most states maintain searchable
                    online license verification databases through their state health department or
                    professional licensing board.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div>
              <div>
                <h2>No background checks</h2>
                <p>
                  MasseurMatch does not conduct background checks on providers. No badge, profile
                  signal, or platform indicator should be interpreted as an indication that a
                  provider has passed a background check, criminal history review, or sex offender
                  registry check. Clients are responsible for their own safety research and
                  decisions.
                </p>
              </div>
            </div>
          </section>

          <section>
            <p>Related Policies</p>
          </section>
        </div>
      </>
    </LegalPage>
  );
}
