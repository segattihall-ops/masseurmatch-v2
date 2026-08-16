import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Visibility platform only";
const DESCRIPTION =
  "Read the MasseurMatch platform disclaimer, including the independent-provider model, no-license-verification notice, and direct-contact responsibilities.";
const PATH = "/platform-disclaimer";

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
    <LegalPage title={TITLE} path={PATH}>
      <>
        <div>
          <section>
            <span>Platform Disclaimer</span>

            <p>
              MasseurMatch exists to make provider visibility and direct connections clearer. It
              does not replace your own due diligence, legal compliance, or independent
              decision-making.
            </p>
            <div>
              By using or listing on the platform, you acknowledge that providers operate
              independently and that any interaction or transaction is at your own risk and
              discretion.
            </div>
          </section>

          <section>
            <h3>Visibility platform only</h3>
            <p>
              MasseurMatch is a visibility platform, not an agency, employer, or service provider.
              Providers remain fully responsible for their own services, communications, and
              compliance.
            </p>
            <h3>No license verification</h3>
            <p>
              Credentials, certifications, and licenses shown on profiles are self-declared unless
              explicitly stated otherwise. Clients should confirm qualifications directly before
              booking.
            </p>
            <h3>Provider-owned listings</h3>
            <p>
              Profile content, including bios, pricing, photos, and service descriptions, is
              submitted by providers. MasseurMatch does not guarantee that listing content is
              accurate, professional, or lawful.
            </p>
            <h3>No medical advice</h3>
            <p>
              The platform is intended for wellness discovery. Listings may not be used to diagnose,
              treat, or prescribe unless a provider is properly licensed and operating within
              applicable law.
            </p>
            <h3>No bookings or payments</h3>
            <p>
              MasseurMatch does not process bookings, payments, or on-platform messaging. Any
              interaction, arrangement, or transaction happens directly between provider and client.
            </p>
            <h3>No endorsement</h3>
            <p>
              Promotional placements or featured visibility options are paid opportunities and do
              not constitute endorsements by MasseurMatch or its owners.
            </p>
          </section>

          <section>
            <article>
              <div>
                <div>
                  <p>Important Reminder</p>
                  <h2>
                    The platform does not guarantee outcome, quality, legality, or suitability.
                  </h2>
                  <p>
                    Clients should confirm credentials, boundaries, location details, pricing, and
                    service scope directly with the provider. Providers remain responsible for
                    ensuring their listings and services comply with local laws and professional
                    standards.
                  </p>
                </div>
              </div>
            </article>

            <article>
              <p>Legal Contact</p>
              <h2>Questions about platform liability or legal process?</h2>
              <a href="mailto:legal@masseurmatch.com">legal@masseurmatch.com</a>
              <div>
                <a href="/terms">Terms</a>
                <a href="/privacy">Privacy</a>
                <a href="/community-guidelines">Community Guidelines</a>
              </div>
            </article>
          </section>
        </div>
      </>
    </LegalPage>
  );
}
