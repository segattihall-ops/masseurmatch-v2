import type { Metadata } from "next";

import {
  InstitutionalBand,
  InstitutionalCardGrid,
  InstitutionalCta,
  InstitutionalFaq,
  InstitutionalHero,
  InstitutionalPage,
  InstitutionalSection,
  InstitutionalSplit,
  InstitutionalSteps,
} from "@/components/institutional/institutional-page";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Identity Verification";
const DESCRIPTION =
  "What the MasseurMatch Identity Verified signal means, how provider identity evidence is reviewed, and the limits of that review.";
const PATH = "/verification";

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

export const dynamic = "force-static";

const FAQS = [
  {
    question: "Is identity verification required for every public therapist?",
    answer:
      "No. Public profiles are reviewed before publication, while identity verification is a separate optional process. Only providers whose identity evidence has been approved display the Identity Verified signal.",
  },
  {
    question: "Does Identity Verified mean the therapist is licensed?",
    answer:
      "No. The signal is limited to identity. MasseurMatch does not use it to claim that a provider's massage license, certifications, insurance, professional standing, or regulatory compliance were verified.",
  },
  {
    question: "Is identity verification a background check?",
    answer:
      "No. It is not a criminal, civil, employment, sanctions, or other background investigation.",
  },
  {
    question: "What happens to the uploaded identity file after review?",
    answer:
      "The current verification flow deletes the uploaded identity file after a reviewer makes the decision. The platform can retain the decision status and limited audit information rather than the raw document itself.",
  },
];

export default function Page() {
  return (
    <InstitutionalPage>
      <InstitutionalHero
        eyebrow="Trust & safety"
        title="Identity, specifically."
        highlight="Nothing more implied."
        description={DESCRIPTION}
        actions={[
          { label: "Read badge disclaimer", href: "/badge-disclaimer" },
          { label: "Safety guidance", href: "/safety", secondary: true },
        ]}
        stats={[
          {
            value: "Human reviewed",
            label: "A person on the MasseurMatch team reviews submitted identity evidence.",
          },
          {
            value: "Optional",
            label: "Identity verification is separate from basic public profile review.",
          },
          {
            value: "Files deleted",
            label: "Submitted identity files are removed after the review decision.",
          },
        ]}
      />

      <InstitutionalBand>
        Identity Verified is a point-in-time identity signal. It is not a professional-license
        check, background check, recommendation, endorsement, or guarantee of future conduct or
        service quality.
      </InstitutionalBand>

      <InstitutionalSection
        eyebrow="Current flow"
        title="Submit evidence. Human review. Keep the result, not the document."
        intro="The public page should describe the verification system that actually exists in the product today."
      >
        <InstitutionalSteps
          steps={[
            {
              title: "Provider submits identity evidence",
              body: "The dashboard accepts supported identity files such as the front or back of a government ID and a selfie holding the ID. Files are submitted through the private verification flow, not published on the profile.",
              meta: "Private upload",
            },
            {
              title: "A reviewer evaluates the submission",
              body: "An authorized MasseurMatch reviewer opens the submitted evidence and records an approval or rejection with an audit reason.",
              meta: "Human decision",
            },
            {
              title: "Approved identity becomes a platform signal",
              body: "When identity evidence is approved, the provider can display the Identity Verified status on MasseurMatch surfaces that support it.",
              meta: "Specific signal",
            },
            {
              title: "The raw file is removed",
              body: "After the decision, the submitted file is deleted from identity-document storage while the decision state and limited audit record can remain.",
              meta: "Data minimization",
            },
          ]}
        />
      </InstitutionalSection>

      <InstitutionalSection
        dark
        eyebrow="Read the badge correctly"
        title="A trust signal becomes misleading when its limits disappear."
      >
        <InstitutionalSplit
          dark
          left={
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d66b7a]">
                It means
              </p>
              <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white">
                MasseurMatch approved submitted identity evidence.
              </h3>
              <ul className="mt-6 space-y-4 text-sm leading-7 text-white/60">
                <li>• Identity evidence was submitted through the provider verification flow.</li>
                <li>• A human reviewer made the platform decision.</li>
                <li>• The account carries the identity-verification status after approval.</li>
                <li>• The raw reviewed file is deleted after the decision.</li>
              </ul>
            </div>
          }
          right={
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d66b7a]">
                It does not mean
              </p>
              <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white">
                Every professional or personal risk was investigated.
              </h3>
              <ul className="mt-6 space-y-4 text-sm leading-7 text-white/60">
                <li>• No universal massage-license verification.</li>
                <li>• No criminal or other background check.</li>
                <li>• No certification of qualifications, insurance, or service claims.</li>
                <li>• No guarantee of quality, safety, conduct, or session outcome.</li>
              </ul>
            </div>
          }
        />
      </InstitutionalSection>

      <InstitutionalSection
        eyebrow="Privacy by design"
        title="Verification should prove a review happened without turning sensitive documents into permanent profile data."
      >
        <InstitutionalCardGrid
          cards={[
            {
              title: "Private evidence",
              body: "Identity files are part of a restricted review workflow and are never displayed on the public therapist profile.",
            },
            {
              title: "Short-lived document retention",
              body: "The current reviewer flow removes the submitted file after the decision instead of keeping a long-lived copy just because a badge exists.",
            },
            {
              title: "Limited result record",
              body: "The platform can retain verification status and audit metadata needed to operate and document the trust feature without retaining the raw identity file.",
            },
          ]}
        />
      </InstitutionalSection>

      <InstitutionalSection
        eyebrow="Questions"
        title="The badge should never require interpretation by guesswork."
      >
        <InstitutionalFaq items={FAQS} />
      </InstitutionalSection>

      <InstitutionalCta
        title="Use identity verification as one signal, not the whole decision."
        description="Read the public profile, understand what was reviewed, and confirm anything else that matters directly with the independent provider."
        actions={[
          { label: "Read safety guidance", href: "/safety" },
          { label: "Report a concern", href: "/report-block-safety", secondary: true },
        ]}
      />
    </InstitutionalPage>
  );
}
