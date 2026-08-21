import { FadeIn } from "@masseurmatch/ui";
import type { Metadata } from "next";

import {
  InstitutionalBand,
  InstitutionalCta,
  InstitutionalHero,
  InstitutionalPage,
  InstitutionalSection,
  InstitutionalSteps,
} from "@/components/institutional/institutional-page";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Contact MasseurMatch";
const DESCRIPTION =
  "Reach the right MasseurMatch team for account support, billing, legal correspondence, data requests, or trust and safety concerns.";
const PATH = "/contact";

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

const ROUTES = [
  {
    eyebrow: "General",
    title: "Support",
    email: "support@masseurmatch.com",
    body: "Accounts, public listings, profile questions, site behavior, and general product support.",
  },
  {
    eyebrow: "Subscriptions",
    title: "Billing",
    email: "billing@masseurmatch.com",
    body: "Subscription charges, plan questions, payment issues, cancellations, and billing records.",
  },
  {
    eyebrow: "Official correspondence",
    title: "Legal",
    email: "legal@masseurmatch.com",
    body: "Legal notices, privacy correspondence, formal requests, and matters that require the legal route.",
  },
];

export default function Page() {
  return (
    <InstitutionalPage>
      <InstitutionalHero
        eyebrow="Contact"
        title="Reach the right team."
        highlight="Skip the routing guesswork."
        description={DESCRIPTION}
        actions={[
          { label: "Report a safety issue", href: "/report-block-safety" },
          { label: "Legal centre", href: "/legal", secondary: true },
        ]}
        stats={[
          { value: "Support", label: "Accounts, listings, and product questions." },
          { value: "Billing", label: "Subscriptions and payment support." },
          { value: "Legal", label: "Formal correspondence and legal notices." },
        ]}
      />

      <InstitutionalBand>
        MasseurMatch cannot arrange an appointment with a therapist. Clients contact independent
        providers directly using the contact information published on each profile.
      </InstitutionalBand>

      <InstitutionalSection
        eyebrow="Email routing"
        title="One inbox for each kind of problem."
        intro="Use the most specific route available so the request reaches the team responsible for it."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {ROUTES.map((route, index) => (
            <FadeIn
              key={route.email}
              whileInView
              delay={index * 0.06}
              className="flex min-h-72 flex-col rounded-[2rem] border border-border-subtle bg-bg-surface p-7 shadow-ds-sm transition duration-300 hover:-translate-y-1 hover:shadow-ds-md sm:p-8"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-secondary">
                {route.eyebrow}
              </p>
              <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight text-text-primary">
                {route.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-text-secondary">{route.body}</p>
              <a
                href={`mailto:${route.email}`}
                className="mt-auto pt-8 text-sm font-semibold text-brand-secondary transition hover:text-action-primary-hover"
              >
                {route.email} →
              </a>
            </FadeIn>
          ))}
        </div>
      </InstitutionalSection>

      <InstitutionalSection
        dark
        eyebrow="Safety & formal requests"
        title="Some issues have a dedicated path for a reason."
        intro="Use the specialized route when the request needs evidence, a policy workflow, or a durable record."
      >
        <InstitutionalSteps
          dark
          steps={[
            {
              title: "Safety or profile concern",
              body: "Use Report & Safety for a misleading profile, suspicious behavior, harassment, or another concern that needs platform review.",
              meta: "/report-block-safety",
            },
            {
              title: "Copyright notice",
              body: "Use the DMCA page for copyright notices so the required information reaches the designated process.",
              meta: "/dmca",
            },
            {
              title: "Data deletion",
              body: "Use the data-deletion route when the request is specifically about deleting personal data or an account record.",
              meta: "/data-deletion",
            },
            {
              title: "Policy or legal question",
              body: "Start in the legal centre for platform terms, privacy, subscriptions, content rules, and official notices.",
              meta: "/legal",
            },
          ]}
        />
      </InstitutionalSection>

      <InstitutionalCta
        title="Need to report something on the platform?"
        description="Use the safety route for actionable profile or conduct concerns instead of burying them in general support."
        actions={[
          { label: "Report a problem", href: "/report-block-safety" },
          { label: "Trust & safety", href: "/trust", secondary: true },
        ]}
      />
    </InstitutionalPage>
  );
}
