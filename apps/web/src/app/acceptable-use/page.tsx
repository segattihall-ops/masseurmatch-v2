import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Acceptable Use Policy";
const DESCRIPTION =
  "What you may and may not do on MasseurMatch — acceptable use, prohibited behavior, and platform conduct standards.";
const PATH = "/acceptable-use";

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
        This Acceptable Use Policy (&quot;AUP&quot;) applies to all users of MasseurMatch, including
        clients, providers, and visitors. By using the platform, you agree to comply with this
        policy. Violations may result in content removal, account suspension, permanent termination,
        or referral to law enforcement.
      </p>

      <h2>1. What MasseurMatch Is</h2>
      <p>
        MasseurMatch is a directory platform for independent massage therapists and wellness
        providers. It is not an employer, agency, booking service, payment processor, or provider of
        massage or bodywork services. All users must use the platform only for its intended lawful
        purpose: discovering and connecting with independent wellness providers.
      </p>

      <h2>2. Permitted Uses</h2>
      <p>Users may use MasseurMatch to:</p>
      <ul>
        <li>Browse and search provider listings for legitimate wellness and massage services.</li>
        <li>Contact providers using the contact information listed on their profiles.</li>
        <li>Create and maintain a provider profile for lawful wellness services.</li>
        <li>Submit truthful, relevant reviews based on genuine direct experience.</li>
        <li>Report policy violations, safety concerns, or platform issues.</li>
      </ul>

      <h2>3. Prohibited Uses — All Users</h2>
      <p>The following uses are prohibited for all users:</p>
      <ul>
        <li>Using the platform for any illegal purpose or in violation of applicable law.</li>
        <li>
          Soliciting, offering, requesting, or facilitating sexual, erotic, or escort services.
        </li>
        <li>Soliciting, facilitating, or promoting human trafficking or exploitation.</li>
        <li>Posting, sending, or sharing explicit, graphic, or pornographic content.</li>
        <li>Harassing, threatening, intimidating, or coercing any other user or person.</li>
        <li>
          Using discriminatory language based on race, ethnicity, gender, sexuality, religion,
          disability, age, or national origin.
        </li>
        <li>Impersonating any person, business, or organization.</li>
        <li>Creating fake or duplicate accounts.</li>
        <li>Submitting false, misleading, or fraudulent information.</li>
        <li>Attempting to defraud MasseurMatch or other users.</li>
        <li>Scraping, crawling, or automated data collection without written authorization.</li>
        <li>Interfering with the platform&rsquo;s technical infrastructure or security systems.</li>
        <li>Attempting to reverse-engineer, decompile, or disassemble any part of the platform.</li>
        <li>Circumventing account suspension or termination through new registrations.</li>
        <li>
          Distributing spam, bulk messages, or unsolicited commercial communications through the
          platform.
        </li>
        <li>
          Posting stolen images, plagiarized content, or others&rsquo; intellectual property without
          authorization.
        </li>
      </ul>

      <h2>4. Prohibited Uses — Providers</h2>
      <p>In addition to the general prohibitions above, providers may not:</p>
      <ul>
        <li>Misrepresent professional credentials, certifications, or licensing.</li>
        <li>
          Use misleading photos, AI-generated faces representing themselves, or stolen profile
          images.
        </li>
        <li>Offer, advertise, or imply sexual, erotic, or illegal services in any format.</li>
        <li>Use paid visibility tools to promote prohibited content or services.</li>
        <li>Create multiple listings for the same individual or practice without authorization.</li>
      </ul>

      <h2>5. Content Standards</h2>
      <p>All content submitted to MasseurMatch must be:</p>
      <ul>
        <li>Truthful and accurate at the time of submission.</li>
        <li>Professional, respectful, and non-discriminatory.</li>
        <li>Free of sexual, erotic, or explicitly suggestive material.</li>
        <li>Compliant with all applicable laws and regulations.</li>
        <li>Original or properly licensed (no stolen or plagiarized content).</li>
      </ul>

      <h2>6. Enforcement</h2>
      <p>
        MasseurMatch may take any of the following actions in response to violations of this policy,
        at its sole discretion:
      </p>
      <ul>
        <li>Issue a warning and require correction.</li>
        <li>Remove violating content without notice.</li>
        <li>Temporarily suspend account access.</li>
        <li>Permanently terminate an account.</li>
        <li>Report conduct to law enforcement when legally required or appropriate.</li>
        <li>Pursue available legal remedies for serious violations.</li>
      </ul>
      <p>
        We do not guarantee that enforcement will occur in any particular timeframe or result in any
        particular outcome. Reports submitted by users may not result in action in all cases.
      </p>

      <h2>7. Reporting Violations</h2>
      <p>
        To report a violation of this policy, contact
        <a href="mailto:trust@masseurmatch.com">trust@masseurmatch.com</a>. Include as much context
        as possible — a description of the issue, the profile or page URL, and any supporting
        evidence. We review all reports.
      </p>

      <h2>8. Changes to This Policy</h2>
      <p>
        We may update this policy at any time. Changes will be posted on this page. Continued use of
        the platform after changes are posted constitutes acceptance of the updated policy.
      </p>

      <h2>9. Contact</h2>
      <p>
        Questions about this policy:{" "}
        <a href="mailto:legal@masseurmatch.com">legal@masseurmatch.com</a>.<br />
        Operator: XRankFlow Media Group LLC — Dover, Delaware, USA.
      </p>
    </LegalPage>
  );
}
