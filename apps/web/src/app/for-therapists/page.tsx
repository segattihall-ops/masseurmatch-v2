import type { Metadata } from "next";
import Link from "next/link";

import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "For Therapists";
const DESCRIPTION =
  "A public profile, in the cities you actually work, with your own contact details on it. No commission, no booking system taking a cut.";
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
            What a listing gives you
          </h2>
          <p className="leading-relaxed text-text-secondary">
            A profile page that search engines can find, on a directory built around city and
            service discovery rather than a single national list. Your city page, your services,
            your rates, and your contact details.
          </p>
          <p className="leading-relaxed text-text-secondary">
            Clients contact you directly. MasseurMatch never takes a percentage of your work, never
            handles your payments, and never sits between you and the people who hire you.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            Getting listed
          </h2>
          <p className="leading-relaxed text-text-secondary">
            Create an account and work through the onboarding: your basics and city, the services
            you offer and what you charge, and your photos. You can leave and come back — progress
            is saved at each step.
          </p>
          <p className="leading-relaxed text-text-secondary">
            When it is complete, submit it for review. A person reads every profile before it goes
            live, usually to check the photos and the description against the content rules.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            Keeping it live
          </h2>
          <p className="leading-relaxed text-text-secondary">
            You can edit your profile whenever you like. Changes to prices, availability and contact
            details take effect straight away; edits to your name, description, services, or photos
            go back through review before the public page updates.
          </p>
          <p className="leading-relaxed text-text-secondary">
            If a payment fails, your listing stays up through a grace period rather than vanishing
            the same day. It is unlisted, never deleted, and comes straight back when payment
            resumes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            What is expected
          </h2>
          <p className="leading-relaxed text-text-secondary">
            Accurate information, photos that are genuinely of you, and services that are lawful and
            non-sexual. The content rules exist to keep the directory usable and to comply with US
            law — they are enforced, and profiles that break them are removed.
          </p>
          <p className="leading-relaxed text-text-secondary">
            Read the provider terms and the content guidelines before you list. They are short and
            they say exactly where the lines are.
          </p>
        </section>
      </div>

      <section className="mt-12 border-t border-border-subtle pt-8">
        <p className="leading-relaxed text-text-secondary">Ready to list?</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/pricing"
            className="rounded-full bg-action-primary text-text-inverse hover:bg-action-primary-hover px-5 py-2.5 text-sm font-semibold transition"
          >
            See pricing
          </Link>
          <Link
            href="/provider-terms"
            className="rounded-full border border-border-subtle text-text-primary hover:border-brand-secondary px-5 py-2.5 text-sm font-semibold transition"
          >
            Provider terms
          </Link>
        </div>
      </section>
    </main>
  );
}
