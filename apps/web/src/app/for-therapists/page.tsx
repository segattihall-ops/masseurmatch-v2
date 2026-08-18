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
import { absoluteUrl, signUpUrl, SITE_NAME } from "@/lib/site";

const TITLE = "For Therapists";
const DESCRIPTION =
  "Build a public MasseurMatch profile, appear in local discovery, publish your own contact details, and keep the client relationship direct.";
const PATH = "/for-therapists";

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
    question: "Do I need a paid plan to be listed?",
    answer:
      "No. MasseurMatch has a free listing tier. Paid plans expand profile and visibility features according to the current pricing page.",
  },
  {
    question: "Does MasseurMatch take part of my session revenue?",
    answer:
      "No. MasseurMatch is a directory and does not process client session payments or take a commission from the work you perform.",
  },
  {
    question: "Does being Identity Verified mean MasseurMatch verified my professional license?",
    answer:
      "No. Identity verification confirms the identity evidence reviewed by MasseurMatch. It does not verify professional licensing, qualifications, background history, or service quality.",
  },
  {
    question: "Can I update my profile later?",
    answer:
      "Yes. Your dashboard is the operating surface for your listing. Some public-facing edits may go back through review before the public profile updates.",
  },
];

export default function Page() {
  const signUp = signUpUrl();
  const primaryAction = signUp
    ? { label: "Create your account", href: signUp }
    : { label: "See pricing", href: "/pricing" };

  return (
    <InstitutionalPage>
      <InstitutionalHero
        eyebrow="For independent therapists"
        title="Your practice. Your profile."
        highlight="Your client relationship."
        description={DESCRIPTION}
        actions={[primaryAction, { label: "See pricing", href: "/pricing", secondary: true }]}
        stats={[
          {
            value: "Direct contact",
            label: "Prospective clients reach you using your published contact details.",
          },
          {
            value: "No session cut",
            label: "MasseurMatch does not take a commission from client session revenue.",
          },
          {
            value: "Local discovery",
            label: "Profiles can appear across relevant city and service discovery.",
          },
        ]}
      />

      <InstitutionalBand>
        MasseurMatch is not a booking marketplace. The product is your public listing, the discovery
        system around it, and the tools that help you manage how your practice is represented.
      </InstitutionalBand>

      <InstitutionalSection
        eyebrow="What you get"
        title="A professional discovery layer around your independent practice."
        intro="The profile is designed to answer the questions prospective clients ask before they decide who to contact."
      >
        <InstitutionalCardGrid
          cards={[
            {
              title: "A public profile",
              body: "Publish your practice description, services, session formats, rates, city, neighborhood, approved photos, and the contact information you want clients to use.",
              meta: "Your public presence",
            },
            {
              title: "City discovery",
              body: "Your listing can appear in the city markets you actually serve, giving people a more relevant path than a single national directory page.",
              meta: "Local intent",
            },
            {
              title: "Service discovery",
              body: "Structured techniques and service categories make your practice easier to compare when a client already knows what they are looking for.",
              meta: "Searchable context",
            },
            {
              title: "Trust signals",
              body: "Profile moderation and optional identity verification create specific visible signals without pretending MasseurMatch verified more than it actually did.",
              meta: "Precise claims",
            },
            {
              title: "Visibility tools",
              body: "Paid tiers can add profile capacity and distribution features. The pricing page is the source of truth for the current plan ladder and included limits.",
              meta: "Plan based",
            },
            {
              title: "Direct client contact",
              body: "MasseurMatch does not sit in the middle of the appointment. Clients contact you directly and you remain responsible for your own schedule, terms, and service delivery.",
              meta: "Independent relationship",
            },
          ]}
        />
      </InstitutionalSection>

      <InstitutionalSection
        dark
        eyebrow="Getting listed"
        title="Build it once. Keep it current."
        intro="Onboarding is structured around the information the public directory actually needs."
      >
        <InstitutionalSteps
          dark
          steps={[
            {
              title: "Create your account",
              body: "Start with the account that owns and manages your provider profile.",
              meta: "Account",
            },
            {
              title: "Build your listing",
              body: "Add your location, services, rates, session formats, practice description, and photos.",
              meta: "Profile",
            },
            {
              title: "Submit for review",
              body: "Public-facing content is reviewed against platform standards before the listing goes live.",
              meta: "Moderation",
            },
            {
              title: "Manage from your dashboard",
              body: "Keep the listing current, use the tools available to your plan, and update your practice as it changes.",
              meta: "Operate",
            },
          ]}
        />
      </InstitutionalSection>

      <InstitutionalSection
        eyebrow="The boundary"
        title="MasseurMatch helps you get found. You run the practice."
      >
        <InstitutionalSplit
          left={
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-secondary">
                You control
              </p>
              <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight text-text-primary">
                The professional relationship after discovery.
              </h3>
              <ul className="mt-6 space-y-4 text-sm leading-7 text-text-secondary">
                <li>• Your availability and schedule.</li>
                <li>• The rates and services you publish.</li>
                <li>• Where and how you provide sessions.</li>
                <li>• Your direct communication with prospective clients.</li>
                <li>• Your own legal, licensing, tax, insurance, and professional obligations.</li>
              </ul>
            </div>
          }
          right={
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-secondary">
                MasseurMatch controls
              </p>
              <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight text-text-primary">
                The integrity of the directory itself.
              </h3>
              <ul className="mt-6 space-y-4 text-sm leading-7 text-text-secondary">
                <li>• Profile and photo moderation before publication.</li>
                <li>• Platform visibility, ranking, and eligible distribution features.</li>
                <li>• Identity verification status when that review is completed.</li>
                <li>• Enforcement of content, safety, and acceptable-use rules.</li>
                <li>• Subscription entitlements for paid platform features.</li>
              </ul>
            </div>
          }
        />
      </InstitutionalSection>

      <InstitutionalSection eyebrow="Questions" title="Know exactly what you are joining.">
        <InstitutionalFaq items={FAQS} />
      </InstitutionalSection>

      <InstitutionalCta
        eyebrow="Build your presence"
        title="Make your practice easier to discover."
        description="Create your profile first, then use the plan that fits the visibility and profile capacity you need."
        actions={[
          primaryAction,
          { label: "Provider terms", href: "/provider-terms", secondary: true },
        ]}
      />
    </InstitutionalPage>
  );
}
