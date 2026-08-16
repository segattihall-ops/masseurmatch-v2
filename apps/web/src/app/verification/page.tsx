import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Identity Verification";
const DESCRIPTION =
  "How MasseurMatch reviews identity evidence, what the Identity Verified badge means, and what it does not verify.";
const PATH = "/verification";

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
            <div>
              <p>Trust &amp; Safety</p>

              <p>
                The <strong>Identity Verified</strong> badge means MasseurMatch reviewed identity
                evidence for the provider. It is deliberately limited to identity and should not be
                read as a license check, background check, or endorsement.
              </p>
            </div>
          </section>

          <div>
            <section>
              <h2>How verification works</h2>
              <ol>
                <h3>Provider submits a government-issued ID</h3>
                <p>
                  The provider uploads a clear image of a passport, driver&rsquo;s license, state
                  ID, or other supported government-issued identity document through the secure
                  MasseurMatch verification flow.
                </p>
                <h3>Provider submits a current challenge selfie</h3>
                <p>
                  MasseurMatch generates a one-time six-digit challenge. The provider submits a
                  current selfie showing their face and the challenge code so the reviewer can
                  compare it with the ID photo.
                </p>
                <h3>A human reviewer checks required criteria</h3>
                <p>
                  Approval requires a readable and apparently valid ID, an apparently unexpired
                  document, a selfie that appears to match the ID photo, and a clearly visible
                  current challenge code.
                </p>
                <h3>Sensitive images are deleted after the decision</h3>
                <p>
                  After approval or rejection is finalized, MasseurMatch removes the submitted
                  identity images from the private verification storage. The account keeps the
                  decision status and limited audit metadata, not the raw evidence.
                </p>
              </ol>
            </section>

            <section>
              <h2>What the badge does not mean</h2>
              <p>Clear limits prevent a trust signal from becoming a misleading claim.</p>
              <ul>
                <h3>Does NOT verify professional licensing</h3>
                <p>
                  Identity Verified confirms identity only. MasseurMatch does not independently
                  verify massage licenses, certifications, insurance, professional standing, or
                  regulatory compliance.
                </p>
                <h3>Does NOT include a background check</h3>
                <p>
                  The identity review is not a criminal, civil, employment, sanctions, or other
                  background investigation unless MasseurMatch explicitly states otherwise for a
                  separate program.
                </p>
                <h3>Does NOT guarantee services or outcomes</h3>
                <p>
                  The badge is not an endorsement, recommendation, guarantee of service quality, or
                  approval of any specific service offered by a provider.
                </p>
                <h3>It is a point-in-time identity review</h3>
                <p>
                  Verification reflects the evidence reviewed at a specific time. Clients should
                  still use their own judgment when choosing and contacting a provider.
                </p>
              </ul>
            </section>

            <section>
              <h2>Privacy and retention</h2>
              <p>
                Identity evidence is uploaded to private storage for authorized review. Once a final
                decision is recorded, the raw identity document and challenge-selfie files are
                deleted. Limited verification status and audit metadata may be retained to operate
                the trust feature, prevent abuse, and document the review decision.
              </p>
            </section>

            <section>
              <p>Questions or concerns</p>
              <p>
                If you believe a profile is misrepresenting its identity or violating platform
                policies, contact MasseurMatch support.
              </p>
              <a href="mailto:support@masseurmatch.com?subject=Identity%20verification%20concern">
                Contact support@masseurmatch.com
              </a>
            </section>
          </div>
        </div>
      </>
    </LegalPage>
  );
}
