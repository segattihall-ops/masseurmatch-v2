import type { Metadata } from "next";
import Link from "next/link";

import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Advertise on MasseurMatch";
const DESCRIPTION =
  "Listing plans built for therapist visibility across city pages, search results, and specialty discovery.";
const PATH = "/advertise";

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
            Who this is for
          </h2>
          <p className="leading-relaxed text-text-secondary">
            Independent massage therapists who want to be found in the cities they work. If that is
            you, listing your own profile is the whole product — see the pricing page for what each
            plan includes.
          </p>
          <p className="leading-relaxed text-text-secondary">
            MasseurMatch does not sell display advertising, sponsored articles, or banner
            placements, and it does not run third-party ad networks. The only thing you can pay for
            is the visibility of your own listing.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            How placement works
          </h2>
          <p className="leading-relaxed text-text-secondary">
            Results are ordered by relevance to the city and the search first. Paid plans raise
            placement within that, and featured listings are marked as such — they are never
            disguised as ordinary results.
          </p>
          <p className="leading-relaxed text-text-secondary">
            No plan buys a review, a verification badge, or a claim the profile cannot support.
            Those are earned or checked, not sold.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            Partnerships and press
          </h2>
          <p className="leading-relaxed text-text-secondary">
            For anything that is not a therapist listing — partnership enquiries, press, or data
            requests — email support and say which it is.
          </p>
          <p className="leading-relaxed text-text-secondary">
            Advertising arrangements, where they exist, are governed by the advertising terms.
          </p>
        </section>
      </div>

      <section className="mt-12 border-t border-border-subtle pt-8">
        <p className="leading-relaxed text-text-secondary">Want to be listed?</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/pricing"
            className="rounded-full bg-action-primary text-text-inverse hover:bg-action-primary-hover px-5 py-2.5 text-sm font-semibold transition"
          >
            See plans
          </Link>
          <Link
            href="/advertising-terms"
            className="rounded-full border border-border-subtle text-text-primary hover:border-brand-secondary px-5 py-2.5 text-sm font-semibold transition"
          >
            Advertising terms
          </Link>
        </div>
      </section>
    </main>
  );
}
