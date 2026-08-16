import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Trust & Safety | How MasseurMatch Protects You";
const DESCRIPTION =
  "Learn how MasseurMatch reviews profiles, verifies identity, protects privacy, and maintains a professional directory.";
const PATH = "/trust";

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
            <p>
              MasseurMatch is a professional directory. Profiles are moderated before publication,
              and identity verification can add an additional point-in-time identity signal.
            </p>
          </section>

          <section>
            <div>
              <div>
                <div />

                <h3>Profile Moderation</h3>
                <p>
                  New profiles are reviewed before publication. Automated screening may assist
                  moderators, but publication decisions remain subject to human review and platform
                  policies.
                </p>
                <div>
                  <span>
                    <span />
                    <span />
                  </span>
                  <span>Review Team Active</span>
                </div>
              </div>

              <div>
                <h3>Identity Verification</h3>
                <p>
                  Providers who complete identity verification submit a government-issued ID and a
                  current selfie showing a one-time challenge code. MasseurMatch reviews the
                  evidence and deletes the sensitive images after the final decision.
                </p>
                <div>
                  <span>Identity Verified</span>
                </div>
                <p>
                  The badge confirms identity only. It does not verify professional licensing,
                  background history, qualifications, services, or service quality.
                </p>
              </div>

              <div>
                <h3>Data Privacy</h3>
                <p>
                  We limit access to sensitive verification evidence, store it privately during
                  review, and remove identity images after the review decision. See the Privacy
                  Policy for details about other platform data and retention.
                </p>
              </div>

              <div>
                <h3>Directory Contact</h3>
                <p>
                  MasseurMatch helps clients discover providers and use the contact options on their
                  profiles. Scheduling, session payments, and service arrangements happen directly
                  between clients and providers outside MasseurMatch.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2>Our Unbreakable Rules</h2>

            <div>
              <a href="/moderation-policy">Read our full Moderation Policy</a>
            </div>
          </section>
        </div>
      </>
    </LegalPage>
  );
}
