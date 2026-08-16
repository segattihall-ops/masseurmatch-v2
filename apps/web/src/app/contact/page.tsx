import type { Metadata } from "next";
import Link from "next/link";

import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Contact";
const DESCRIPTION =
  "How to reach MasseurMatch, and where to send the things that need a specific route.";
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
            General enquiries
          </h2>
          <p className="leading-relaxed text-text-secondary">
            Email support@masseurmatch.com for anything about your account, a listing, or the site
            itself.
          </p>
          <p className="leading-relaxed text-text-secondary">
            MasseurMatch does not take bookings and cannot arrange appointments. To book a session,
            contact the therapist directly using the details on their profile.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            Reporting a problem
          </h2>
          <p className="leading-relaxed text-text-secondary">
            To report a profile, a message, or anything that looks unsafe, use the report route
            rather than general support — it goes to the people who can act on it fastest.
          </p>
          <p className="leading-relaxed text-text-secondary">
            If someone is in immediate danger, contact local emergency services first. MasseurMatch
            is not a crisis service and cannot respond in an emergency.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            Legal and copyright
          </h2>
          <p className="leading-relaxed text-text-secondary">
            Copyright notices go to the DMCA agent, and the required contents of a notice are listed
            on that page. Other legal correspondence should go through the legal centre.
          </p>
          <p className="leading-relaxed text-text-secondary">
            Requests to delete your data have their own route, which is faster than email and
            produces a record.
          </p>
        </section>
      </div>

      <section className="mt-12 border-t border-border-subtle pt-8">
        <p className="leading-relaxed text-text-secondary">Looking for something specific?</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/report-block-safety"
            className="rounded-full bg-action-primary text-text-inverse hover:bg-action-primary-hover px-5 py-2.5 text-sm font-semibold transition"
          >
            Report a problem
          </Link>
          <Link
            href="/legal"
            className="rounded-full border border-border-subtle text-text-primary hover:border-brand-secondary px-5 py-2.5 text-sm font-semibold transition"
          >
            Legal centre
          </Link>
        </div>
      </section>
    </main>
  );
}
