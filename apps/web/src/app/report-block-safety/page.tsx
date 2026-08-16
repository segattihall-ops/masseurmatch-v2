import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Report, Block, and Safety Policy";
const DESCRIPTION =
  "How to report profiles, content, and behavior on MasseurMatch, how blocking works, safety tips, and emergency resources.";
const PATH = "/report-block-safety";

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
            <p>Trust and Safety</p>

            <p>
              Your safety matters. This page explains how to report profiles or conduct that
              violates platform standards, how to block other users, and important safety resources.
            </p>
          </section>

          <section>
            <div>
              <div>
                <h2>Emergency resources</h2>
                <p>
                  If you are in immediate danger, <strong>call 911</strong> (US) or your local
                  emergency number. MasseurMatch is not an emergency service and cannot respond in
                  real time to safety emergencies.
                </p>
                <div>
                  <p>
                    <strong>National Human Trafficking Hotline:</strong> 1-888-373-7888 or text
                    &quot;HELP&quot; to 233733
                  </p>
                  <p>
                    <strong>NCMEC CyberTipline (child exploitation):</strong> 1-800-843-5678 or
                    <a href="https://report.cybertip.org">report.cybertip.org</a>
                  </p>
                  <p>
                    <strong>National Sexual Assault Hotline:</strong> 1-800-656-4673
                  </p>
                  <p>
                    <strong>Crisis Text Line:</strong> Text HOME to 741741
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3>Report a profile</h3>
            <p>
              Report providers whose profiles contain false information, stolen photos, prohibited
              content, or implied illegal services.
            </p>
            <p>trust@masseurmatch.com</p>
            <h3>Report a safety concern</h3>
            <p>
              Report conduct, communication, or behavior that creates a safety concern — including
              threats, coercion, or suspicious activity.
            </p>
            <p>trust@masseurmatch.com</p>
            <h3>Report suspected trafficking</h3>
            <p>
              If you suspect human trafficking or exploitation, report it to us and to the National
              Human Trafficking Hotline.
            </p>
            <p>trust@masseurmatch.com</p>
            <h3>Report harassment</h3>
            <p>
              Report any user who is harassing, threatening, or discriminating against you through
              the platform.
            </p>
            <p>trust@masseurmatch.com</p>
            <h3>Report child exploitation</h3>
            <p>
              Any content that sexualizes or involves a minor is reported to NCMEC and law
              enforcement. Report it to us and to the NCMEC CyberTipline at 1-800-843-5678.
            </p>
            <p>trust@masseurmatch.com</p>
          </section>

          <section>
            <div>
              <div>
                <h2>How to report</h2>
                <div>
                  <p>
                    The fastest way to flag a listing is the
                    <strong>&ldquo;Report this profile&rdquo;</strong> link at the bottom of any
                    therapist profile — no account required. You can also email
                    <a href="mailto:trust@masseurmatch.com">trust@masseurmatch.com</a>
                    with:
                  </p>
                  <ul>
                    <li>The URL of the profile or page involved.</li>
                    <li>A description of the issue — what you saw and why it concerns you.</li>
                    <li>Screenshots or other evidence if available.</li>
                    <li>
                      Your contact information if you are willing to be contacted for follow-up.
                    </li>
                  </ul>
                  <p>
                    All reports are reviewed by our trust and safety team. We acknowledge reports
                    within 48 hours during business hours. Not every report will result in removal
                    or suspension — our team reviews each situation individually and applies our
                    policies accordingly.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2>Blocking</h2>
            <div>
              <p>
                If you need to block another user to prevent further contact, contact
                <a href="mailto:support@masseurmatch.com">support@masseurmatch.com</a>. Include the
                profile URL of the user you need blocked and a brief explanation.
              </p>
              <p>
                Blocking prevents that user from viewing your profile or contacting you through the
                platform. Blocking a user does not automatically result in moderation action against
                them — if the user has violated platform policies, please also submit a report.
              </p>
            </div>
          </section>

          <section>
            <h2>Safety tips</h2>
            <ul>
              <ul>
                <li>
                  Research the provider independently before making contact. Look for a consistent
                  professional presence beyond their MasseurMatch listing.
                </li>
                <li>
                  Communicate through the platform&rsquo;s contact features before sharing personal
                  contact details.
                </li>
                <li>
                  Trust your instincts. If a communication feels uncomfortable or pressuring, do not
                  proceed.
                </li>
                <li>
                  Never transfer money, gift cards, or cryptocurrency to a provider in advance of a
                  session.
                </li>
                <li>
                  Share your session plans with a trusted person — where you are going and when you
                  expect to be back.
                </li>
                <li>
                  Know that MasseurMatch does not employ providers and is not present at sessions.
                  Your safety is your responsibility.
                </li>
                <li>
                  If a provider requests or implies sexual services, do not proceed — report the
                  profile immediately.
                </li>
              </ul>
            </ul>
          </section>

          <section>
            <h2>Platform limits</h2>
            <p>
              MasseurMatch is a directory platform. We do not accompany users to sessions, cannot
              verify what happens outside the platform, and cannot guarantee provider safety,
              conduct, or credentials. We enforce platform policies but are not a substitute for
              personal due diligence, law enforcement, or emergency services.
            </p>
            <p>
              Submitting a report does not guarantee removal, suspension, or any specific
              enforcement outcome. We review every report but we do not share details of enforcement
              decisions with reporters.
            </p>
            <p>
              In line with FOSTA-SESTA (18 U.S.C. &sect;&nbsp;2421A) and our obligations under 18
              U.S.C. &sect;&nbsp;2258A, MasseurMatch prohibits any use of the platform to facilitate
              prostitution or sex trafficking, preserves relevant records, cooperates with valid
              legal process, and reports apparent child sexual abuse material to NCMEC. See our
              <a href="/prohibited-conduct">Prohibited Conduct</a>
              policy for details.
            </p>
          </section>

          <section>
            <p>Related Policies</p>
          </section>
        </div>
      </>
    </LegalPage>
  );
}
