import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Refund and Cancellation Policy";
const DESCRIPTION =
  "MasseurMatch refund and cancellation policy — how to cancel subscriptions, when refunds apply, and what happens to unused add-ons.";
const PATH = "/refund-policy";

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
        This Refund and Cancellation Policy governs all paid products on MasseurMatch, including
        subscription plans, add-ons, boost credits, and featured placements. By purchasing any paid
        product, you agree to this policy.
      </p>

      <h2>1. Cancellation</h2>
      <p>
        You may cancel your MasseurMatch subscription at any time through your account settings or
        by contacting
        <a href="mailto:billing@masseurmatch.com">billing@masseurmatch.com</a>.
      </p>
      <ul>
        <li>
          Cancellations for monthly plans take effect at the end of the current monthly billing
          period.
        </li>
        <li>
          Cancellations for annual plans take effect at the end of the current annual billing
          period.
        </li>
        <li>
          You retain access to paid plan features through the end of the period for which you have
          paid.
        </li>
        <li>
          Your listing will revert to the appropriate free or lower tier at the end of the billing
          period.
        </li>
      </ul>

      <h2>2. Refunds — General Principle</h2>
      <p>
        MasseurMatch subscription fees are generally non-refundable. This includes cases where you
        cancel before the end of a billing period, are dissatisfied with visibility, leads,
        messages, bookings, client acquisition, or income results, or where you simply no longer
        wish to use the service.
      </p>
      <p>
        We do not issue refunds based solely on lack of performance, views, messages, leads,
        bookings, clients, income, revenue, or profile ranking. Paid visibility is an opportunity,
        not a guarantee.
      </p>

      <h2>3. Refunds — When They May Apply</h2>
      <p>Refunds or credits may be considered in the following limited circumstances:</p>
      <ul>
        <li>
          <strong>Billing errors:</strong> If you were charged an incorrect amount or charged after
          a valid cancellation was processed.
        </li>
        <li>
          <strong>Duplicate charges:</strong> If you were charged multiple times for the same period
          due to a technical error.
        </li>
        <li>
          <strong>Platform outage:</strong> If a significant, extended platform outage prevented you
          from accessing a paid feature for a material portion of your billing period.
        </li>
        <li>
          <strong>Legal requirement:</strong> If a refund is required under applicable law based on
          your location and circumstances.
        </li>
        <li>
          <strong>Account removal by MasseurMatch:</strong> If MasseurMatch removes your account
          without cause (i.e., without a policy violation), a prorated refund for the unused portion
          of your subscription may be issued at our discretion.
        </li>
      </ul>
      <p>
        Refund eligibility is determined at MasseurMatch&apos;s sole discretion. Approval of a
        refund in one case does not create an obligation to issue refunds in similar cases.
      </p>

      <h2>4. Policy Violations</h2>
      <p>
        Accounts suspended or terminated for violations of platform policies — including content
        violations, prohibited conduct, fraudulent activity, or any other policy breach — are not
        eligible for refunds, regardless of the remaining subscription period or unused add-ons.
      </p>

      <h2>5. Add-Ons and Boost Credits</h2>
      <p>
        Add-ons and boost credits are non-refundable once purchased. Used boost credits cannot be
        reversed. Unused add-ons or credits remaining at account closure are forfeited and are not
        eligible for refund.
      </p>

      <h2>6. Featured Placements</h2>
      <p>
        Featured placement fees are non-refundable once the placement period has begun. If a
        featured placement cannot be delivered due to a platform error, a pro-rated credit may be
        offered at our discretion.
      </p>

      <h2>7. Payment Processor Limitations</h2>
      <p>
        All payments are processed by Stripe. Refunds processed through Stripe typically appear on
        your original payment method within 5–10 business days, depending on your bank or card
        issuer. We do not control the timeline for your bank to post a credit.
      </p>

      <h2>8. Chargebacks</h2>
      <p>
        If you initiate a chargeback or payment dispute through your bank or card issuer before
        contacting us to resolve a billing issue, we may suspend your account pending resolution.
        Fraudulent chargebacks may result in permanent account termination. We encourage you to
        contact us first so we can resolve billing concerns promptly.
      </p>

      <h2>9. How to Request a Refund</h2>
      <p>
        To request a refund, contact
        <a href="mailto:billing@masseurmatch.com">billing@masseurmatch.com</a> with:
      </p>
      <ul>
        <li>Your account email address.</li>
        <li>The transaction date and amount.</li>
        <li>The reason for your refund request.</li>
        <li>Any supporting documentation (such as a screenshot of a billing error).</li>
      </ul>
      <p>We will respond within 3 business days.</p>

      <h2>10. Annual Plans</h2>
      <p>
        Annual subscriptions are non-refundable after the first 14 calendar days from the initial
        purchase date, except as required by law. Within the first 14 days, you may request a
        prorated refund for the unused portion if you cancel for any reason.
      </p>

      <h2>11. Changes to This Policy</h2>
      <p>
        We may update this policy at any time. Updated terms apply to purchases made after the
        effective date.
      </p>

      <h2>12. Contact</h2>
      <p>
        Billing and refund requests:{" "}
        <a href="mailto:billing@masseurmatch.com">billing@masseurmatch.com</a>.<br />
        Response window: 3 business days.
        <br />
        Operator: XRankFlow Media Group LLC — Dover, Delaware, USA.
      </p>
    </LegalPage>
  );
}
