import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Client and User Terms";
const DESCRIPTION =
  "Terms for clients and users browsing the MasseurMatch directory — your responsibilities, conduct standards, and platform rules.";
const PATH = "/client-terms";

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
      <p>
        These Client and User Terms apply to anyone who browses, searches, contacts providers
        through, or otherwise uses the MasseurMatch directory as a client or visitor. By using the
        platform, you agree to these terms.
      </p>

      <h2>1. Platform Role</h2>
      <p>
        MasseurMatch is a directory platform operated by XRankFlow Media Group LLC. The platform
        does not provide massage or bodywork services, employ providers, book appointments, process
        in-person session payments, or manage provider calendars. Providers listed on MasseurMatch
        are independent third parties.
      </p>

      <h2>2. Eligibility</h2>
      <ul>
        <li>You must be at least 18 years old to use MasseurMatch.</li>
        <li>You must be legally permitted to use online platforms in your jurisdiction.</li>
        <li>You may not use the platform on behalf of any person under 18.</li>
        <li>By using the platform, you represent and warrant that you meet these requirements.</li>
      </ul>

      <h2>3. Your Responsibilities</h2>
      <p>
        As a client or visitor, you are solely responsible for your own decisions. MasseurMatch does
        not guarantee provider quality, legality, credentials, safety, availability, or results. You
        must:
      </p>
      <ul>
        <li>Independently evaluate any provider before contacting, scheduling, or meeting them.</li>
        <li>Conduct your own due diligence on provider credentials, licensing, and suitability.</li>
        <li>Make your own safety decisions before scheduling or attending any session.</li>
        <li>
          Handle all communication, scheduling, and payment arrangements directly with providers.
        </li>
        <li>Comply with all applicable laws in your jurisdiction.</li>
      </ul>

      <h2>4. Prohibited Conduct</h2>
      <p>The following conduct is prohibited on MasseurMatch:</p>
      <ul>
        <li>
          Soliciting or requesting sexual services, erotic services, or any other illegal activity.
        </li>
        <li>Harassing, threatening, or intimidating any provider or other user.</li>
        <li>
          Using discriminatory language targeting race, ethnicity, gender, sexuality, religion,
          disability, or national origin.
        </li>
        <li>Creating fake accounts, impersonating others, or submitting false information.</li>
        <li>Posting false, misleading, or defamatory reviews or messages.</li>
        <li>Scraping, crawling, or automated data collection without written permission.</li>
        <li>Using the platform for any commercial purpose not authorized by MasseurMatch.</li>
        <li>Attempting to circumvent platform safety or moderation features.</li>
      </ul>

      <h2>5. No Guarantee of Provider Quality or Safety</h2>
      <p>
        MasseurMatch does not verify professional licenses, conduct background checks, guarantee
        provider credentials, or independently confirm that any provider is safe, qualified, legal,
        available, or suitable for any particular purpose. Badges and profile signals are limited
        platform indicators only and are not endorsements, guarantees, or verifications.
      </p>
      <p>
        You are solely responsible for your own safety before, during, and after any interaction
        with a provider. If you have concerns about personal safety, contact local law enforcement
        or emergency services — not MasseurMatch.
      </p>

      <h2>6. Reviews and Content</h2>
      <p>
        If you submit a review or any other content through the platform, you grant MasseurMatch a
        non-exclusive license to display, format, moderate, and use that content to operate the
        platform. Reviews must be truthful, based on genuine experience, and must not contain false,
        defamatory, harassing, or illegal content. We reserve the right to remove any content that
        violates platform standards.
      </p>

      <h2>7. No Sexual Services</h2>
      <p>
        Sexual content, erotic services, escort services, prostitution, trafficking, explicit
        nudity, and solicitation are strictly prohibited on MasseurMatch. Any request or
        communication of this nature will result in immediate account termination and may be
        escalated to law enforcement.
      </p>

      <h2>8. Third-Party Interactions</h2>
      <p>
        Any communication, scheduling, service arrangement, payment, or meeting you undertake with a
        provider is solely between you and that provider. MasseurMatch is not a party to those
        arrangements and has no responsibility for their outcome.
      </p>

      <h2>9. Dispute Resolution</h2>
      <p>
        These terms are governed by the laws of the State of Delaware. Disputes between you and
        MasseurMatch must first be submitted in writing for good-faith informal resolution. Many
        disputes will be subject to binding individual arbitration; class-action proceedings are
        waived to the extent permitted by law.
      </p>

      <h2>10. Account Termination</h2>
      <p>
        MasseurMatch reserves the right to suspend or terminate your access to the platform at any
        time for violations of these terms, the Community Guidelines, or any other platform policy.
        We may take action without prior notice when safety, legal, or fraud concerns are involved.
      </p>

      <h2>11. Changes to These Terms</h2>
      <p>
        We may update these terms from time to time. Changes will be posted on this page with an
        updated effective date. Continued use of the platform after any change constitutes your
        acceptance of the updated terms.
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions about these terms can be sent to
        <a href="mailto:legal@masseurmatch.com">legal@masseurmatch.com</a>.<br />
        Operator: XRankFlow Media Group LLC — Dover, Delaware, USA.
      </p>
    </LegalPage>
  );
}
