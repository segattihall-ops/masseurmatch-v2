import type { Metadata } from "next";

import {
  InstitutionalBand,
  InstitutionalCardGrid,
  InstitutionalCta,
  InstitutionalHero,
  InstitutionalPage,
  InstitutionalSection,
  InstitutionalSplit,
  InstitutionalSteps,
} from "@/components/institutional/institutional-page";
import { jsonLdScript } from "@/lib/jsonld";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Male Massage Therapist Near Me";
const DESCRIPTION =
  "Find male massage therapists near you by city. Compare public profiles, services, rates, gay-friendly options, incall/outcall and availability on MasseurMatch.";
const PATH = "/near-me";

const FAQS = [
  {
    question: "How do I find a male massage therapist near me?",
    answer:
      "Start with your city, then compare public profiles by listed services, rates, availability, incall or outcall options and trust signals. Contact the independent therapist directly to confirm exact location and timing.",
  },
  {
    question: "Can I find gay-friendly massage therapists near me?",
    answer:
      "Yes. MasseurMatch profiles can include LGBTQ+ affirming information. Review the public profile and contact the provider directly to confirm the environment and service fit you want.",
  },
  {
    question: "What is the difference between incall and outcall massage?",
    answer:
      "Incall means you travel to the therapist's working location. Outcall means the therapist travels to an agreed location. Availability and travel areas vary by provider.",
  },
] as const;

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

export default function Page() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <InstitutionalPage>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(faqJsonLd) }}
      />

      <InstitutionalHero
        eyebrow="Local male massage discovery"
        title="Find a male massage therapist"
        highlight="near you."
        description={DESCRIPTION}
        actions={[
          { label: "Browse cities", href: "/cities" },
          { label: "Search therapists", href: "/search", secondary: true },
        ]}
        stats={[
          {
            value: "City first",
            label: "Local pages organize male massage therapists around markets they serve.",
          },
          {
            value: "Incall / outcall",
            label: "Compare the session formats each therapist lists publicly.",
          },
          {
            value: "Direct contact",
            label: "Confirm location, availability and rates with the provider directly.",
          },
        ]}
      />

      <InstitutionalBand>
        Searching “male massage near me” or “massage by male near me” should lead to useful local
        options, not a generic national list. Start with your city, compare current public profiles,
        then confirm exact distance and availability directly with the therapist.
      </InstitutionalBand>

      <InstitutionalSection
        eyebrow="Start local"
        title="Find male massage near you with useful local context."
        intro="MasseurMatch organizes independent male massage therapists by city, service and public profile details so you can narrow the directory before making contact."
      >
        <InstitutionalSteps
          steps={[
            {
              title: "Choose your city",
              body: "Open a city page to see public male massage therapist profiles currently serving that market.",
              meta: "Near-me intent",
            },
            {
              title: "Compare services",
              body: "Review techniques, specialties, session format, rates, availability and other provider-submitted details.",
              meta: "Massage for men",
            },
            {
              title: "Review trust signals",
              body: "Use visible profile, identity and LGBTQ+ affirming signals as additional context while comparing providers.",
              meta: "Profile context",
            },
            {
              title: "Confirm directly",
              body: "Ask the independent provider about exact location, travel area, timing, total price and service details before meeting.",
              meta: "Direct contact",
            },
          ]}
        />
      </InstitutionalSection>

      <InstitutionalSection
        dark
        eyebrow="Session format"
        title="Incall and outcall answer different near-me questions."
      >
        <InstitutionalSplit
          dark
          left={
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d66b7a]">
                Incall massage
              </p>
              <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white">
                You travel to the provider&apos;s working location.
              </h3>
              <p className="mt-5 text-sm leading-7 text-white/60">
                Review the public profile for location context, then confirm the exact address,
                access instructions, parking and session details before arrival.
              </p>
            </div>
          }
          right={
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d66b7a]">
                Outcall massage
              </p>
              <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white">
                The provider travels to an agreed location.
              </h3>
              <p className="mt-5 text-sm leading-7 text-white/60">
                Travel coverage can vary by neighborhood, hotel, distance and provider policy.
                Confirm coverage and any travel charge directly before arranging a session.
              </p>
            </div>
          }
        />
      </InstitutionalSection>

      <InstitutionalSection
        eyebrow="What to compare"
        title="Choose a male massage therapist by more than distance."
      >
        <InstitutionalCardGrid
          cards={[
            {
              title: "Services and techniques",
              body: "Look for the massage techniques and service categories that match what you want from the session.",
            },
            {
              title: "Published rates",
              body: "Use profile pricing as an early comparison point, then confirm the final total directly with the therapist.",
            },
            {
              title: "Availability",
              body: "Review visible availability information and contact the provider directly to confirm the time you need.",
            },
            {
              title: "Gay-friendly context",
              body: "Profiles can include LGBTQ+ affirming information so clients looking for gay-friendly massage can compare fit more easily.",
            },
            {
              title: "Neighborhood and travel",
              body: "A city can contain very different travel times. Confirm exact location or outcall coverage directly with the provider.",
            },
            {
              title: "Trust signals",
              body: "Use visible platform verification and profile signals as context, not as a professional-license guarantee or service endorsement.",
            },
          ]}
        />
      </InstitutionalSection>

      <InstitutionalSection
        eyebrow="Questions"
        title="Male massage near me: frequently asked questions"
      >
        <div className="grid gap-8 lg:grid-cols-3">
          {FAQS.map((faq) => (
            <div key={faq.question}>
              <h3 className="font-display text-xl font-semibold text-text-primary">{faq.question}</h3>
              <p className="mt-3 text-sm leading-7 text-text-secondary">{faq.answer}</p>
            </div>
          ))}
        </div>
      </InstitutionalSection>

      <InstitutionalCta
        title="Find a male massage therapist in your city."
        description="Browse current city coverage, compare public profiles and contact independent providers directly."
        actions={[
          { label: "Browse all cities", href: "/cities" },
          { label: "Gay-friendly massage", href: "/gay-massage", secondary: true },
        ]}
      />
    </InstitutionalPage>
  );
}
