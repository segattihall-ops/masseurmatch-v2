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
    <LegalPage title={TITLE} path={PATH} lastUpdated="August 22, 2026">
      <p>
        This Refund and Cancellation Policy governs all paid products on MasseurMatch, including
        subscription plans, add-ons, boost credits, and featured placements. By purchasing any paid
        product, you agree to this policy.
      </p>

      <h2>1. Cancellation</h2>
      <p>
        You may cancel your MasseurMatch subscription at any time through your account settings,
        through any available PayPal subscription-management controls, or by contacting
        <a href="mailto:billing@masseurmatch.com">billing@masseurmatch.com</a>.
      </p>
      <ul>
        <li>
          Cancellations for monthly plans take effect at the end of the current monthly billing
          period unless otherwise stated or required by law.
        </li>
        <li>
          Cancellations for annual plans take effect at the end of the current annual billing period
          unless otherwise stated or required by law.
        </li>
        <li>
          You retain access to paid plan features through the end of the period for which you have
          paid, unless your account is suspended or terminated for a policy or safety reason.
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
        Refund eligibility is determined by MasseurMatch based on this policy and applicable law.
        Approval of a refund in one case does not create an obligation to issue refunds in other
        cases.
      </p>

      <h2>4. Policy Violations</h2>
      <p>
        Accounts suspended or terminated for violations of platform policies — including content
        violations, prohibited conduct, fraudulent activity, or any other policy breach — are not
        eligible for refunds, except where a refund is required by applicable law.
      </p>

      <h2>5. Add-Ons and Boost Credits</h2>
      <p>
        Add-ons and boost credits are generally non-refundable once purchased. Used boost credits
        cannot be reversed. Unused add-ons or credits remaining at account closure may be forfeited,
        except where applicable law requires otherwise or MasseurMatch expressly approves a credit
        or refund.
      </p>

      <h2>6. Featured Placements</h2>
      <p>
        Featured placement fees are generally non-refundable once the placement period has begun. If
        a featured placement cannot be delivered due to a platform error, a pro-rated credit or
        refund may be offered at our discretion or as required by law.
      </p>

      <h2>7. Payment Processor and Refund Timing</h2>
      <p>
        MasseurMatch uses PayPal as its third-party payment processor for paid platform products.
        Approved refunds are submitted through PayPal to the original payment source when supported.
        The time required for a refund to appear depends on PayPal, the original funding source, and
        the applicable bank or card issuer. MasseurMatch does not control posting or settlement time
        after an approved refund has been submitted to PayPal.
      </p>
      <p>
        Payment credentials and full payment-method details are handled by PayPal rather than stored
        in full by MasseurMatch. Your payment activity may also be subject to PayPal&apos;s
        applicable user agreements, privacy terms, and dispute procedures.
      </p>

      <h2>8. Payment Disputes and Chargebacks</h2>
      <p>
        If you believe a MasseurMatch charge is incorrect, contact us first at
        <a href="mailto:billing@masseurmatch.com">billing@masseurmatch.com</a> so we can review the
        issue. You may also have dispute rights through PayPal, your bank, or your card issuer.
      </p>
      <p>
        If you initiate a payment dispute or chargeback, MasseurMatch may temporarily suspend the
        affected paid features while the transaction is reviewed. Fraudulent or abusive disputes may
        result in account restrictions or termination, subject to applicable law.
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
        <li>
          The PayPal transaction or subscription identifier, if available, without sending passwords
          or full payment credentials.
        </li>
        <li>Any supporting documentation, such as a screenshot of a billing error.</li>
      </ul>
      <p>We aim to respond within 3 business days.</p>

      <h2>10. Annual Plans</h2>
      <p>
        Annual subscriptions are generally non-refundable after the first 14 calendar days from the
        initial purchase date, except as required by law. Within the first 14 days, you may request
        a prorated refund for the unused portion. Any approved refund will be processed through
        PayPal to the original payment source when supported.
      </p>

      <h2>11. Changes to This Policy</h2>
      <p>
        We may update this policy at any time. Updated terms apply to purchases and renewals made
        after the effective date, subject to applicable law.
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
