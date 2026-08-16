import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Email Marketing and Opt-Out Policy";
const DESCRIPTION =
  "How MasseurMatch uses email, what types of messages we send, and how to manage or unsubscribe from marketing emails.";
const PATH = "/email-opt-out";

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
        This policy describes how MasseurMatch, operated by XRankFlow Media Group LLC, sends emails
        to users, what categories of email we send, and how you can manage your email preferences or
        opt out of marketing communications.
      </p>

      <h2>1. Types of Emails We Send</h2>

      <h3>Transactional Emails</h3>
      <p>
        Transactional emails are sent in direct response to your actions or account status. These
        include:
      </p>
      <ul>
        <li>Account registration confirmation and verification.</li>
        <li>Password reset and security notifications.</li>
        <li>Subscription confirmations, payment receipts, and billing notices.</li>
        <li>Profile status updates, moderation notices, and approval decisions.</li>
        <li>Replies to support inquiries you have submitted.</li>
      </ul>
      <p>
        Transactional emails are sent as part of operating the service. You may still receive these
        even if you have unsubscribed from marketing communications.
      </p>

      <h3>Marketing Emails</h3>
      <p>Marketing emails are sent periodically to users who have opted in. These include:</p>
      <ul>
        <li>Platform announcements and new feature updates.</li>
        <li>Promotional offers for subscriptions or add-ons.</li>
        <li>Wellness industry news and content highlights.</li>
        <li>Tips and guidance for providers on improving their listings.</li>
        <li>Waitlist updates and early-access invitations.</li>
      </ul>

      <h3>Provider-Specific Emails</h3>
      <p>
        Providers may receive platform guidance, performance summaries, and account-specific
        recommendations related to their listings.
      </p>

      <h2>2. How to Unsubscribe from Marketing Emails</h2>
      <p>
        You may unsubscribe from marketing emails at any time using one of the following methods:
      </p>
      <ul>
        <li>
          <strong>Unsubscribe link:</strong> Every marketing email includes an unsubscribe link at
          the bottom. Click it to be removed from the marketing list immediately.
        </li>
        <li>
          <strong>Email request:</strong> Send an email to{" "}
          <a href="mailto:support@masseurmatch.com">support@masseurmatch.com</a> with the subject
          &quot;Unsubscribe&quot; and include the email address you want removed.
        </li>
        <li>
          <strong>Account settings:</strong> Manage your communication preferences in your account
          settings if available.
        </li>
      </ul>
      <p>
        Unsubscribe requests are processed within 10 business days in compliance with the CAN-SPAM
        Act. After unsubscribing, you may still receive transactional or legally required emails.
      </p>

      <h2>3. Email Identification</h2>
      <p>
        All marketing emails from MasseurMatch will clearly identify the sender as MasseurMatch or
        XRankFlow Media Group LLC and will include a physical mailing address. Subject lines will
        accurately represent the content of the message. We will not use deceptive or misleading
        subject lines.
      </p>

      <h2>4. Third-Party Email Processors</h2>
      <p>
        We use third-party email service providers to deliver messages. These processors handle your
        email address and delivery data in accordance with our Privacy Policy and applicable data
        protection law. We do not sell your email address to third parties.
      </p>

      <h2>5. Minors</h2>
      <p>
        MasseurMatch does not knowingly collect email addresses from or send marketing emails to
        individuals under 18 years of age.
      </p>

      <h2>6. Changes to This Policy</h2>
      <p>
        We may update this policy at any time. Changes will be posted on this page with an updated
        effective date.
      </p>

      <h2>7. Contact</h2>
      <p>
        Email preferences: <a href="mailto:support@masseurmatch.com">support@masseurmatch.com</a>.
        <br />
        Privacy requests: <a href="mailto:privacy@masseurmatch.com">privacy@masseurmatch.com</a>.
        <br />
        Operator: XRankFlow Media Group LLC — Dover, Delaware, USA.
      </p>
    </LegalPage>
  );
}
