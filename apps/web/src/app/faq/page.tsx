import type { Metadata } from "next";

import {
  InstitutionalCta,
  InstitutionalFaq,
  InstitutionalHero,
  InstitutionalPage,
  InstitutionalSection,
} from "@/components/institutional/institutional-page";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Frequently Asked Questions";
const DESCRIPTION =
  "Clear answers about MasseurMatch discovery, profile review, identity verification, direct contact, therapist listings, and platform boundaries.";
const PATH = "/faq";

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

const DIRECTORY_FAQS = [
  {
    question: "What is MasseurMatch?",
    answer:
      "MasseurMatch is a directory of independent male massage therapists. Clients browse public profiles and contact providers directly. MasseurMatch does not provide massage, employ the therapists, arrange appointments, or process client session payments.",
  },
  {
    question: "How do I find a therapist?",
    answer:
      "Start with search or a city page, then compare profile details such as services, session format, published rates, location information, photos, and visible trust signals before contacting a provider.",
  },
  {
    question: "Does MasseurMatch charge clients a booking fee?",
    answer:
      "No. There is no MasseurMatch booking transaction for a client session. Contact and any service arrangement happen directly between the client and the independent therapist.",
  },
  {
    question: "What should I confirm before scheduling directly with a therapist?",
    answer:
      "Confirm timing, location, total price, session format, boundaries, credentials that matter to you, and any other expectations directly with the provider before meeting.",
  },
];

const TRUST_FAQS = [
  {
    question: "Is every therapist identity verified?",
    answer:
      "No. Every public profile is reviewed before publication, but only providers who complete the identity-verification process display the Identity Verified signal.",
  },
  {
    question: "What does Identity Verified mean?",
    answer:
      "It means MasseurMatch reviewed identity evidence for that provider. It is a point-in-time identity signal only. It does not verify professional licensing, qualifications, insurance, background history, service quality, or future conduct.",
  },
  {
    question: "Does MasseurMatch verify massage licenses?",
    answer:
      "Not as a universal platform feature. Unless a profile explicitly states otherwise for a separate verified program, clients should confirm any professional license or credential directly with the provider or relevant authority.",
  },
  {
    question: "Why does a profile sometimes show initials instead of a photo?",
    answer:
      "Public cards use approved provider photos when available. If no approved usable photo is available, the card shows the therapist's initials. MasseurMatch does not substitute stock photography for a real provider.",
  },
  {
    question: "Is a trust badge a guarantee?",
    answer:
      "No. Trust signals communicate a specific review that occurred. They are not endorsements, warranties, background checks, licensing claims, or guarantees of a session outcome.",
  },
];

const PROVIDER_FAQS = [
  {
    question: "Can therapists list for free?",
    answer:
      "Yes. The current plan ladder includes a Free tier. Paid plans add profile capacity and platform visibility features according to the pricing page.",
  },
  {
    question: "Does MasseurMatch take a commission from therapist session revenue?",
    answer:
      "No. Clients contact therapists directly, and MasseurMatch does not process client session payments or take a percentage of the therapist's service revenue.",
  },
  {
    question: "Can a therapist edit their profile?",
    answer:
      "Yes. The provider dashboard is the operating surface for the listing. Some public-facing changes may require review again before they appear on the public profile.",
  },
  {
    question: "How do I remove or hide my listing?",
    answer:
      "Use the provider dashboard to change profile visibility where available, or contact support@masseurmatch.com for account and listing assistance.",
  },
];

export default function FaqPage() {
  return (
    <InstitutionalPage>
      <InstitutionalHero
        eyebrow="FAQ"
        title="Clear answers."
        highlight="Precise platform boundaries."
        description={DESCRIPTION}
        actions={[
          { label: "Find a therapist", href: "/search" },
          { label: "Contact support", href: "/contact", secondary: true },
        ]}
        stats={[
          { value: "Directory", label: "Discovery and direct contact, not booking mediation." },
          { value: "Reviewed", label: "Public profiles are reviewed before publication." },
          {
            value: "Specific signals",
            label: "Verification means only what the completed review actually checked.",
          },
        ]}
      />

      <InstitutionalSection
        eyebrow="Using the directory"
        title="Finding and contacting a therapist."
        intro="The client experience is intentionally centered on useful profile information and direct communication."
      >
        <InstitutionalFaq items={DIRECTORY_FAQS} />
      </InstitutionalSection>

      <InstitutionalSection
        dark
        eyebrow="Trust & verification"
        title="Know exactly what a review signal means."
        intro="MasseurMatch avoids turning limited verification into broad claims. The distinctions below are deliberate."
      >
        <div className="rounded-[2rem] bg-bg-surface p-1 sm:p-2">
          <InstitutionalFaq items={TRUST_FAQS} />
        </div>
      </InstitutionalSection>

      <InstitutionalSection eyebrow="For therapists" title="Listing and operating your profile.">
        <InstitutionalFaq items={PROVIDER_FAQS} />
      </InstitutionalSection>

      <InstitutionalCta
        title="Still looking for a specific answer?"
        description="Use the contact page to route support, billing, legal, and safety questions to the right place."
        actions={[
          { label: "Contact MasseurMatch", href: "/contact" },
          { label: "Trust & safety", href: "/trust", secondary: true },
        ]}
      />
    </InstitutionalPage>
  );
}
