import type { Metadata } from "next";

import {
  InstitutionalBand,
  InstitutionalCardGrid,
  InstitutionalCta,
  InstitutionalHero,
  InstitutionalPage,
  InstitutionalSection,
  InstitutionalSplit,
} from "@/components/institutional/institutional-page";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "About MasseurMatch";
const DESCRIPTION =
  "MasseurMatch is a professional directory built to make independent male massage therapists easier to discover, compare, and contact directly.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/about") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/about"),
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const dynamic = "force-static";

export default function AboutPage() {
  return (
    <InstitutionalPage>
      <InstitutionalHero
        eyebrow="Our manifesto"
        title="A better way to discover"
        highlight="independent massage professionals."
        description="MasseurMatch gives clients clearer information before first contact and gives independent therapists a professional public presence without putting a booking platform between them."
        actions={[
          { label: "Find a therapist", href: "/search" },
          { label: "List your practice", href: "/for-therapists", secondary: true },
        ]}
        stats={[
          {
            value: "Directory only",
            label: "Discovery and direct contact, without a booking middleman.",
          },
          { value: "Human reviewed", label: "Profiles are reviewed before they become public." },
          {
            value: "Independent",
            label: "Therapists control their practice, rates, and client relationships.",
          },
        ]}
      />

      <InstitutionalBand>
        MasseurMatch does not provide massage, employ the therapists in the directory, process
        client session payments, or arrange appointments. The public profile helps both sides make a
        more informed first connection.
      </InstitutionalBand>

      <InstitutionalSection
        eyebrow="Why we exist"
        title="Less guesswork. More useful context."
        intro="Finding the right independent therapist should not require piecing together anonymous listings, incomplete profiles, and unclear contact paths."
      >
        <InstitutionalCardGrid
          cards={[
            {
              eyebrow: "01",
              title: "Clear discovery",
              body: "City, service, session format, published rates, and profile details are organized so clients can compare what actually matters before reaching out.",
              meta: "Search with context",
            },
            {
              eyebrow: "02",
              title: "Visible trust signals",
              body: "Profile review and identity verification are shown as specific signals with specific limits, rather than broad claims that imply more than was checked.",
              meta: "No badge inflation",
            },
            {
              eyebrow: "03",
              title: "Direct relationships",
              body: "Once a client finds a therapist, communication and any service arrangement happen directly with that independent provider.",
              meta: "No booking commission",
            },
          ]}
        />
      </InstitutionalSection>

      <InstitutionalSection
        dark
        eyebrow="Two sides, one directory"
        title="Built for the person searching and the professional being found."
      >
        <InstitutionalSplit
          dark
          left={
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d66b7a]">
                For clients
              </p>
              <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white">
                Compare before first contact.
              </h3>
              <p className="mt-5 text-sm leading-7 text-white/60">
                Read the profile, understand the therapist&apos;s location and session formats,
                review published services and rates, and use visible trust signals as one part of
                your own decision.
              </p>
              <p className="mt-5 text-sm leading-7 text-white/60">
                MasseurMatch never substitutes a stock photo for a real provider and does not turn a
                profile review into a guarantee of service quality or professional licensing.
              </p>
            </div>
          }
          right={
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d66b7a]">
                For therapists
              </p>
              <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white">
                Own the relationship with your clients.
              </h3>
              <p className="mt-5 text-sm leading-7 text-white/60">
                Build a public profile around your actual practice, appear in relevant city and
                service discovery, and publish the contact information you want prospective clients
                to use.
              </p>
              <p className="mt-5 text-sm leading-7 text-white/60">
                MasseurMatch does not take a percentage of session revenue or control how you run
                your independent practice.
              </p>
            </div>
          }
        />
      </InstitutionalSection>

      <InstitutionalSection
        eyebrow="What we stand for"
        title="Trust is strongest when the limits are visible."
        intro="The directory is designed around precise claims, professional boundaries, and useful information rather than manufactured certainty."
      >
        <InstitutionalCardGrid
          cards={[
            {
              title: "Specific verification",
              body: "An Identity Verified badge means identity evidence was reviewed. It does not mean MasseurMatch verified a professional license, performed a background check, or endorsed the provider.",
            },
            {
              title: "Professional content",
              body: "Profiles and photos are moderated before publication, with policies intended to keep the directory lawful, professional, non-sexual, and useful for genuine massage discovery.",
            },
            {
              title: "Responsible privacy",
              body: "Sensitive identity evidence is handled privately during review and raw verification images are deleted after the final decision, while limited audit status can be retained.",
            },
          ]}
        />
      </InstitutionalSection>

      <InstitutionalCta
        eyebrow="Start here"
        title="Discovery should feel clear before the first message."
        description="Browse the directory as a client or build a professional listing as an independent therapist."
        actions={[
          { label: "Browse therapists", href: "/search" },
          { label: "How it works", href: "/how-it-works", secondary: true },
        ]}
      />
    </InstitutionalPage>
  );
}
