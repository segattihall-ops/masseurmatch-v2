import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Advertising and Featured Placement Terms";
const DESCRIPTION =
  "Terms for advertising, featured placements, sponsored listings, and paid visibility tools on MasseurMatch.";
const PATH = "/advertising-terms";

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
        These Advertising and Featured Placement Terms apply to all paid visibility products on
        MasseurMatch, including featured placements, boost credits, sponsored positions, and any
        other promotional placement tools. These terms supplement the
        <a href="/subscriptions">Paid Subscription and Add-On Terms</a> and the general
        <a href="/terms">Terms of Service</a>.
      </p>

      <h2>1. What Advertising and Placement Tools Cover</h2>
      <p>MasseurMatch may offer the following types of paid promotional placement:</p>
      <ul>
        <li>
          <strong>Featured listings:</strong> Promoted positions within search results, category
          pages, or city-specific directory pages.
        </li>
        <li>
          <strong>Boost credits:</strong> Temporary increases in a profile&apos;s visibility within
          relevant search results or listings.
        </li>
        <li>
          <strong>Sponsored positions:</strong> Reserved placement at the top of specific search
          result pages or category feeds.
        </li>
        <li>
          <strong>Highlighted profile badges:</strong> Visual indicators that may increase profile
          click-through rates in directory listings.
        </li>
      </ul>

      <h2>2. No Guarantee of Performance</h2>
      <p>
        Paid advertising and featured placement tools may increase display opportunities for your
        profile, but MasseurMatch makes no guarantees regarding:
      </p>
      <ul>
        <li>The number of views, impressions, or clicks your profile will receive.</li>
        <li>The number of messages, inquiries, or leads generated.</li>
        <li>Bookings, clients, income, or revenue resulting from any placement.</li>
        <li>Your profile&apos;s rank or position at any specific time.</li>
        <li>Conversion rates from any promotional placement.</li>
      </ul>
      <p>
        Visibility placement is influenced by factors including user search behavior, location,
        applied filters, subscription tier, moderation status, platform algorithm updates, and
        platform discretion.
      </p>

      <h2>3. Advertiser Responsibilities</h2>
      <p>Providers and advertisers remain fully responsible for:</p>
      <ul>
        <li>The accuracy and truthfulness of all profile content, including promoted listings.</li>
        <li>Compliance with all applicable laws, including truth-in-advertising standards.</li>
        <li>
          Ensuring that promoted content does not contain prohibited, misleading, sexual, or illegal
          material.
        </li>
        <li>Their own business compliance, licensing, taxation, and legal obligations.</li>
        <li>Their own communication, scheduling, service delivery, and client interactions.</li>
      </ul>

      <h2>4. MasseurMatch&apos;s Right to Reject or Remove Placements</h2>
      <p>
        MasseurMatch reserves the right to reject, remove, pause, or modify any advertising
        placement or promotion at any time, for any reason, including:
      </p>
      <ul>
        <li>
          Content that violates platform policies, including the Content Guidelines or Prohibited
          Conduct Policy.
        </li>
        <li>Misleading, deceptive, or unsubstantiated claims in the promoted profile.</li>
        <li>Sexual, erotic, or illegal content or implied services.</li>
        <li>Safety concerns or active moderation investigations.</li>
        <li>Technical issues or required platform maintenance.</li>
        <li>Platform updates or category restructuring.</li>
      </ul>
      <p>
        Removal or rejection of a placement due to a policy violation does not entitle the
        advertiser to a refund, except where required by applicable law.
      </p>

      <h2>5. Placement Availability</h2>
      <p>
        Featured and sponsored placements are subject to availability. MasseurMatch does not
        guarantee that specific positions or placement types will be available at any given time.
        Placement inventory may vary by city, category, search term, subscription tier, or platform
        configuration.
      </p>

      <h2>6. Billing and Refunds</h2>
      <p>
        Advertising and placement fees are processed through PayPal and are governed by the
        <a href="/subscriptions">Paid Subscription and Add-On Terms</a> and the
        <a href="/refund-policy">Refund and Cancellation Policy</a>. Placement fees are generally
        non-refundable once a placement period has begun, except where required by applicable law or
        expressly approved under the Refund and Cancellation Policy.
      </p>
      <p>
        Approved refunds are submitted through PayPal to the original payment source when supported.
        Posting and settlement timing may depend on PayPal, the funding source, and the applicable
        bank or card issuer.
      </p>

      <h2>7. Disclosure of Paid Placement</h2>
      <p>
        MasseurMatch may label or distinguish paid or featured placements within the directory to
        comply with applicable advertising disclosure requirements. The method and format of
        labeling is at MasseurMatch&apos;s discretion.
      </p>

      <h2>8. Changes to Advertising Products</h2>
      <p>
        MasseurMatch may change, add, or remove advertising products at any time. Material changes
        that affect active placements will be communicated with reasonable notice.
      </p>

      <h2>9. Contact</h2>
      <p>
        Advertising inquiries:{" "}
        <a href="mailto:support@masseurmatch.com">support@masseurmatch.com</a>.<br />
        Billing and placement questions:{" "}
        <a href="mailto:billing@masseurmatch.com">billing@masseurmatch.com</a>.<br />
        Operator: XRankFlow Media Group LLC — Dover, Delaware, USA.
      </p>
    </LegalPage>
  );
}
