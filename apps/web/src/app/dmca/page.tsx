import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "DMCA Copyright Policy";
const DESCRIPTION =
  "MasseurMatch DMCA copyright takedown process — how to submit a copyright complaint, what information is required, and the counter-notice process.";
const PATH = "/dmca";

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
      <>
        <div>
          <section>
            <p>Intellectual Property</p>

            <p>
              MasseurMatch respects the intellectual property rights of others and complies with the
              Digital Millennium Copyright Act (DMCA). This page describes how to submit a copyright
              infringement notice and the process for counter-notices.
            </p>
          </section>

          <section>
            <div>
              <div>
                <h2>DMCA Designated Agent</h2>
                <div>
                  <p>
                    MasseurMatch has designated an agent to receive DMCA copyright infringement
                    notices. All notices must be submitted to our designated DMCA contact:
                  </p>
                  <div>
                    <p>DMCA Agent — MasseurMatch</p>
                    <p>XRankFlow Media Group LLC</p>
                    <p>Dover, Delaware, USA</p>
                    <p>
                      <strong>Email:</strong>
                      <a href="mailto:dmca@masseurmatch.com">dmca@masseurmatch.com</a>
                    </p>
                    <p>Response window: 2 business days for acknowledgment.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div>
              <div>
                <h2>How to Submit a Copyright Notice</h2>
                <p>
                  To report content you believe infringes your copyright, submit a written notice to
                  dmca@masseurmatch.com containing all of the following:
                </p>
                <ol>
                  <ul>
                    <li>Your full name, mailing address, phone number, and email address.</li>
                    <li>A description of the copyrighted work you claim has been infringed.</li>
                    <li>
                      A description of the infringing material and its location on the platform
                      (including the URL of the specific page).
                    </li>
                    <li>
                      A statement that you have a good-faith belief that the use of the material is
                      not authorized by the copyright owner, its agent, or the law.
                    </li>
                    <li>
                      A statement, made under penalty of perjury, that the information in your
                      notice is accurate and that you are the copyright owner or are authorized to
                      act on the copyright owner&apos;s behalf.
                    </li>
                    <li>Your physical or electronic signature.</li>
                  </ul>
                </ol>
                <p>
                  <strong>Note:</strong> Submitting a false DMCA notice may expose you to liability
                  for damages, including costs and attorney fees. Only submit a notice if you have a
                  genuine, good-faith belief that your copyright has been infringed.
                </p>
              </div>
            </div>
          </section>

          <section>
            <div>
              <div>
                <h2>Counter-Notice Process</h2>
                <p>
                  If you believe content was removed from your profile in error as a result of a
                  mistaken or wrongful DMCA notice, you may submit a counter-notice. A valid
                  counter-notice must include:
                </p>
                <ol>
                  <ul>
                    <li>Your full name, mailing address, phone number, and email address.</li>
                    <li>
                      Identification of the material that was removed and the location where it
                      appeared before removal.
                    </li>
                    <li>
                      A statement, made under penalty of perjury, that you have a good-faith belief
                      that the material was removed or disabled as a result of mistake or
                      misidentification.
                    </li>
                    <li>
                      A statement that you consent to the jurisdiction of the federal district court
                      for the judicial district where your address is located (or, if outside the
                      US, that you consent to jurisdiction in Delaware).
                    </li>
                    <li>
                      A statement that you will accept service of process from the person who
                      submitted the original DMCA notice.
                    </li>
                    <li>Your physical or electronic signature.</li>
                  </ul>
                </ol>
                <p>
                  Upon receipt of a valid counter-notice, we will forward it to the original
                  complainant. If the complainant does not notify us of a court action within 10–14
                  business days, we may restore the removed content at our discretion.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2>Repeat Infringer Policy</h2>
            <p>
              MasseurMatch will terminate the accounts of users who are found to be repeat
              infringers of intellectual property rights. An account may be considered a repeat
              infringer if it receives multiple substantiated DMCA notices within a rolling 12-month
              window. MasseurMatch reserves the right to make this determination at its sole
              discretion.
            </p>
          </section>

          <section>
            <h2>Trademark and Other IP Complaints</h2>
            <p>
              This policy covers copyright complaints under the DMCA. For trademark infringement
              complaints or other intellectual property concerns, contact
              <a href="mailto:legal@masseurmatch.com">legal@masseurmatch.com</a>.
            </p>
          </section>

          <section>
            <div>
              <div>
                <p>Submit a DMCA Notice</p>
                <p>Send copyright notices, counter-notices, and IP questions to:</p>
                <a href="mailto:dmca@masseurmatch.com">dmca@masseurmatch.com</a>
              </div>
            </div>
          </section>
        </div>
      </>
    </LegalPage>
  );
}
