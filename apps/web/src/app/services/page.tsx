import type { Metadata } from "next";
import Link from "next/link";

import { SERVICES } from "@/content/services";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Massage Services & Specialties";
const DESCRIPTION =
  "Explore massage types and specialties on MasseurMatch, then compare public therapist profiles and contact providers directly.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/services") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/services"),
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function ServicesPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-16 pt-16">
      <h1 className="font-display text-ds-40 font-bold tracking-tight text-text-primary">
        Massage Services &amp; Specialties
      </h1>
      <p className="mt-4 text-text-secondary">
        MasseurMatch therapists list a wide range of massage specialties, from deep tissue and
        sports recovery to relaxation and mobile sessions. Explore each service below, compare
        public profiles, and contact therapists directly to confirm fit and availability.
      </p>

      <div className="mt-10 space-y-10">
        {SERVICES.map((service) => (
          <section key={service.slug} className="space-y-3">
            <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
              {service.label}
            </h2>
            <p className="text-text-secondary">{service.intro}</p>
            <p className="text-text-secondary">
              <Link
                href={`/services/${service.slug}`}
                className="font-medium text-brand-secondary underline underline-offset-2"
              >
                Explore {service.label}
              </Link>
              {" · "}
              <Link
                href={`/search?q=${encodeURIComponent(service.query)}`}
                className="font-medium text-brand-secondary underline underline-offset-2"
              >
                Search profiles
              </Link>
            </p>
          </section>
        ))}

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            Can&apos;t find your service?
          </h2>
          <p className="text-text-secondary">
            Use the full search to look for a technique or specialty by keyword. A therapist may
            offer services beyond the categories highlighted here, so confirm details directly.
          </p>
          <p>
            <Link
              href="/search"
              className="font-medium text-brand-secondary underline underline-offset-2"
            >
              Search all therapists
            </Link>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            How to choose a massage service
          </h2>
          <ul className="list-disc space-y-2 pl-6">
            <li className="text-text-secondary">
              <strong className="font-semibold text-text-primary">Assess your goal:</strong> decide
              whether you are primarily looking for relaxation, recovery, mobility or targeted
              muscle work.
            </li>
            <li className="text-text-secondary">
              <strong className="font-semibold text-text-primary">Compare specialties:</strong>{" "}
              review the techniques and experience each therapist lists on his profile.
            </li>
            <li className="text-text-secondary">
              <strong className="font-semibold text-text-primary">Review trust signals:</strong> use
              visible verification and profile information as part of your decision.
            </li>
            <li className="text-text-secondary">
              <strong className="font-semibold text-text-primary">
                Choose the session format:
              </strong>{" "}
              confirm whether you need incall or outcall service.
            </li>
            <li className="text-text-secondary">
              <strong className="font-semibold text-text-primary">Communicate directly:</strong>{" "}
              MasseurMatch is a directory, so scheduling and service details are confirmed with the
              therapist.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            Explore more
          </h2>
          <p className="text-text-secondary">
            <Link
              href="/cities"
              className="font-medium text-brand-secondary underline underline-offset-2"
            >
              Browse cities
            </Link>
            {" · "}
            <Link
              href="/therapists"
              className="font-medium text-brand-secondary underline underline-offset-2"
            >
              All therapists
            </Link>
            {" · "}
            <Link
              href="/guides"
              className="font-medium text-brand-secondary underline underline-offset-2"
            >
              Massage guides
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
