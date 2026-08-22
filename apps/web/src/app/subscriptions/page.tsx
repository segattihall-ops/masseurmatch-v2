import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Paid Subscription and Add-On Terms";
const DESCRIPTION =
  "Terms governing paid subscriptions, add-ons, boosts, and visibility tools on MasseurMatch — billing, renewal, and important limitations.";
const PATH = "/subscriptions";

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
        These Paid Subscription and Add-On Terms govern all paid products available through
        MasseurMatch, including provider subscription plans, profile add-ons, boost credits, and
        featured placement tools. These terms supplement the general
        <a href="/terms">Terms of Service</a> and the
        <a href="/provider-terms">Provider Terms</a>. By purchasing any paid product, you agree to
        these terms.
      </p>

      <h2>1. What Paid Products Cover</h2>
      <p>MasseurMatch offers the following categories of paid products:</p>
      <ul>
        <li>
          <strong>Subscription plans:</strong> Recurring monthly or annual plans that grant
          providers a listed profile with plan-specific features and visibility benefits.
        </li>
        <li>
          <strong>Add-ons:</strong> Optional paid features purchased separately, such as additional
          photo slots, highlight badges, priority contact buttons, or analytics access.
        </li>
        <li>
          <strong>Boost credits:</strong> Credits used to temporarily increase a profile&apos;s
          visibility in relevant search results or category pages.
        </li>
        <li>
          <strong>Featured placement:</strong> Placement of a profile in promoted positions within
          search results, city pages, or category listings.
        </li>
      </ul>

      <h2>2. Billing and Recurring Charges</h2>
      <p>
        Subscription plans renew automatically at the end of each billing period (monthly or annual)
        unless canceled before the renewal date. By subscribing, you authorize MasseurMatch and
        PayPal, our third-party payment processor, to process recurring charges for the applicable
        subscription price, taxes, and other amounts disclosed at checkout.
      </p>
      <p>
        You are responsible for keeping your PayPal account and any payment method used through
        PayPal current and accurate. Failed, declined, reversed, or otherwise incomplete payments
        may result in suspension or limitation of paid features until the billing issue is resolved.
        We will provide renewal notices where required by applicable law.
      </p>

      <h2>3. Add-Ons and Boost Credits</h2>
      <p>
        Add-ons and boost credits may be purchased separately and are typically non-recurring
        one-time purchases. Some add-ons may be bundled with subscription plans. Boost credits are
        consumed when used and do not carry over indefinitely — check your account for expiration
        terms that apply to your specific credit type.
      </p>

      <h2>4. No Guarantee of Results</h2>
      <p>
        Paid subscriptions, boost credits, add-ons, featured placements, and all other visibility
        tools may increase display opportunities for your profile, but they do not guarantee any
        views, messages, leads, bookings, clients, income, revenue, rankings, or other outcomes.
      </p>
      <p>
        Visibility placement is determined by multiple factors including location, search filters,
        user behavior, subscription tier, moderation status, and platform discretion. MasseurMatch
        does not guarantee any specific position or ranking at any time.
      </p>

      <h2>5. Platform Discretion</h2>
      <p>
        MasseurMatch reserves the right to modify, pause, or remove paid features, placements, or
        visibility tools in its sole discretion, including for policy violations, safety concerns,
        technical maintenance, or platform changes. We are not obligated to provide refunds for paid
        features affected by policy enforcement actions where you are in violation of platform
        rules.
      </p>

      <h2>6. Payment Processing</h2>
      <p>
        MasseurMatch uses PayPal as its third-party payment processor for paid platform products.
        Payment credentials and payment-method details are handled by PayPal rather than stored in
        full by MasseurMatch. Your use of PayPal is also subject to PayPal&apos;s applicable user
        agreements, privacy terms, and payment-processing rules.
      </p>
      <p>
        MasseurMatch is a directory platform only and does not process payments between clients and
        independent providers for massage or bodywork sessions. Payment disputes relating to a
        MasseurMatch subscription or add-on are governed by our
        <a href="/refund-policy">Refund and Cancellation Policy</a>.
      </p>

      <h2>7. Cancellation</h2>
      <p>
        You may cancel your subscription at any time through your account settings, through any
        available PayPal subscription-management controls, or by contacting
        <a href="mailto:billing@masseurmatch.com">billing@masseurmatch.com</a>. Unless otherwise
        stated or required by law, cancellation takes effect at the end of the current billing
        period and access to paid plan features continues through the period already paid for.
      </p>

      <h2>8. Refunds</h2>
      <p>
        Refund eligibility is governed by our
        <a href="/refund-policy">Refund and Cancellation Policy</a>. In general, subscription fees
        are non-refundable except as required by law or in approved cases such as qualifying billing
        errors or duplicate charges. We do not issue refunds based solely on dissatisfaction with
        visibility, leads, bookings, or profile performance.
      </p>
      <p>
        Approved refunds are submitted through PayPal to the original payment source when supported.
        The time required for a refund to appear depends on PayPal, the funding source, and the bank
        or card issuer involved, and is outside MasseurMatch&apos;s control after the refund is
        submitted.
      </p>

      <h2>9. Price Changes</h2>
      <p>
        We reserve the right to change subscription pricing or the features included in each plan.
        For existing subscribers, price changes will be communicated with reasonable advance notice
        and will take effect at the next renewal date, subject to any additional approval PayPal may
        require for a revised subscription.
      </p>

      <h2>10. Content Requirements</h2>
      <p>
        Paid listings remain subject to all platform content policies. Purchasing a paid plan does
        not exempt a profile from moderation. Listings that violate platform rules may be suspended
        or removed without refund, regardless of subscription status.
      </p>

      <h2>11. Changes to These Terms</h2>
      <p>
        We may update these terms at any time. Updated terms will apply to renewals and new
        purchases after the effective date, subject to applicable law.
      </p>

      <h2>12. Contact</h2>
      <p>
        Billing questions: <a href="mailto:billing@masseurmatch.com">billing@masseurmatch.com</a>.
        <br />
        Response window: 3 business days.
        <br />
        Operator: XRankFlow Media Group LLC — Dover, Delaware, USA.
      </p>
    </LegalPage>
  );
}
