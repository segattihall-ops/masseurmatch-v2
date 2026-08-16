import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Photo and Profile Content Policy";
const DESCRIPTION =
  "Requirements and restrictions for profile photos, workspace images, and profile content on MasseurMatch.";
const PATH = "/photo-profile-policy";

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
    <LegalPage title={TITLE} path={PATH} lastUpdated="August 10, 2026">
      <>
        <div>
          <section>
            <p>Content Standards</p>

            <p>
              MasseurMatch is a directory and technology platform. This policy governs
              user-submitted profile content and is designed to maintain a professional, non-sexual
              directory environment. Providers remain solely responsible for their content,
              services, conduct, qualifications, and compliance with applicable law.
            </p>
          </section>

          <div>
            <section>
              <div>
                <h2>What is allowed</h2>
              </div>
              <ul>
                <ul>
                  <li>Clear, professional photos that accurately represent the provider</li>
                  <li>Professional shirtless photos when non-explicit and not sexually posed</li>
                  <li>
                    Fitness, swimwear, wellness, and bodywork-related images when presented
                    professionally
                  </li>
                  <li>
                    Workspace or studio photos showing the actual location where services are
                    offered
                  </li>
                  <li>
                    Professional headshots with or without the face visible, including
                    privacy-conscious compositions
                  </li>
                  <li>
                    Before/after wellness photos relevant to services offered when non-sexual and
                    non-medical
                  </li>
                  <li>
                    Certification or credential documents when optional and accurately described as
                    self-declared unless MasseurMatch expressly verifies them
                  </li>
                </ul>
              </ul>
            </section>
            <section>
              <div>
                <h2>What is prohibited</h2>
              </div>
              <ul>
                <ul>
                  <li>
                    Visible genitalia, explicit nudity, or deliberately emphasized genital areas
                  </li>
                  <li>
                    Sexual activity, simulated sexual activity, masturbation, genital touching, or
                    sexually explicit imagery
                  </li>
                  <li>
                    Sexually suggestive or erotic poses reasonably interpreted as advertising sexual
                    services
                  </li>
                  <li>
                    Images, captions, overlays, or profile content advertising or implying
                    prostitution, commercial sexual activity, erotic services, or sexual services
                  </li>
                  <li>
                    Coded language intended to evade MasseurMatch&rsquo;s prohibition on sexual or
                    illegal services
                  </li>
                  <li>
                    Photos depicting minors or persons who reasonably appear to be minors in a
                    sexualized context
                  </li>
                  <li>
                    AI-generated or composite faces used to misrepresent a provider&rsquo;s
                    appearance
                  </li>
                  <li>Photos of other people used as if they are the provider</li>
                  <li>
                    Stolen, unauthorized, or commercial stock images presented as provider content
                  </li>
                  <li>
                    Images containing illegal substances, unlawful activity, or content creating a
                    material legal or safety risk
                  </li>
                </ul>
              </ul>
            </section>
          </div>

          <section>
            <h2>Context matters</h2>
            <div>
              <p>
                A visible torso alone does not constitute prohibited sexual content. MasseurMatch
                may evaluate an image together with pose, genital emphasis, captions, profile text,
                advertised services, pricing language, communications reported to us, and other
                relevant context.
              </p>
              <p>
                Content may be removed whenever, viewed individually or as part of a profile, it
                reasonably creates the impression that commercial sexual activity, prostitution,
                erotic services, or sexual services are being advertised, solicited, promoted, or
                arranged.
              </p>
            </div>
          </section>

          <section>
            <h2>Profile text and descriptions</h2>
            <ul>
              <li>Content must be accurate, truthful, current, and professional.</li>
              <li>
                Sexual, erotic, prostitution, trafficking, or commercial sexual activity language is
                prohibited.
              </li>
              <li>
                Coded language intended to imply prohibited services or evade moderation is
                prohibited.
              </li>
              <li>
                False credentials, fabricated certifications, deceptive claims, harassment,
                discrimination, spam, and search manipulation are prohibited.
              </li>
            </ul>
          </section>

          <section>
            <h2>Copyright and image ownership</h2>
            <div>
              <p>
                By uploading content, you represent and warrant that you own it or possess all
                rights and permissions necessary to authorize its use. You grant MasseurMatch a
                non-exclusive license to host, display, reproduce, resize, format, and distribute
                that content solely as reasonably necessary to operate, secure, promote, and improve
                the platform, subject to our Terms.
              </p>
              <p>
                Copyright complaints should be submitted under our <a href="/dmca">DMCA Policy</a>.
              </p>
            </div>
          </section>

          <section>
            <h2>Moderation and enforcement</h2>
            <div>
              <p>
                MasseurMatch may use automated systems and human review to identify policy
                violations. We may approve, reject, restrict, remove, suspend, preserve, or escalate
                content or accounts when reasonably necessary for safety, legal compliance, platform
                integrity, or enforcement of our policies.
              </p>
              <p>
                Approval of a photo or profile is not an endorsement, certification, guarantee of
                legality, guarantee of professional qualifications, or guarantee of future conduct.
                Moderation decisions may be revisited when new information becomes available.
              </p>
              <p>
                Serious safety concerns, suspected exploitation, trafficking indicators, or content
                involving minors may be escalated and handled separately from ordinary profile
                review, including preservation or disclosure when required or permitted by
                applicable law.
              </p>
            </div>
          </section>

          <section>
            <p>Related Policies</p>
          </section>
        </div>
      </>
    </LegalPage>
  );
}
