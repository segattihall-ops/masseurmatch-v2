import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Cookie Policy";
const DESCRIPTION =
  "MasseurMatch cookie policy: how we use essential, preference, and analytics cookies to operate the platform securely and improve your experience.";
const PATH = "/cookie-policy";

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
            <div>
              <p>Legal</p>

              <p>
                MasseurMatch uses a minimal set of cookies to operate securely and improve your
                experience. We do not use advertising or behavioral tracking cookies.
              </p>
            </div>
          </section>

          <div>
            <section>
              <h2>What Are Cookies?</h2>
              <p>
                Cookies are small text files stored on your device by your browser. They allow
                websites to remember state between page visits — such as whether you are logged in.
                You can manage or disable cookies through your browser settings, though some
                platform features may not function correctly without essential cookies.
              </p>
            </section>

            <section>
              <h2>Cookies We Use</h2>

              <h3>essential</h3>
              <p>Essential Cookies</p>
              <p>
                Required for the platform to function. These cookies manage your session,
                authenticate your account, and prevent cross-site request forgery. You cannot opt
                out of essential cookies.
              </p>
              <h3>preference</h3>
              <p>Preference Cookies</p>
              <p>
                Remember your settings such as language preference, theme selection, and UI state
                between visits. Disabling these means you may need to re-enter your preferences each
                session.
              </p>
              <h3>analytics</h3>
              <p>Analytics Cookies</p>
              <p>
                Help us understand how the directory is used — which pages are visited most, how
                users navigate between city pages and profiles, and where we can improve. We use
                privacy-respecting analytics that do not share data with advertisers.
              </p>
            </section>

            <section>
              <h2>Third-Party Cookies</h2>
              <p>
                We do not use third-party advertising networks or behavioral tracking cookies.
                Limited analytics providers (such as Google Analytics with IP anonymization enabled)
                may set cookies governed by their own privacy policies. We do not sell or share
                cookie data with advertisers.
              </p>
            </section>

            <section>
              <h2>Contact</h2>
              <p>
                Questions about our use of cookies? Email
                <a href="mailto:privacy@masseurmatch.com">privacy@masseurmatch.com</a>. For broader
                privacy rights, see our
                <a href="/privacy">Privacy Policy</a>.
              </p>
            </section>
          </div>
        </div>
      </>
    </LegalPage>
  );
}
