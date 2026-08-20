import type { Metadata } from "next";
import Link from "next/link";

import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "How Ranking Works";
const DESCRIPTION =
  "Exactly how MasseurMatch orders therapist profiles: subscription tier, then Spikes, featured status, boost score, rating, review count and name. Nothing hidden.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/how-ranking-works") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/how-ranking-works"),
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
  },
};

/** The exact ordering applied by the directory, in priority order. */
const RANK_FACTORS = [
  {
    label: "Subscription tier",
    note: "The primary sort key. Elite places above Pro, Pro above Standard, and Standard above Free — this is the visibility a paid plan buys, and we are upfront about it. The tier that counts is the one a profile is actually entitled to: a courtesy grant stops lifting a listing the day it expires.",
  },
  {
    label: "Active Spike",
    note: "Within the same tier, a profile running a visibility Spike is lifted above its peers. A Spike never lifts a listing above a higher tier — it buys position within your band, not above someone on a bigger plan.",
  },
  {
    label: "Featured status",
    note: "Within the same tier and Spike state, featured profiles place above non-featured ones.",
  },
  {
    label: "Boost score",
    note: "A per-profile score that breaks the next tie. Higher boost sorts first.",
  },
  {
    label: "Average rating",
    note: "All else equal, a better-rated profile places higher.",
  },
  {
    label: "Review count",
    note: "Between profiles with the same rating, more reviews sort first.",
  },
  {
    label: "Name",
    note: "The final tiebreaker is alphabetical. That makes the ordering fully deterministic — two therapists never swap places at random between visits.",
  },
];

const QUALITY_SIGNALS = [
  {
    label: "Listing clarity",
    note: "A clear headline, professional description, visible rates and accurate service details reduce uncertainty before a client decides whether to contact you.",
  },
  {
    label: "Photo quality",
    note: "Clear, recent, professional photos that accurately represent you and your practice. Stock, misleading or low-quality images weaken trust and may fail moderation.",
  },
  {
    label: "Profile completeness",
    note: "Modalities, rates, service area, availability, bio and contact preferences help clients evaluate fit before reaching out.",
  },
  {
    label: "Verified identity",
    note: "Identity verification is limited to identity evidence — it does not verify professional licensing, background history, qualifications or services.",
  },
  {
    label: "Contact readiness",
    note: "Accurate contact methods and availability make it easy for clients to reach you directly. MasseurMatch is a directory and does not manage appointments.",
  },
  {
    label: "Recent activity",
    note: "Regularly updated details and availability keep your listing accurate and useful to clients.",
  },
];

const WONT_DO = [
  {
    title: "Hide what a plan buys",
    note: "A higher plan buys placement, and this page says so. No dark patterns, no pretending the ordering is something it is not.",
  },
  {
    title: "Manipulate reviews",
    note: "We do not write reviews, sell reviews, or delete a bad one because a therapist upgraded their plan.",
  },
  {
    title: "Fake verification",
    note: "The verified badge means a real identity check — nothing else. We never claim to vet licenses we do not actually vet.",
  },
  {
    title: "Change this quietly",
    note: "If the ordering on this page changes, this page changes with it and says what changed.",
  },
];

const FAQ_ITEMS = [
  {
    question: "Does a paid plan rank me higher?",
    answer:
      "Yes — and we say so plainly. Your subscription tier is the primary sort key in the directory: Elite, Pro and Standard profiles place above Free ones. That is the visibility a plan buys. What a plan does not do is fake trust — reviews, verification and profile quality are still earned.",
  },
  {
    question: "So what decides my order within a tier?",
    answer:
      "In order: an active Spike, featured status, boost score, average rating, review count, and finally your name alphabetically. The ordering is deterministic, so your position is never random.",
  },
  {
    question: "Do you verify professional licenses?",
    answer:
      "No. Professional licenses and credentials are self-declared by the provider, and clients can confirm them with the relevant state board. The verification we perform is identity verification, which is a separate, limited check.",
  },
  {
    question: "Does MasseurMatch take a commission on bookings?",
    answer:
      "No. Clients contact and pay you directly. MasseurMatch is a directory — we are never in the transaction and never take a cut.",
  },
];

export default function HowRankingWorksPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-16 pt-16">
      <h1 className="font-display text-ds-40 font-bold tracking-tight text-text-primary">
        How Ranking Works
      </h1>
      <p className="mt-4 text-text-secondary">
        {
          "Two different things are going on, and it is worth keeping them apart. One is where you appear in the results. The other is whether a client picks you once they see you. Here is exactly how each one works, in public."
        }
      </p>

      <div className="mt-10 space-y-10">
        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            The exact ordering
          </h2>
          <p className="text-text-secondary">
            {
              "Directory results are sorted by the factors below, in this order. Each factor only matters when everything above it is tied. We are not going to pretend a paid plan does nothing: it is the first sort key — the honest trade for keeping the directory free for clients and taking zero commission from therapists."
            }
          </p>
          <ol className="list-decimal space-y-3 pl-6">
            {RANK_FACTORS.map((factor) => (
              <li key={factor.label} className="text-text-secondary">
                <strong className="font-semibold text-text-primary">{factor.label}.</strong>{" "}
                {factor.note}
              </li>
            ))}
          </ol>
          <p className="text-text-secondary">
            <Link
              href="/pricing"
              className="font-medium text-brand-secondary underline underline-offset-2"
            >
              See exactly what each plan includes
            </Link>
            {" — the placement tier is listed right on it."}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            What earns the booking
          </h2>
          <p className="text-text-secondary">
            {
              "Position gets you seen; it does not get you chosen. Once a client opens your profile, the quality signals below decide what happens next. Every one of them is free, and every one is fully in your control."
            }
          </p>
          <ul className="list-disc space-y-3 pl-6">
            {QUALITY_SIGNALS.map((signal) => (
              <li key={signal.label} className="text-text-secondary">
                <strong className="font-semibold text-text-primary">{signal.label}.</strong>{" "}
                {signal.note}
              </li>
            ))}
          </ul>
          <p className="text-text-secondary">
            {
              "Of these, only your rating and review count feed back into placement — and only as late tiebreakers within your tier. The rest decide whether a look becomes a contact."
            }
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            What we will not do
          </h2>
          <p className="text-text-secondary">{"Stated here so you can hold us to it."}</p>
          <ul className="list-disc space-y-3 pl-6">
            {WONT_DO.map((item) => (
              <li key={item.title} className="text-text-secondary">
                <strong className="font-semibold text-text-primary">{item.title}.</strong>{" "}
                {item.note}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            Straight answers
          </h2>
          <dl className="space-y-5">
            {FAQ_ITEMS.map((item) => (
              <div key={item.question}>
                <dt className="font-semibold text-text-primary">{item.question}</dt>
                <dd className="mt-1 text-text-secondary">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            Pick your visibility. Then earn the rest.
          </h2>
          <p className="text-text-secondary">
            {
              "A few minutes to set up: your details, your photos, your rates. Your plan sets where you appear — everything else on this page is free and up to you."
            }
          </p>
          <p className="text-text-secondary">
            <Link
              href="/for-therapists"
              className="font-medium text-brand-secondary underline underline-offset-2"
            >
              List your practice
            </Link>
            {" or "}
            <Link
              href="/pricing"
              className="font-medium text-brand-secondary underline underline-offset-2"
            >
              compare plans
            </Link>
            {"."}
          </p>
        </section>
      </div>
    </main>
  );
}
