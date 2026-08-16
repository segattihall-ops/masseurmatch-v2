import type { Metadata } from "next";
import Link from "next/link";

import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "How It Works";
const DESCRIPTION =
  "MasseurMatch is a directory. You browse public profiles and contact independent therapists directly — there is no booking system and no middleman.";
const PATH = "/how-it-works";

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
  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-16 pt-16">
      <header>
        <h1 className="font-display text-ds-40 font-bold tracking-tight text-text-primary">
          {TITLE}
        </h1>
        <p className="mt-4 leading-relaxed text-text-secondary">{DESCRIPTION}</p>
      </header>

      <div className="mt-10 space-y-10">
        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            Find someone near you
          </h2>
          <p className="leading-relaxed text-text-secondary">
            Start from your city or search by service. Every listing shows where the therapist
            works, what they offer, and whether they see clients at their own space, travel to you,
            or both.
          </p>
          <p className="leading-relaxed text-text-secondary">
            Profiles are ordered by relevance to your city and search, not by who paid the most.
            Paid placement is marked where it exists.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            Compare before you contact
          </h2>
          <p className="leading-relaxed text-text-secondary">
            Each profile carries the details that actually change whether someone is a fit: services
            and techniques, session formats, published rates, neighbourhood, and availability.
          </p>
          <p className="leading-relaxed text-text-secondary">
            Take the time to read the whole profile. A complete listing with clear pricing and a
            specific description is usually a sign of someone who communicates well in person too.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            Contact the therapist directly
          </h2>
          <p className="leading-relaxed text-text-secondary">
            Contact details are on the profile. You arrange timing, location, and price with the
            therapist — MasseurMatch does not take bookings, process payments, or take a commission.
          </p>
          <p className="leading-relaxed text-text-secondary">
            Because the arrangement is directly between you and an independent provider, confirm
            anything that matters to you — credentials, session length, what is included — before
            you book.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            What MasseurMatch is not
          </h2>
          <p className="leading-relaxed text-text-secondary">
            It is not an employer, an agency, a booking service, or a payment processor, and it does
            not provide massage. Therapists listed here are independent professionals responsible
            for their own services and licensing.
          </p>
          <p className="leading-relaxed text-text-secondary">
            Every profile is reviewed before it goes live, and listings that break the rules are
            removed. Review is not a background check or a guarantee — read the verification page
            for exactly what is and is not checked.
          </p>
        </section>
      </div>

      <section className="mt-12 border-t border-border-subtle pt-8">
        <p className="leading-relaxed text-text-secondary">Ready to look?</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/search"
            className="rounded-full bg-action-primary text-text-inverse hover:bg-action-primary-hover px-5 py-2.5 text-sm font-semibold transition"
          >
            Browse therapists
          </Link>
          <Link
            href="/verification"
            className="rounded-full border border-border-subtle text-text-primary hover:border-brand-secondary px-5 py-2.5 text-sm font-semibold transition"
          >
            What we verify
          </Link>
        </div>
      </section>
    </main>
  );
}
