import type { Metadata } from "next";

import {
  InstitutionalBand,
  InstitutionalCardGrid,
  InstitutionalCta,
  InstitutionalHero,
  InstitutionalPage,
  InstitutionalSection,
  InstitutionalSteps,
} from "@/components/institutional/institutional-page";
import { jsonLdScript } from "@/lib/jsonld";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Gay Massage & LGBTQ+ Friendly Male Massage Therapists";
const DESCRIPTION =
  "Find gay-friendly and LGBTQ+ affirming male massage therapists by city. Compare public profiles, services, rates, availability, incall/outcall and trust signals.";
const PATH = "/gay-massage";

const FAQS = [
  {
    question: "How do I find gay-friendly massage near me?",
    answer:
      "Browse MasseurMatch by city, review public therapist profiles for LGBTQ+ affirming information, compare listed services and rates, then contact the independent provider directly to confirm fit and availability.",
  },
  {
    question: "What does LGBTQ+ affirming mean on a massage profile?",
    answer:
      "It indicates profile information intended to help LGBTQ+ clients identify a welcoming provider. It does not replace your own review of the therapist's services, qualifications, policies or communication.",
  },
  {
    question: "Does MasseurMatch provide or book massage services?",
    answer:
      "No. MasseurMatch is a discovery directory. Independent providers publish profile information and clients contact them directly to confirm services, location, availability and rates.",
  },
  {
    question: "Can I search for a male massage therapist by city?",
    answer:
      "Yes. City pages are the primary local discovery pages on MasseurMatch and show current public profiles for therapists serving that market.",
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

export default function GayMassagePage() {
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
        eyebrow="Gay & LGBTQ+ friendly massage"
        title="Find gay-friendly male massage therapists"
        highlight="by city."
        description={DESCRIPTION}
        actions={[
          { label: "Browse cities", href: "/cities" },
          { label: "Search therapists", href: "/search", secondary: true },
        ]}
        stats={[
          {
            value: "Local discovery",
            label: "City pages connect search intent with current public provider profiles.",
          },
          {
            value: "LGBTQ+ context",
            label: "Profiles can include affirming information and visible trust signals.",
          },
          {
            value: "Direct contact",
            label: "Confirm services, location, rates and availability with providers directly.",
          },
        ]}
      />

      <InstitutionalBand>
        MasseurMatch helps people looking for gay massage, gay-friendly massage or male massage for
        men discover independent therapists through current public profiles. The directory is for
        discovery and comparison; providers remain responsible for their own services and
        appointments.
      </InstitutionalBand>

      <InstitutionalSection
        eyebrow="Local discovery"
        title="Start with the city, then compare the provider."
        intro="Local intent is strongest when the page answers who serves the market, what they offer and how to contact them without creating duplicate search pages for every wording variation."
      >
        <InstitutionalSteps
          steps={[
            {
              title: "Choose a city",
              body: "Open a local directory page to see male massage therapist profiles currently visible in that market.",
              meta: "Gay massage by city",
            },
            {
              title: "Compare profile details",
              body: "Review techniques, pricing, availability, session format, photos and provider-submitted profile information.",
              meta: "Massage for men",
            },
            {
              title: "Review affirming signals",
              body: "Use LGBTQ+ affirming profile details and visible trust signals as additional context when narrowing your options.",
              meta: "Gay-friendly massage",
            },
            {
              title: "Contact directly",
              body: "Confirm exact service details, location, timing, rates and expectations with the independent therapist before meeting.",
              meta: "Direct contact",
            },
          ]}
        />
      </InstitutionalSection>

      <InstitutionalSection
        dark
        eyebrow="Search intent"
        title="One useful hub can serve several closely related searches."
        intro="Gay massage, gay-friendly massage, male massage and massage for men often overlap in local discovery intent. MasseurMatch keeps them connected through one authoritative topic hub plus city pages instead of thin duplicate pages."
      >
        <InstitutionalCardGrid
          dark
          cards={[
            {
              title: "Gay massage near me",
              body: "Use the local city structure to move from broad near-me intent into current public profiles.",
            },
            {
              title: "Male massage therapist",
              body: "Browse the full therapist hub when you want to compare male massage providers across markets.",
            },
            {
              title: "Massage for men",
              body: "Compare listed techniques, rates, availability and session format rather than relying on a label alone.",
            },
            {
              title: "LGBTQ+ friendly massage",
              body: "Use affirming profile information as one part of a broader provider comparison.",
            },
          ]}
        />
      </InstitutionalSection>

      <InstitutionalSection
        eyebrow="What to compare"
        title="Useful profile details matter more than keyword labels."
      >
        <InstitutionalCardGrid
          cards={[
            {
              title: "Massage techniques",
              body: "Compare deep tissue, Swedish, sports, Thai and other techniques providers list on their profiles.",
            },
            {
              title: "Incall or outcall",
              body: "Check whether you travel to the provider or the provider travels to an agreed location.",
            },
            {
              title: "Rates",
              body: "Review published pricing and confirm the final total directly before arranging a session.",
            },
            {
              title: "Availability",
              body: "Use visible availability as a discovery signal, then confirm the requested time directly with the therapist.",
            },
            {
              title: "Trust signals",
              body: "Use visible profile and identity signals as context, not as a guarantee of licensure or service quality.",
            },
            {
              title: "Communication",
              body: "Confirm expectations, exact location and service details directly with the independent provider.",
            },
          ]}
        />
      </InstitutionalSection>

      <InstitutionalSection eyebrow="Questions" title="Gay massage: frequently asked questions">
        <div className="grid gap-8 md:grid-cols-2">
          {FAQS.map((faq) => (
            <div key={faq.question}>
              <h3 className="font-display text-xl font-semibold text-text-primary">
                {faq.question}
              </h3>
              <p className="mt-3 text-sm leading-7 text-text-secondary">{faq.answer}</p>
            </div>
          ))}
        </div>
      </InstitutionalSection>

      <InstitutionalCta
        title="Find a gay-friendly male massage therapist in your city."
        description="Browse local directory pages, compare current public profiles and contact independent providers directly."
        actions={[
          { label: "Browse cities", href: "/cities" },
          { label: "Male massage near me", href: "/near-me", secondary: true },
        ]}
      />
    </InstitutionalPage>
  );
}
