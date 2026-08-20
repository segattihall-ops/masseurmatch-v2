import type { Metadata } from "next";
import Link from "next/link";

import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Massage Services & Specialties";
const DESCRIPTION =
  "Explore different massage types and specialties on MasseurMatch. From deep tissue and Swedish to sports massage and lymphatic drainage. Find the right massage therapy for your needs.";

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

const SERVICES = [
  {
    label: "Deep Tissue",
    query: "deep tissue",
    intro:
      "Deep tissue massage uses concentrated pressure to address muscle tension, recovery, and chronic pain. Browse therapists who specialize in deep tissue work, compare session formats, and contact providers directly.",
  },
  {
    label: "Swedish Massage",
    query: "swedish",
    intro:
      "Swedish massage emphasizes relaxation, improved circulation, and overall wellness through long gliding strokes and kneading. Find therapists who specialize in Swedish technique, available for incall and outcall sessions.",
  },
  {
    label: "Sports Massage",
    query: "sports massage",
    intro:
      "Sports massage is designed for athletes and active individuals to enhance performance, speed recovery, and prevent injury. Discover therapists who work with athletes, offering pre-event and post-event massage.",
  },
  {
    label: "Thai Massage",
    query: "thai massage",
    intro:
      "Thai massage is an ancient healing practice combining acupressure, stretching, and energy work along body lines. Find therapists trained in traditional Thai technique, available for incall and outcall sessions.",
  },
  {
    label: "Mobile & Outcall Massage",
    query: "mobile",
    intro:
      "Mobile and outcall massage therapists bring therapeutic sessions directly to your home, hotel, or office — the same professional standards as studio massage, at your location.",
  },
  {
    label: "Hotel Massage",
    query: "hotel massage",
    intro:
      "Hotel massage brings relaxation and recovery directly to your hotel room or vacation rental. Discover therapists specializing in travel and hotel massage services in major cities.",
  },
  {
    label: "Lymphatic Drainage",
    query: "lymphatic drainage",
    intro:
      "Lymphatic drainage massage uses gentle techniques to stimulate lymph flow, supporting immune function and reducing swelling. Find therapists trained in this specialized technique.",
  },
  {
    label: "Hot Stone Massage",
    query: "hot stone",
    intro:
      "Hot stone massage uses heated smooth stones placed on the body to promote deep relaxation and muscle tension relief. Find therapists trained in this soothing technique.",
  },
];

export default function ServicesPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-16 pt-16">
      <h1 className="font-display text-ds-40 font-bold tracking-tight text-text-primary">
        Massage Services &amp; Specialties
      </h1>
      <p className="mt-4 text-text-secondary">
        {
          "MasseurMatch therapists offer a wide range of massage specialties to meet different needs, from deep tissue work and sports recovery to relaxation and specialized techniques. Explore each service type below to find the right therapist for your wellness goals."
        }
      </p>

      <div className="mt-10 space-y-10">
        {SERVICES.map((service) => (
          <section key={service.label} className="space-y-3">
            <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
              {service.label}
            </h2>
            <p className="text-text-secondary">{service.intro}</p>
            <p className="text-text-secondary">
              <Link
                href={`/search?q=${encodeURIComponent(service.query)}`}
                className="font-medium text-brand-secondary underline underline-offset-2"
              >
                Browse {service.label} therapists
              </Link>
            </p>
          </section>
        ))}

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            {"Can't find your service?"}
          </h2>
          <p className="text-text-secondary">
            {
              "MasseurMatch is continuously expanding its service directory. If you're looking for a specific massage specialty not listed here:"
            }
          </p>
          <ol className="list-decimal space-y-2 pl-6">
            <li className="text-text-secondary">
              {"Use the search feature to find therapists by keywords."}
            </li>
            <li className="text-text-secondary">
              {"Browse your city directory to see what services are available locally."}
            </li>
            <li className="text-text-secondary">
              {"Contact a therapist directly — many offer services beyond what's listed."}
            </li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            How to choose a massage service
          </h2>
          <ul className="list-disc space-y-2 pl-6">
            <li className="text-text-secondary">
              <strong className="font-semibold text-text-primary">Assess your needs:</strong>{" "}
              {
                "Are you looking for relaxation, pain relief, recovery, or specific therapeutic benefits?"
              }
            </li>
            <li className="text-text-secondary">
              <strong className="font-semibold text-text-primary">Compare specialties:</strong>{" "}
              {
                "Different therapists may specialize in different techniques even within the same service type."
              }
            </li>
            <li className="text-text-secondary">
              <strong className="font-semibold text-text-primary">Review trust signals:</strong>{" "}
              {
                "Look at therapist experience, certifications, and client feedback on their profiles."
              }
            </li>
            <li className="text-text-secondary">
              <strong className="font-semibold text-text-primary">Consider session format:</strong>{" "}
              {
                "Choose incall (at the therapist's studio), outcall (at your location), or mobile sessions based on your convenience."
              }
            </li>
            <li className="text-text-secondary">
              <strong className="font-semibold text-text-primary">Communicate directly:</strong>{" "}
              {
                "Contact your chosen therapist to discuss your specific needs and any health considerations."
              }
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
            {" · "}
            <Link
              href="/search"
              className="font-medium text-brand-secondary underline underline-offset-2"
            >
              Search
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
