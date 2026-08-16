import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Provider Terms";
const DESCRIPTION =
  "Terms for independent massage therapists and wellness providers listing on MasseurMatch — responsibilities, content standards, billing, and platform relationship.";
const PATH = "/provider-terms";

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
        These Provider Terms apply to independent massage therapists, bodywork practitioners, and
        wellness providers (&quot;Providers&quot;) who create, maintain, or pay for a listing on
        MasseurMatch. These terms supplement the general
        <a href="/terms">Terms of Service</a> and, for paid listings, the
        <a href="/subscriptions">Paid Subscription and Add-On Terms</a>.
      </p>

      <h2>1. Independent Provider Relationship</h2>
      <p>
        Providers listed on MasseurMatch are independent third parties. Nothing in these terms or on
        the platform creates an employment, contractor, staffing agency, franchise, partnership, or
        joint venture relationship between MasseurMatch and any Provider. MasseurMatch does not
        supervise, control, direct, or manage how Providers conduct their services.
      </p>
      <p>
        Providers are solely responsible for their own services, business operations, client
        interactions, pricing, scheduling, income, taxes, licensing, insurance, and legal
        compliance.
      </p>

      <h2>2. Listing Eligibility</h2>
      <p>To list on MasseurMatch, Providers must:</p>
      <ul>
        <li>Be at least 18 years old.</li>
        <li>
          Be legally permitted to provide the services advertised in the applicable jurisdiction.
        </li>
        <li>Provide truthful, accurate, and current profile information.</li>
        <li>Comply with all applicable local, state, and federal laws governing their services.</li>
        <li>Agree to these Provider Terms and the general Terms of Service.</li>
      </ul>

      <h2>3. No License Verification</h2>
      <p>
        MasseurMatch does not verify professional licenses, certifications, background history,
        insurance coverage, or credentials. Providers are responsible for their own compliance with
        all applicable licensing and certification requirements. Any professional credentials
        displayed on a profile are self-declared and not independently confirmed by MasseurMatch
        unless explicitly stated otherwise.
      </p>

      <h2>4. Profile Content Standards</h2>
      <p>Provider profile content must be:</p>
      <ul>
        <li>Truthful, accurate, and not misleading.</li>
        <li>Professional and non-sexual in nature.</li>
        <li>Free of explicit nudity, erotic content, or sexually suggestive material.</li>
        <li>Free of false credentials, stolen photos, or impersonation.</li>
        <li>
          Compliant with the <a href="/photo-profile-policy">Photo and Profile Content Policy</a>.
        </li>
        <li>
          Kept current — Providers are responsible for updating outdated information promptly.
        </li>
      </ul>

      <h2>5. Prohibited Services and Conduct</h2>
      <p>
        Providers may not use MasseurMatch to offer, advertise, imply, or solicit sexual services,
        erotic massage, escort services, or any other illegal or prohibited activity. Violations
        will result in immediate account termination and potential referral to law enforcement.
      </p>
      <p>
        Providers must treat all clients and users with respect, must not engage in harassment,
        discrimination, or coercive conduct, and must comply with the
        <a href="/prohibited-conduct">Prohibited Conduct Policy</a>.
      </p>

      <h2>6. Provider Responsibilities</h2>
      <p>Providers are solely responsible for:</p>
      <ul>
        <li>All client communications, scheduling, screening, and session arrangements.</li>
        <li>Setting and collecting their own service fees directly from clients.</li>
        <li>Their own safety practices before, during, and after client interactions.</li>
        <li>Maintaining any required professional liability insurance.</li>
        <li>Reporting and paying all applicable taxes on income earned.</li>
        <li>Compliance with applicable professional licensing standards in their jurisdiction.</li>
      </ul>

      <h2>7. Paid Listings and Visibility Tools</h2>
      <p>
        Paid subscription plans, add-ons, boost credits, and featured placements may increase
        display opportunities but do not guarantee leads, clients, bookings, income, revenue,
        messages, views, or any specific search ranking. See the
        <a href="/subscriptions">Paid Subscription and Add-On Terms</a> and
        <a href="/advertising-terms">Advertising and Featured Placement Terms</a> for full details.
      </p>

      <h2>8. Content License</h2>
      <p>
        You retain ownership of your profile content. By submitting it to MasseurMatch, you grant
        MasseurMatch a non-exclusive, worldwide, royalty-free license to host, display, format,
        moderate, and use your content to operate the platform, promote the directory, and improve
        platform features.
      </p>

      <h2>9. Moderation and Removal</h2>
      <p>
        MasseurMatch may review, edit, suspend, or remove any profile or listing at any time for
        policy violations, safety concerns, or quality issues. We may suspend paid listings without
        refund if the account is in violation of platform policies. See the
        <a href="/moderation-policy">Moderation Policy</a> for details.
      </p>

      <h2>10. Billing</h2>
      <p>
        Paid listings renew automatically unless canceled before the renewal date. Failed payments
        may result in listing suspension. Refunds are governed by the
        <a href="/refund-policy">Refund and Cancellation Policy</a>.
      </p>

      <h2>11. Changes to These Terms</h2>
      <p>
        We may update these terms at any time. Changes will be posted on this page with an updated
        effective date. Continued use of the platform after changes constitutes acceptance.
      </p>

      <h2>12. Contact</h2>
      <p>
        Provider questions: <a href="mailto:support@masseurmatch.com">support@masseurmatch.com</a>.
        <br />
        Billing questions: <a href="mailto:billing@masseurmatch.com">billing@masseurmatch.com</a>.
        <br />
        Operator: XRankFlow Media Group LLC — Dover, Delaware, USA.
      </p>
    </LegalPage>
  );
}
