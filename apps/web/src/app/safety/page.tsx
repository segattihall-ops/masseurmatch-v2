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

const TITLE = "Safety Guidance";
const DESCRIPTION =
  "Use MasseurMatch profile details and trust signals as useful context, then confirm the practical details directly before meeting an independent therapist.";
const PATH = "/safety";

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
    question: "What do MasseurMatch trust signals tell me?",
    answer:
      "They tell you that a specific platform review occurred, such as profile moderation or approved identity evidence. They do not replace your own judgment or independently verify every professional claim a provider may make.",
  },
  {
    question: "Does MasseurMatch verify therapist licenses?",
    answer:
      "Not universally. Identity verification is not a license check. Confirm any professional license or credential that matters to you directly with the provider or the relevant authority.",
  },
  {
    question: "What should I confirm before meeting?",
    answer:
      "Confirm timing, exact location, session format, total price, boundaries, contact method, and any credential or accessibility detail that is important to your decision.",
  },
  {
    question: "How do I report a suspicious or misleading profile?",
    answer:
      "Use the Report & Safety route with enough detail for the platform team to review the concern and the relevant profile or conduct.",
  },
];

export default function Page() {
  return (
    <InstitutionalPage>
      <InstitutionalHero
        eyebrow="Safety guidance"
        title="Trust signals help."
        highlight="Your judgment still matters."
        description={DESCRIPTION}
        actions={[
          { label: "Report a concern", href: "/report-block-safety" },
          { label: "Identity verification", href: "/verification", secondary: true },
        ]}
        stats={[
          {
            value: "Review first",
            label: "Read the complete public profile before first contact.",
          },
          {
            value: "Confirm directly",
            label: "Make location, price, timing, and boundaries explicit.",
          },
          {
            value: "Report concerns",
            label: "Use the platform safety route when something appears misleading or unsafe.",
          },
        ]}
      />

      <InstitutionalBand>
        MasseurMatch is a discovery directory, not a booking intermediary or provider of massage
        services. Platform moderation can reduce ambiguity, but it cannot eliminate the need to
        evaluate an independent provider and the circumstances of a meeting for yourself.
      </InstitutionalBand>

      <InstitutionalSection
        eyebrow="Before first contact"
        title="Use the profile to reduce uncertainty before the conversation starts."
      >
        <InstitutionalSteps
          steps={[
            {
              title: "Read the full listing",
              body: "Review services, session format, published pricing, city and neighborhood context, photos, and the therapist's description of their practice.",
              meta: "Start with evidence",
            },
            {
              title: "Interpret badges narrowly",
              body: "Identity Verified means identity evidence was approved. Profile and photo moderation mean those platform reviews occurred. None is a universal professional certification.",
              meta: "No overreading",
            },
            {
              title: "Confirm practical details",
              body: "Put timing, exact location, total price, travel expectations, session format, and boundaries in clear direct communication before meeting.",
              meta: "Make it explicit",
            },
            {
              title: "Act on inconsistencies",
              body: "If the person, location, price, or conduct materially differs from what was represented, do not treat a platform badge as a reason to ignore that mismatch.",
              meta: "Judgment still applies",
            },
          ]}
        />
      </InstitutionalSection>

      <InstitutionalSection
        dark
        eyebrow="Shared responsibility"
        title="The platform can moderate the directory. It cannot be present in the session."
      >
        <InstitutionalSplit
          dark
          left={
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d66b7a]">
                Platform safeguards
              </p>
              <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white">
                Make public information and trust signals more legible.
              </h3>
              <ul className="mt-6 space-y-4 text-sm leading-7 text-white/60">
                <li>• Public profiles are reviewed before publication.</li>
                <li>• Visible photos must pass the platform photo-moderation state.</li>
                <li>• Identity Verified is shown only when that identity review is approved.</li>
                <li>• Reporting and moderation routes exist for platform concerns.</li>
              </ul>
            </div>
          }
          right={
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d66b7a]">
                Your direct checks
              </p>
              <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white">
                Confirm what matters outside the scope of those platform reviews.
              </h3>
              <ul className="mt-6 space-y-4 text-sm leading-7 text-white/60">
                <li>• Verify professional credentials when they matter to your choice.</li>
                <li>• Confirm the actual meeting location and access details.</li>
                <li>• Confirm final pricing, session length, and service boundaries.</li>
                <li>
                  • End or avoid a meeting when circumstances materially differ from what was
                  agreed.
                </li>
              </ul>
            </div>
          }
        />
      </InstitutionalSection>

      <InstitutionalSection
        eyebrow="Read the signals"
        title="Three different reviews should never be collapsed into one vague badge."
      >
        <InstitutionalCardGrid
          cards={[
            {
              title: "Profile reviewed",
              body: "The public listing was evaluated against MasseurMatch's publication and content standards before it became visible.",
            },
            {
              title: "Identity verified",
              body: "Submitted identity evidence was approved through the platform's identity-review workflow. The signal is limited to identity.",
            },
            {
              title: "Photo approved",
              body: "A visible provider image has an approved moderation state. When there is no approved usable image, the directory uses initials instead of a stock substitute.",
            },
          ]}
        />
      </InstitutionalSection>

      <InstitutionalSection
        eyebrow="Questions"
        title="Safety language should be precise enough to act on."
      >
        <InstitutionalFaq items={FAQS} />
      </InstitutionalSection>

      <InstitutionalCta
        eyebrow="See something wrong?"
        title="Give the moderation team something it can investigate."
        description="Use the report route for a misleading listing, unsafe conduct, harassment, or another platform concern."
        actions={[
          { label: "Report a problem", href: "/report-block-safety" },
          { label: "Trust & safety", href: "/trust", secondary: true },
        ]}
      />
    </InstitutionalPage>
  );
}
