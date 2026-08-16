import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "SMS Terms and Consent Policy";
const DESCRIPTION =
  "MasseurMatch SMS terms: how we use text messaging, how to opt in and out, message frequency, and data rate disclosures.";
const PATH = "/sms-terms";

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
        This SMS Terms and Consent Policy describes how MasseurMatch, operated by XRankFlow Media
        Group LLC, may send text messages to users who have provided a phone number and given
        consent to receive SMS communications.
      </p>

      <h2>1. Consent to Receive SMS</h2>
      <p>
        By providing your mobile phone number and affirmatively opting in to SMS communications
        through the MasseurMatch platform (such as at account registration, profile setup, or a
        specific opt-in form), you consent to receive text messages from MasseurMatch at the number
        you provide. Consent is not a condition of purchasing any subscription, add-on, or service.
      </p>

      <h2>2. Types of Messages</h2>
      <p>MasseurMatch may send the following types of text messages:</p>
      <ul>
        <li>
          <strong>Account and security alerts:</strong> Account verification codes, password resets,
          login notifications, and security notices.
        </li>
        <li>
          <strong>Platform notifications:</strong> Profile status updates, moderation notices,
          review requests, and waitlist updates.
        </li>
        <li>
          <strong>Billing reminders:</strong> Subscription renewal notices, payment confirmations,
          or billing issue alerts.
        </li>
        <li>
          <strong>Marketing messages:</strong> Platform announcements, feature updates, and
          promotional communications (only with express written consent for this category).
        </li>
      </ul>

      <h2>3. Message Frequency</h2>
      <p>
        Message frequency varies. Transactional messages are sent as triggered by account activity.
        Marketing messages, if you have opted in, will be sent periodically. You may receive up to
        several messages per month depending on your account activity and preferences.
      </p>

      <h2>4. Message and Data Rates</h2>
      <p>
        <strong>Message and data rates may apply.</strong> Standard carrier messaging rates apply to
        all SMS messages you receive. MasseurMatch is not responsible for any charges your wireless
        carrier applies. Check with your carrier if you are unsure about your messaging plan.
      </p>

      <h2>5. How to Opt Out</h2>
      <p>
        You may opt out of SMS messages at any time by texting <strong>STOP</strong> to the number
        from which you received a message. After opting out, you will receive a single confirmation
        message. No further marketing messages will be sent. You may continue to receive
        transactional messages related to your account (such as security alerts or billing notices)
        unless you also close your account.
      </p>
      <p>
        To re-enable SMS messages after opting out, text <strong>START</strong> to the same number.
      </p>

      <h2>6. Help</h2>
      <p>
        For assistance with SMS messages, text <strong>HELP</strong> to the number from which you
        received a message, or contact
        <a href="mailto:support@masseurmatch.com">support@masseurmatch.com</a>. Include your phone
        number (last 4 digits) and a description of the issue.
      </p>

      <h2>7. Supported Carriers</h2>
      <p>
        MasseurMatch SMS services are available through major US wireless carriers. Carrier
        availability may vary. We are not responsible for message delivery failures caused by
        carrier issues, phone configuration, or network conditions.
      </p>

      <h2>8. No Obligation</h2>
      <p>
        Consent to receive marketing SMS messages is optional and is never a condition of using the
        platform or purchasing a subscription or add-on. You may use MasseurMatch without consenting
        to marketing text messages.
      </p>

      <h2>9. Consent Records</h2>
      <p>
        MasseurMatch retains records of SMS consent, including the date, method of opt-in, and phone
        number provided, in accordance with our Privacy Policy and applicable law.
      </p>

      <h2>10. Changes to This Policy</h2>
      <p>
        We may update this policy at any time. Changes will be posted on this page with an updated
        date. Continued use of SMS services after changes constitutes acceptance of the updated
        policy.
      </p>

      <h2>11. Contact</h2>
      <p>
        SMS support: <a href="mailto:support@masseurmatch.com">support@masseurmatch.com</a>.<br />
        General inquiries: <a href="mailto:legal@masseurmatch.com">legal@masseurmatch.com</a>.<br />
        Operator: XRankFlow Media Group LLC — Dover, Delaware, USA.
      </p>
    </LegalPage>
  );
}
