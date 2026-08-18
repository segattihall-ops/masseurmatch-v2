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

const TITLE = "How It Works";
const DESCRIPTION =
  "Search public therapist profiles, compare useful details, and contact independent providers directly. MasseurMatch is a directory, not a booking service.";
const PATH = "/how-it-works";

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
    question: "Does MasseurMatch book appointments?",
    answer:
      "No. MasseurMatch is a directory. You contact the independent therapist directly and arrange timing, location, price, and payment outside the platform.",
  },
  {
    question: "Does MasseurMatch take a commission from sessions?",
    answer:
      "No. MasseurMatch does not process client session payments or take a percentage of what a therapist charges for their work.",
  },
  {
    question: "Does a verified badge guarantee the therapist?",
    answer:
      "No. Identity verification is a specific point-in-time identity signal. It is not a professional-license check, background check, recommendation, or guarantee of service quality.",
  },
  {
    question: "What should I confirm before meeting a therapist?",
    answer:
      "Confirm the session format, location, timing, price, boundaries, and anything else that matters to you directly with the provider before meeting.",
  },
];

export default function Page() {
  return (
    <InstitutionalPage>
      <InstitutionalHero
        eyebrow="How it works"
        title="Find the right profile."
        highlight="Then connect directly."
        description={DESCRIPTION}
        actions={[
          { label: "Search therapists", href: "/search" },
          { label: "For therapists", href: "/for-therapists", secondary: true },
        ]}
        stats={[
          { value: "Search", label: "Start with city, service, or therapist name." },
          { value: "Compare", label: "Review real profile details and visible trust signals." },
          { value: "Contact", label: "Reach the independent therapist directly." },
        ]}
      />

      <InstitutionalBand>
        MasseurMatch helps with discovery. It does not become part of the appointment, session
        payment, or provider-client relationship after you connect.
      </InstitutionalBand>

      <InstitutionalSection
        eyebrow="For clients"
        title="From search to first contact in four clear steps."
        intro="The platform is intentionally simple: give you enough context to decide who is worth contacting, then get out of the way."
      >
        <InstitutionalSteps
          steps={[
            {
              title: "Search your market",
              body: "Browse a city or use search to narrow the directory by the location and service you actually need.",
              meta: "Local discovery",
            },
            {
              title: "Read the full profile",
              body: "Compare services, session formats, location details, published rates, photos, and the therapist's own description of their practice.",
              meta: "Useful context",
            },
            {
              title: "Read trust signals precisely",
              body: "Profile review and identity verification can reduce ambiguity, but each signal has limits. Use them as information, not guarantees.",
              meta: "Specific, not absolute",
            },
            {
              title: "Contact directly",
              body: "Use the public contact details and confirm timing, location, price, and expectations directly with the independent provider.",
              meta: "No booking middleman",
            },
          ]}
        />
      </InstitutionalSection>

      <InstitutionalSection
        dark
        eyebrow="The model"
        title="A directory behaves differently from an on-demand marketplace."
        intro="That distinction matters because it defines what MasseurMatch controls and what remains between client and provider."
      >
        <InstitutionalSplit
          dark
          left={
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d66b7a]">
                MasseurMatch does
              </p>
              <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white">
                Organize discovery and publish professional profiles.
              </h3>
              <ul className="mt-6 space-y-4 text-sm leading-7 text-white/60">
                <li>• Surfaces therapists by city and searchable profile information.</li>
                <li>• Reviews profiles and photos before publication.</li>
                <li>• Displays identity verification when that review was completed.</li>
                <li>• Provides reporting and moderation paths for platform concerns.</li>
              </ul>
            </div>
          }
          right={
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d66b7a]">
                MasseurMatch does not
              </p>
              <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white">
                Operate the therapist&apos;s practice for them.
              </h3>
              <ul className="mt-6 space-y-4 text-sm leading-7 text-white/60">
                <li>• Does not book appointments for clients.</li>
                <li>• Does not collect or process client session payments.</li>
                <li>• Does not employ the therapists in the directory.</li>
                <li>• Does not universally verify professional licenses or guarantee outcomes.</li>
              </ul>
            </div>
          }
        />
      </InstitutionalSection>

      <InstitutionalSection
        eyebrow="What to compare"
        title="A profile should answer the practical questions first."
      >
        <InstitutionalCardGrid
          cards={[
            {
              title: "Location & format",
              body: "See where the therapist works and whether they offer incall, outcall, or both. Outcall areas and travel details should still be confirmed directly.",
            },
            {
              title: "Services & rates",
              body: "Use published techniques, service categories, and prices to narrow the field before starting a conversation.",
            },
            {
              title: "Photos & presentation",
              body: "Approved profile photos are shown when available. If a profile has no approved photo, MasseurMatch uses initials rather than a stock substitute.",
            },
            {
              title: "Verification",
              body: "Identity Verified means identity evidence was reviewed. It does not imply licensing, background screening, or endorsement.",
            },
            {
              title: "Profile completeness",
              body: "A specific, current profile can help you understand how a provider communicates before you ever send a message.",
            },
            {
              title: "Your own checks",
              body: "Confirm anything important to your decision directly with the provider, especially credentials, boundaries, timing, location, and total price.",
            },
          ]}
        />
      </InstitutionalSection>

      <InstitutionalSection
        eyebrow="Questions"
        title="Know the platform boundary before you use it."
      >
        <InstitutionalFaq items={FAQS} />
      </InstitutionalSection>

      <InstitutionalCta
        title="Ready to compare real profiles?"
        description="Start with your city or search the directory directly."
        actions={[
          { label: "Find a therapist", href: "/search" },
          { label: "Read verification", href: "/verification", secondary: true },
        ]}
      />
    </InstitutionalPage>
  );
}
