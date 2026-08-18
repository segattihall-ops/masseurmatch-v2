import { formatPrice, PLAN_IDS, PLANS } from "@masseurmatch/billing";
import { FadeIn, StaggerItem, StaggerList } from "@masseurmatch/ui";
import type { Metadata } from "next";

import {
  InstitutionalBand,
  InstitutionalCta,
  InstitutionalFaq,
  InstitutionalHero,
  InstitutionalPage,
  InstitutionalSection,
} from "@/components/institutional/institutional-page";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Pricing";
const DESCRIPTION =
  "Start with a free MasseurMatch listing, then add profile capacity and visibility tools when your practice needs them.";
const PATH = "/pricing";

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
    question: "Do I have to pay to be listed?",
    answer:
      "No. Free is a real listing tier. Paid plans add profile capacity and platform visibility features according to the current plan table.",
  },
  {
    question: "Does MasseurMatch take a commission from my sessions?",
    answer:
      "No. MasseurMatch is a directory and does not process client session payments or take a percentage of what you charge for your work.",
  },
  {
    question: "What is a Visibility Spike?",
    answer:
      "A Visibility Spike is a plan feature that temporarily increases distribution for a listing. The number included each month depends on the plan shown above.",
  },
  {
    question: "What does Available Now mean?",
    answer:
      "Eligible paid tiers can start a temporary Available Now window. The duration is fixed by the plan and indicates that the therapist has chosen to show current availability for that period.",
  },
  {
    question: "Can a paid plan buy an identity badge?",
    answer:
      "No. Identity verification is separate from subscription tier. A plan cannot purchase a verification result or turn an unverified identity into a verified one.",
  },
];

export default function PricingPage() {
  return (
    <InstitutionalPage>
      <InstitutionalHero
        eyebrow="Plans"
        title="Start visible."
        highlight="Scale when it earns its place."
        description={DESCRIPTION}
        actions={[
          { label: "For therapists", href: "/for-therapists" },
          { label: "Subscription terms", href: "/subscriptions", secondary: true },
        ]}
        stats={[
          { value: "Free", label: "A public directory listing without a monthly subscription." },
          { value: "No commission", label: "Client session revenue stays between provider and client." },
          { value: "4 tiers", label: "A simple ladder from Free through Elite." },
        ]}
      />

      <InstitutionalBand>
        Every price and per-tier limit on this page comes from the same billing configuration used by
        the application. The marketing page does not maintain a second copy of the plan ladder.
      </InstitutionalBand>

      <InstitutionalSection
        eyebrow="Current ladder"
        title="Choose the amount of profile capacity and visibility you actually need."
        intro="Free gets you listed. Higher tiers add photos, Visibility Spikes, Available Now windows, and featured eligibility where the plan includes it."
      >
        <StaggerList
          whileInView
          as="ul"
          className="grid list-none gap-4 p-0 sm:grid-cols-2 xl:grid-cols-4"
        >
          {PLAN_IDS.map((id) => {
            const plan = PLANS[id];
            const isFeatured = id === "pro";
            return (
              <StaggerItem as="li" key={plan.id} className="h-full">
                <section
                  className={`flex h-full min-h-[31rem] flex-col overflow-hidden rounded-[2rem] border p-7 transition duration-300 hover:-translate-y-1 hover:shadow-ds-md ${
                    isFeatured
                      ? "border-brand-secondary/40 bg-[#111113] text-white shadow-lg shadow-brand-secondary/10"
                      : "border-border-subtle bg-bg-surface text-text-primary"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <p
                      className={`text-[10px] font-semibold uppercase tracking-[0.22em] ${
                        isFeatured ? "text-[#d66b7a]" : "text-brand-secondary"
                      }`}
                    >
                      {plan.id === "free" ? "Start here" : `Tier ${PLAN_IDS.indexOf(id) + 1}`}
                    </p>
                    {isFeatured ? (
                      <span className="rounded-full bg-brand-secondary px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                        Featured
                      </span>
                    ) : null}
                  </div>

                  <h2 className={`mt-5 font-display text-2xl font-semibold tracking-tight ${isFeatured ? "text-white" : "text-text-primary"}`}>
                    {plan.name}
                  </h2>
                  <p className={`mt-3 font-stat text-4xl ${isFeatured ? "text-white" : "text-text-primary"}`}>
                    {formatPrice(plan)}
                    {plan.priceCents > 0 ? (
                      <span className={`ml-1 text-sm font-normal ${isFeatured ? "text-white/50" : "text-text-secondary"}`}>
                        / month
                      </span>
                    ) : null}
                  </p>
                  <p className={`mt-4 text-sm leading-7 ${isFeatured ? "text-white/60" : "text-text-secondary"}`}>
                    {plan.blurb}
                  </p>

                  <div className={`my-7 h-px ${isFeatured ? "bg-white/[0.08]" : "bg-border-subtle"}`} />

                  <ul className={`space-y-4 text-sm ${isFeatured ? "text-white/70" : "text-text-secondary"}`}>
                    <li className="flex items-start justify-between gap-4">
                      <span>Profile photos</span>
                      <strong className={isFeatured ? "text-white" : "text-text-primary"}>{plan.photoLimit}</strong>
                    </li>
                    <li className="flex items-start justify-between gap-4">
                      <span>Visibility Spikes / month</span>
                      <strong className={isFeatured ? "text-white" : "text-text-primary"}>{plan.spikesPerMonth}</strong>
                    </li>
                    <li className="flex items-start justify-between gap-4">
                      <span>Available Now window</span>
                      <strong className={isFeatured ? "text-white" : "text-text-primary"}>
                        {plan.availableNowHours > 0 ? `${plan.availableNowHours}h` : "—"}
                      </strong>
                    </li>
                    <li className="flex items-start justify-between gap-4">
                      <span>Featured eligibility</span>
                      <strong className={isFeatured ? "text-white" : "text-text-primary"}>
                        {plan.featured ? "Yes" : "No"}
                      </strong>
                    </li>
                  </ul>

                  <p className={`mt-auto pt-8 text-xs leading-5 ${isFeatured ? "text-white/38" : "text-text-muted"}`}>
                    Prices are monthly in US dollars. Platform features are subject to the subscription terms and current entitlement rules.
                  </p>
                </section>
              </StaggerItem>
            );
          })}
        </StaggerList>
      </InstitutionalSection>

      <InstitutionalSection
        dark
        eyebrow="What you are paying for"
        title="Visibility tools, not control over the client relationship."
        intro="A paid MasseurMatch tier changes platform features around your listing. It does not turn MasseurMatch into your booking processor or employer."
      >
        <div className="grid gap-px overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.08] sm:grid-cols-3">
          {[
            ["More profile capacity", "Higher tiers allow more approved profile photos so the public page can show more of the practice."],
            ["More distribution tools", "Visibility Spikes and featured eligibility are platform visibility features controlled by the current plan."],
            ["Current-availability signal", "Eligible tiers can start an Available Now window for the duration defined by that plan."],
          ].map(([title, body]) => (
            <FadeIn key={title} whileInView className="bg-[#151517] p-8">
              <h3 className="font-display text-xl font-semibold tracking-tight text-white">{title}</h3>
              <p className="mt-4 text-sm leading-7 text-white/58">{body}</p>
            </FadeIn>
          ))}
        </div>
      </InstitutionalSection>

      <InstitutionalSection eyebrow="Questions" title="Know what changes when you upgrade.">
        <InstitutionalFaq items={FAQS} />
      </InstitutionalSection>

      <InstitutionalCta
        title="Build the listing first. Upgrade when the leverage is clear."
        description="Start with the provider experience, then choose the tier that matches the capacity and distribution your practice needs."
        actions={[
          { label: "List your practice", href: "/for-therapists" },
          { label: "Read subscription terms", href: "/subscriptions", secondary: true },
        ]}
      />
    </InstitutionalPage>
  );
}
