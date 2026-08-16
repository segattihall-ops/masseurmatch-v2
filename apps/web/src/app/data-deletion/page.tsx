import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Data Deletion Request Policy";
const DESCRIPTION =
  "How to request deletion of your personal data from MasseurMatch, what data we can remove, and what data may be retained for legal or operational reasons.";
const PATH = "/data-deletion";

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
        This policy explains how users can request deletion of their personal data from
        MasseurMatch, what data may be deleted, what data may be retained, and how we handle
        deletion requests. This policy should be read alongside our
        <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>1. Your Right to Request Deletion</h2>
      <p>
        You may request that MasseurMatch delete personal data we hold about you. This right applies
        to information you have provided directly (such as your account details and profile content)
        and certain data we have collected about your use of the platform, subject to the exceptions
        below.
      </p>
      <p>
        This right applies under various privacy laws including the California Consumer Privacy Act
        (CCPA/CPRA) and other applicable US state privacy laws. If you are a resident of a state
        with applicable privacy protections, you may exercise this right at no cost.
      </p>

      <h2>2. How to Submit a Deletion Request</h2>
      <p>To submit a data deletion request:</p>
      <ul>
        <li>
          <strong>Email:</strong> Send your request to
          <a href="mailto:privacy@masseurmatch.com">privacy@masseurmatch.com</a> with the subject
          line &quot;Data Deletion Request.&quot;
        </li>
        <li>
          <strong>Include:</strong> Your full name, the email address associated with your
          MasseurMatch account, and a description of the data you want deleted (or a request to
          delete all data we hold about you).
        </li>
      </ul>

      <h2>3. Identity Verification</h2>
      <p>
        To protect your privacy and prevent unauthorized deletion of your data, we will verify your
        identity before processing a deletion request. Verification may include confirming your
        email address through a message to the address on file, or requesting additional account
        information sufficient to confirm your identity.
      </p>
      <p>
        We will not process deletion requests that we cannot reasonably verify as coming from the
        account holder or an authorized representative.
      </p>

      <h2>4. What We Will Delete</h2>
      <p>Upon a verified and eligible request, we will delete or de-identify:</p>
      <ul>
        <li>Your account profile information (name, bio, photos, service descriptions).</li>
        <li>Contact information associated with your account.</li>
        <li>
          Subscription and billing details, to the extent permitted by law and not needed for legal
          records.
        </li>
        <li>Platform usage data and preferences tied to your account.</li>
        <li>
          Communications and messages stored in your account, to the extent technically feasible.
        </li>
      </ul>

      <h2>5. What We May Retain</h2>
      <p>
        Certain data may be retained even after a deletion request for legitimate legal,
        operational, security, or compliance reasons, including:
      </p>
      <ul>
        <li>Financial records and transaction histories required by tax or accounting law.</li>
        <li>Records necessary to resolve pending disputes, refund requests, or chargebacks.</li>
        <li>Data required for fraud prevention, security investigations, or platform integrity.</li>
        <li>Information we are legally required to retain under applicable law.</li>
        <li>
          Aggregated, anonymized, or de-identified data that cannot reasonably be used to identify
          you.
        </li>
        <li>
          Backup copies that exist in archived systems, which will be deleted on our standard
          retention schedule.
        </li>
        <li>
          Records of prior enforcement actions, bans, or safety incidents, to prevent circumvention.
        </li>
      </ul>

      <h2>6. Account Closure</h2>
      <p>
        A data deletion request will typically result in the closure of your MasseurMatch account.
        If you only want to close your account without a full data deletion request, contact
        <a href="mailto:support@masseurmatch.com">support@masseurmatch.com</a>.
      </p>

      <h2>7. Response Timeline</h2>
      <p>
        We will acknowledge your request within 10 business days. We will complete eligible deletion
        within 45 calendar days of receiving a verified request, consistent with applicable law. If
        additional time is required, we will notify you with a reason and an estimated completion
        date.
      </p>

      <h2>8. Requests on Behalf of Others</h2>
      <p>
        You may submit a deletion request on behalf of another person if you are an authorized
        representative (such as a legal guardian or person with power of attorney). We may require
        documentation of your authorization before processing.
      </p>

      <h2>9. Third-Party Services</h2>
      <p>
        MasseurMatch uses third-party service providers (such as payment processors and analytics
        tools) that may hold data related to your account. We will coordinate with those processors
        to the extent possible, but some data held by third parties may be subject to their own
        retention policies.
      </p>

      <h2>10. Changes to This Policy</h2>
      <p>
        We may update this policy from time to time. Updates will be posted on this page with a
        revised effective date.
      </p>

      <h2>11. Contact</h2>
      <p>
        Data deletion requests:{" "}
        <a href="mailto:privacy@masseurmatch.com">privacy@masseurmatch.com</a>.<br />
        Response window: 45 calendar days.
        <br />
        Operator: XRankFlow Media Group LLC — Dover, Delaware, USA.
      </p>
    </LegalPage>
  );
}
