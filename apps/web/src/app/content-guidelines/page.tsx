import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Content Guidelines";
const DESCRIPTION =
  "Standards for all content published on MasseurMatch — profile text, photos, service descriptions, reviews, and communications.";
const PATH = "/content-guidelines";

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
            <p>Platform Standards</p>

            <p>
              These guidelines apply to all content published on MasseurMatch — profile bios,
              service descriptions, photos, review text, and any other material submitted by
              providers or users. Content that violates these standards will be removed and may
              result in account action.
            </p>
          </section>

          <section>
            <h3>Professional language</h3>
            <p>
              All profile text, service descriptions, bios, and communications must be professional,
              respectful, and free of sexual or erotic language, innuendo, or coded solicitation.
            </p>
            <h3>Accurate photos</h3>
            <p>
              Photos must accurately represent the provider or their workspace. AI-generated faces,
              misleading angles, stolen images, or photos of other people are prohibited.
            </p>
            <h3>Truthful claims</h3>
            <p>
              All credentials, certifications, experience, pricing, and availability information
              must be truthful and current. Do not fabricate or exaggerate qualifications.
            </p>
            <h3>No explicit content</h3>
            <p>
              Explicit nudity, sexually suggestive photos, erotic content, or images that imply
              sexual services are prohibited in all formats — photos, text, or messaging.
            </p>
            <h3>No impersonation</h3>
            <p>
              Do not create fake profiles, use another person&rsquo;s identity or photos, or
              misrepresent your business name, brand, or credentials.
            </p>
            <h3>No stolen media</h3>
            <p>
              Only use images and content you own or have explicit permission to use. Uploading
              images that belong to other people or businesses violates platform policy and may
              violate copyright law.
            </p>
          </section>

          <section>
            <p>Prohibited Content</p>
            <h2>The following content is not permitted on MasseurMatch.</h2>
            <div>
              <ul>
                <li>extras,</li>
                <li>special services,</li>
                <li>happy endings,</li>
                <li>Explicit nudity or pornographic content</li>
                <li>AI-generated faces or composite images used to misrepresent a provider</li>
                <li>
                  Stolen photos, watermarked images from other sources, or stock photos used as
                  personal photos
                </li>
                <li>
                  False professional credentials, fabricated licenses, or unverifiable
                  certifications
                </li>
                <li>Content promoting illegal activity, discrimination, or hate</li>
                <li>
                  Spam, duplicate descriptions, or keyword stuffing intended to manipulate search
                  results
                </li>
                <li>Fake reviews, testimonials, or endorsements</li>
                <li>
                  Content that targets, reveals, or endangers another person&rsquo;s private
                  information
                </li>
              </ul>
            </div>
          </section>

          <section>
            <p>Photo Standards</p>
            <h2>Photo and image requirements</h2>
            <div>
              <p>
                Profile photos must genuinely represent the provider. Workspace photos must
                accurately show the actual space where services are provided.
              </p>
              <ul>
                <li>Photos must be clear, well-lit, and professional in presentation.</li>
                <li>Faces may be obscured for privacy, but the photo must otherwise be genuine.</li>
                <li>
                  AI-generated or digitally altered faces used to misrepresent identity are
                  prohibited.
                </li>
                <li>
                  Explicit nudity or sexually posed images are prohibited regardless of context.
                </li>
                <li>You must own or have explicit permission to use any images you upload.</li>
              </ul>
              <p>
                Read the full <a href="/photo-profile-policy">Photo and Profile Content Policy</a>{" "}
                for detailed requirements.
              </p>
            </div>
          </section>

          <section>
            <p>Moderation</p>
            <h2>How we enforce content standards</h2>
            <div>
              <p>
                MasseurMatch reviews content at submission and on an ongoing basis. Reported content
                is reviewed by our team. Enforcement actions may include:
              </p>
              <ul>
                <li>Requesting revision or correction of non-compliant content.</li>
                <li>Removing specific photos, text sections, or profile elements.</li>
                <li>Temporarily suspending a profile pending review.</li>
                <li>Permanently removing an account for serious or repeated violations.</li>
              </ul>
              <p>
                Read the <a href="/moderation-policy">Moderation Policy</a> for full enforcement
                details.
              </p>
            </div>
          </section>

          <section>
            <p>Related Policies</p>
            <h2>Supporting standards and policies.</h2>
          </section>
        </div>
      </>
    </LegalPage>
  );
}
