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

const PATH = "/massage-for-men";
const TITLE = "Massage for Men | Male Massage Therapists Near You";
const DESCRIPTION =
  "Find massage for men from independent male massage therapists. Compare services, rates, availability, incall or outcall options, gay-friendly details and local profiles by city.";

const FAQS = [
  {
    question: "How do I find massage for men near me?",
    answer:
      "Start with your city, compare current public therapist profiles, and review listed services, rates, availability and session format. Contact the independent provider directly to confirm exact location, timing and service details.",
  },
  {
    question: "Can I choose a male massage therapist?",
    answer:
      "Yes. MasseurMatch is designed around public profiles for independent male massage therapists, making it easier to compare providers by city, services and profile details before contacting them directly.",
  },
  {
    question: "Can I find LGBTQ+ friendly massage for men?",
    answer:
      "Profiles can include LGBTQ+ affirming information and visible trust signals. Review each profile and contact the provider directly to confirm the environment and service fit you want.",
  },
  {
    question: "Does MasseurMatch book or process massage appointments?",
    answer:
      "No. MasseurMatch is a discovery directory. Clients compare public profiles and contact independent providers directly to confirm availability, pricing, location and appointment details.",
  },
] as const;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: absoluteUrl(PATH),
    languages: {
      "en-US": absoluteUrl(PATH),
      "es-US": absoluteUrl("/es/masajes-para-hombres"),
      "x-default": absoluteUrl(PATH),
    },
  },
  openGraph: {
    type: "website",
    url: absoluteUrl(PATH),
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const dynamic = "force-static";

export default function MassageForMenPage() {
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
        eyebrow="Massage for men"
        title="Find massage for men from independent"
        highlight="male massage therapists."
        description={DESCRIPTION}
        actions={[
          { label: "Browse cities", href: "/cities" },
          { label: "Search therapists", href: "/search", secondary: true },
        ]}
        stats={[
          {
            value: "City first",
            label: "Use local directory pages to compare therapists serving your market.",
          },
          {
            value: "Profile details",
            label: "Compare services, rates, availability and incall or outcall options.",
          },
          {
            value: "Direct contact",
            label: "Confirm final details with the independent provider before arranging a session.",
          },
        ]}
      />

      <InstitutionalBand>
        Looking for massage for men, male massage near you or a male massage therapist should lead
        to useful provider information rather than thin keyword pages. MasseurMatch connects those
        searches to current city pages and public therapist profiles.
      </InstitutionalBand>

      <InstitutionalSection
        eyebrow="Find the right provider"
        title="Compare more than a name or a distance."
        intro="Use public profile details to narrow the directory, then confirm the exact service, rate, location and appointment details directly with the therapist you choose."
      >
        <InstitutionalSteps
          steps={[
            {
              title: "Choose your city",
              body: "Start with a local directory page so the results reflect therapists currently serving that market.",
              meta: "Local massage for men",
            },
            {
              title: "Compare techniques",
              body: "Review deep tissue, Swedish, sports, Thai and other techniques providers list publicly.",
              meta: "Services",
            },
            {
              title: "Check session format",
              body: "Compare incall and outcall options, published rates and visible availability before making contact.",
              meta: "Incall / outcall",
            },
            {
              title: "Contact directly",
              body: "Confirm exact location, timing, total price and service details directly with the independent provider.",
              meta: "No booking middleman",
            },
          ]}
        />
      </InstitutionalSection>

      <InstitutionalSection
        dark
        eyebrow="Search intent"
        title="Male massage, massage for men and gay-friendly massage can overlap."
        intro="MasseurMatch keeps closely related search intent connected through strong topic hubs and city pages instead of publishing dozens of near-duplicate pages."
      >
        <InstitutionalCardGrid
          dark
          cards={[
            {
              title: "Male massage therapist near me",
              body: "Use the near-me hub to move from broad local intent into current city coverage.",
            },
            {
              title: "Massage for men near me",
              body: "Use city pages to compare providers, techniques, rates and session formats in your market.",
            },
            {
              title: "Gay-friendly massage",
              body: "Review LGBTQ+ affirming information when that context matters to your provider choice.",
            },
            {
              title: "Private massage",
              body: "Use profile details to understand incall or outcall format, then confirm the exact setting directly.",
            },
          ]}
        />
      </InstitutionalSection>

      <InstitutionalSection eyebrow="What to compare" title="Useful details for choosing massage for men.">
        <InstitutionalCardGrid
          cards={[
            {
              title: "Techniques",
              body: "Compare the massage styles and specialties each provider lists on the public profile.",
            },
            {
              title: "Rates",
              body: "Review published pricing as a comparison point and confirm the final total directly.",
            },
            {
              title: "Availability",
              body: "Use visible availability as a discovery signal, then confirm the requested time with the provider.",
            },
            {
              title: "Incall or outcall",
              body: "See whether you travel to the therapist or the therapist travels to an agreed location.",
            },
            {
              title: "LGBTQ+ affirming context",
              body: "Profiles can include affirming information to help clients compare provider fit.",
            },
            {
              title: "Trust signals",
              body: "Use visible platform and profile signals as context, not as a guarantee of licensure or service quality.",
            },
          ]}
        />
      </InstitutionalSection>

      <InstitutionalSection eyebrow="Questions" title="Massage for men: frequently asked questions">
        <div className="grid gap-8 md:grid-cols-2">
          {FAQS.map((faq) => (
            <div key={faq.question}>
              <h3 className="font-display text-xl font-semibold text-text-primary">{faq.question}</h3>
              <p className="mt-3 text-sm leading-7 text-text-secondary">{faq.answer}</p>
            </div>
          ))}
        </div>
      </InstitutionalSection>

      <InstitutionalCta
        title="Find massage for men in your city."
        description="Compare current public profiles, services, rates and availability, then contact independent male massage therapists directly."
        actions={[
          { label: "Browse cities", href: "/cities" },
          { label: "Male massage near me", href: "/near-me", secondary: true },
        ]}
      />
    </InstitutionalPage>
  );
}
