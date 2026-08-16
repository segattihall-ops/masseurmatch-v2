import { formatPrice, PLAN_IDS, PLANS } from "@masseurmatch/billing";
import type { Metadata } from "next";
import Link from "next/link";

import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Pricing";
const DESCRIPTION =
  "What a MasseurMatch listing costs. Free to be listed; paid plans add photos, featured placement, and priority in city results.";
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

/**
 * Pricing.
 *
 * Every number on this page comes from `@masseurmatch/billing`. Nothing is
 * typed in here — a marketing page with its own copy of the prices is exactly
 * how a site ends up advertising one figure and charging another, and this one
 * is the page a therapist will quote back at you.
 */
const FAQS = [
  {
    question: "Do I have to pay to be listed?",
    answer:
      "No. A free listing puts your profile in the directory and in city results. Paid plans add photos, featured placement, and priority ordering.",
  },
  {
    question: "Does MasseurMatch take a commission?",
    answer:
      "No. MasseurMatch is a directory, not a booking service or payment processor. Clients contact you directly and you keep everything you charge.",
  },
  {
    question: "What happens if a payment fails?",
    answer:
      "Your listing stays live through a short grace period rather than disappearing the moment a card is declined. If the subscription is not restored by the end of it, the profile is unlisted — not deleted — and returns when payment resumes.",
  },
  {
    question: "Can I change or cancel a plan?",
    answer:
      "Yes, from your dashboard at any time. Cancelling keeps your listing live until the end of the period you have already paid for.",
  },
];

export default function PricingPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 pb-16 pt-16">
      <header>
        <h1 className="font-display text-ds-40 font-bold tracking-tight text-text-primary">
          {TITLE}
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-text-secondary">{DESCRIPTION}</p>
      </header>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLAN_IDS.map((id) => {
          const plan = PLANS[id];
          return (
            <section
              key={plan.id}
              className="flex flex-col rounded-3xl border border-border-subtle p-6"
            >
              <h2 className="font-display text-ds-18 font-semibold tracking-tight text-text-primary">
                {plan.name}
              </h2>
              <p className="mt-2 font-stat text-ds-32 text-text-primary">
                {formatPrice(plan)}
                {plan.priceCents > 0 ? (
                  <span className="text-base font-normal text-text-secondary">/mo</span>
                ) : null}
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-text-secondary">
                {plan.blurb}
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-text-secondary">
                <li>{plan.photoLimit} photos</li>
                <li>{plan.featured ? "Featured placement" : "Standard placement"}</li>
              </ul>
            </section>
          );
        })}
      </div>

      <p className="mt-6 text-sm text-text-secondary">
        Prices are per month in US dollars. MasseurMatch never takes a commission on your work.
      </p>

      <section className="mt-12">
        <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
          Questions
        </h2>
        <dl className="mt-4 space-y-5">
          {FAQS.map((faq) => (
            <div key={faq.question}>
              <dt className="font-semibold text-text-primary">{faq.question}</dt>
              <dd className="mt-1 leading-relaxed text-text-secondary">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-12 border-t border-border-subtle pt-8">
        <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
          Ready to list?
        </h2>
        <p className="mt-3 leading-relaxed text-text-secondary">
          Create a profile, add your services and photos, and submit it for review.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/for-therapists"
            className="rounded-full bg-action-primary px-5 py-2.5 text-sm font-semibold text-text-inverse transition hover:bg-action-primary-hover"
          >
            For therapists
          </Link>
          <Link
            href="/subscriptions"
            className="rounded-full border border-border-subtle px-5 py-2.5 text-sm font-semibold text-text-primary transition hover:border-brand-secondary"
          >
            Subscription terms
          </Link>
        </div>
      </section>
    </main>
  );
}
