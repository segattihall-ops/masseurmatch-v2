import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Review the profile before you reach out";
const DESCRIPTION =
  "Use the public listing to check specialties, rates, session format, and any visible verification signals before first contact.";
const PATH = "/safety";

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
          <div>
            <p>Trust and safety</p>

            <p>
              MasseurMatch is a discovery platform, not a booking intermediary. We make trust
              signals more visible, but users should still review each profile carefully and confirm
              details directly before scheduling.
            </p>
          </div>

          <div>
            <h3>Review the profile before you reach out</h3>
            <p>
              Use the public listing to check specialties, rates, session format, and any visible
              verification signals before first contact.
            </p>
            <h3>Keep communication on record</h3>
            <p>
              Use written communication when possible so pricing, timing, directions, and
              expectations are easy to reference later.
            </p>
            <h3>Use badges as signals, not guarantees</h3>
            <p>
              MasseurMatch helps with discovery, but you should still verify the situation
              independently and leave if something feels wrong.
            </p>
            <h3>Report suspicious behavior</h3>
            <p>
              If a profile appears misleading or unsafe, contact the team so it can be reviewed and
              removed if needed.
            </p>
          </div>

          <section>
            <h2>What the badges mean</h2>
            <p>
              Trust badges are there to reduce ambiguity, not to replace personal judgment. Here is
              what they are intended to communicate.
            </p>
            <div>
              <h3>Profile reviewed</h3>
              <p>
                The listing content was reviewed for presentation quality and trust and safety fit.
              </p>
              <h3>Identity reviewed</h3>
              <p>The provider submitted identity information for trust and safety review.</p>
              <h3>Photos reviewed</h3>
              <p>The visible photos were reviewed as part of the profile-quality process.</p>
            </div>
          </section>

          <section>
            <h2>Need to report something?</h2>
            <p>
              If a listing appears misleading, abusive, or unsafe, contact the team with as much
              detail as possible so it can be reviewed quickly.
            </p>
            <div>
              <a href="/contact">Contact support</a>
              <a href="/terms">Terms</a>
              <a href="/privacy">Privacy</a>
            </div>
          </section>

          <section>
            <h3>What do MasseurMatch verification badges mean?</h3>
            <p>
              Badges reflect the reviews completed by MasseurMatch when shown, such as identity
              review, profile review, or photo review. They are trust signals, not a guarantee of
              service quality, licensure, or session outcome.
            </p>
            <h3>Does MasseurMatch verify therapist licenses?</h3>
            <p>
              Not universally. Unless a profile explicitly states otherwise, you should still
              confirm licenses, certifications, boundaries, pricing, and location details directly
              with the provider.
            </p>
            <h3>What should I confirm before scheduling?</h3>
            <p>
              Confirm boundaries, location details, pricing, timing, session format, and contact
              methods directly with the provider before meeting.
            </p>
            <h3>How do I report a safety concern?</h3>
            <p>
              Use the contact page to report suspicious listings, unsafe behavior, or profile
              concerns so the team can review the issue.
            </p>
          </section>
        </div>
      </>
    </LegalPage>
  );
}
