import type { Metadata } from "next";
import Link from "next/link";

import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Massage Near Me";
const DESCRIPTION =
  "Find a male massage therapist in your city, compare what they offer, and contact them directly.";
const PATH = "/near-me";

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
            Start with your city
          </h2>
          <p className="leading-relaxed text-text-secondary">
            Searching for massage near you works best when you start from the city rather than a map
            radius. Browse the city list to find yours, then narrow by service, session format, or
            price.
          </p>
          <p className="leading-relaxed text-text-secondary">
            If your city is not listed yet, the directory is still growing — the states page shows
            everywhere currently covered.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            Incall, outcall, or both
          </h2>
          <p className="leading-relaxed text-text-secondary">
            Incall means the therapist has their own space and you travel to them; outcall means
            they come to you, at home or at a hotel. Many offer both, and profiles say which.
          </p>
          <p className="leading-relaxed text-text-secondary">
            Outcall coverage varies by neighbourhood and can carry a travel fee, so confirm the area
            and the price with the therapist before arranging anything.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            What to check before contacting
          </h2>
          <p className="leading-relaxed text-text-secondary">
            Look at the services and techniques listed, the published rates, the session lengths,
            and how recently the profile was updated. A specific, complete profile tells you more
            than a short one.
          </p>
          <p className="leading-relaxed text-text-secondary">
            MasseurMatch is a directory: you arrange everything directly with an independent
            provider. Confirm timing, location, price and anything else that matters to you before
            you commit.
          </p>
        </section>
      </div>

      <section className="mt-12 border-t border-border-subtle pt-8">
        <p className="leading-relaxed text-text-secondary">Where are you?</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/cities"
            className="rounded-full bg-action-primary text-text-inverse hover:bg-action-primary-hover px-5 py-2.5 text-sm font-semibold transition"
          >
            Browse cities
          </Link>
          <Link
            href="/search"
            className="rounded-full border border-border-subtle text-text-primary hover:border-brand-secondary px-5 py-2.5 text-sm font-semibold transition"
          >
            Search therapists
          </Link>
        </div>
      </section>
    </main>
  );
}
