import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Inclusion is non-negotiable";
const DESCRIPTION =
  "Read the community guidelines for providers and clients using MasseurMatch, including inclusion standards, prohibited conduct, and enforcement policies.";
const PATH = "/community-guidelines";

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
    <LegalPage title={TITLE} path={PATH}>
      <>
        <div>
          <section>
            <p>Community Guidelines</p>

            <p>
              These guidelines apply to providers and clients using MasseurMatch. They exist to
              protect direct, transparent wellness connections and to keep the platform inclusive,
              lawful, and respectful.
            </p>
            <div>
              <span>
                Violations may result in content removal, account deletion, or escalation when legal
                or safety risks are involved.
              </span>
            </div>
          </section>

          <section>
            <h3>Inclusion is non-negotiable</h3>
            <p>
              We proudly support LGBTQ+ providers and clients. Discrimination, hate speech,
              harassment, or degrading behavior is grounds for immediate removal.
            </p>
            <h3>Respect professional boundaries</h3>
            <p>
              Providers and clients are expected to communicate clearly, act professionally, and
              respect each other&rsquo;s stated boundaries, pricing, and session expectations.
            </p>
            <h3>Use the platform legally</h3>
            <p>
              By using MasseurMatch, you confirm you are at least 18 years old and that your
              activity complies with all applicable local laws and standards.
            </p>
          </section>

          <section>
            <div>
              <div>
                <p>Prohibited Conduct</p>
                <h2>The following activity is not allowed on MasseurMatch.</h2>
                <div>
                  <ul>
                    <li>Using the platform for illegal purposes or commercial sexual activities</li>
                    <li>Impersonating another person, business, or identity</li>
                    <li>Posting false, misleading, or stolen content</li>
                    <li>Sending offensive, abusive, or harassing messages</li>
                    <li>Using discriminatory language or threatening behavior</li>
                    <li>
                      Uploading content that creates safety or legal risk for the platform or its
                      users
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section>
            <p>Related Policies</p>
            <h2>Read the supporting legal and platform policies.</h2>
            <div>
              <a href="/terms">Terms of Service</a>
              <a href="/privacy">Privacy Policy</a>
              <a href="/platform-disclaimer">Platform Disclaimer</a>
            </div>
          </section>
        </div>
      </>
    </LegalPage>
  );
}
