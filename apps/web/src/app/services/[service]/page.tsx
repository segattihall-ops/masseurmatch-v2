import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StaggerItem, StaggerList } from "@masseurmatch/ui";
import { searchTherapists } from "@masseurmatch/db/actions/directory";

import { TherapistCard } from "@/components/therapist-card";
import { SERVICES, getServiceBySlug } from "@/content/services";
import { jsonLdScript } from "@/lib/jsonld";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import { withApprovedProfilePhotos } from "@/lib/therapist-photos";

export const revalidate = 3600;
export const dynamicParams = false;

interface ServicePageProps {
  params: { service: string };
}

export function generateStaticParams() {
  return SERVICES.map((service) => ({ service: service.slug }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const service = getServiceBySlug(params.service);
  if (!service) return {};

  const canonical = absoluteUrl(`/services/${service.slug}`);
  return {
    title: service.title,
    description: service.description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: SITE_NAME,
      title: service.title,
      description: service.description,
    },
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const service = getServiceBySlug(params.service);
  if (!service) notFound();

  const rawTherapists = await searchTherapists({ query: service.query });
  const therapists = (await withApprovedProfilePhotos(rawTherapists)).slice(0, 12);
  const related = SERVICES.filter((entry) => entry.slug !== service.slug).slice(0, 6);

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: service.title,
    description: service.description,
    url: absoluteUrl(`/services/${service.slug}`),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: therapists.length,
      itemListElement: therapists.map((therapist, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: therapist.display_name ?? therapist.full_name ?? therapist.slug,
      })),
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: service.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(faqJsonLd) }}
      />

      <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-16">
        <nav aria-label="Breadcrumb" className="text-sm text-text-secondary">
          <Link href="/services" className="hover:text-brand-secondary">
            Massage services
          </Link>
        </nav>

        <header className="mt-6 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">
            Service directory
          </p>
          <h1 className="mt-4 font-display text-ds-40 font-bold tracking-tight text-text-primary">
            {service.title}
          </h1>
          <p className="mt-4 text-ds-18 leading-8 text-text-secondary">{service.intro}</p>
        </header>

        <section className="mt-12" aria-labelledby="service-providers">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2
                id="service-providers"
                className="font-display text-ds-24 font-bold tracking-tight text-text-primary"
              >
                Therapists listing {service.label}
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                {therapists.length > 0
                  ? `${therapists.length} matching public ${therapists.length === 1 ? "profile" : "profiles"}`
                  : "No matching public profiles are listed right now."}
              </p>
            </div>
            <Link
              href={`/search?q=${encodeURIComponent(service.query)}`}
              className="text-sm font-semibold text-brand-secondary underline underline-offset-4"
            >
              Refine this search
            </Link>
          </div>

          {therapists.length > 0 ? (
            <StaggerList
              as="ul"
              className="mt-6 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3"
            >
              {therapists.map((therapist) => (
                <StaggerItem as="li" key={therapist.id}>
                  <TherapistCard therapist={therapist} headingLevel={3} />
                </StaggerItem>
              ))}
            </StaggerList>
          ) : (
            <p className="mt-6 rounded-2xl border border-border bg-bg-subtle p-6 text-text-secondary">
              Browse the full directory or search nearby cities while MasseurMatch expands this
              specialty.
            </p>
          )}
        </section>

        <section className="mt-14 max-w-3xl" aria-labelledby="service-faq">
          <h2
            id="service-faq"
            className="font-display text-ds-24 font-bold tracking-tight text-text-primary"
          >
            About {service.label}
          </h2>
          <div className="mt-6 space-y-6">
            {service.faqs.map((faq) => (
              <article key={faq.question}>
                <h3 className="font-display text-ds-18 font-semibold text-text-primary">
                  {faq.question}
                </h3>
                <p className="mt-2 leading-7 text-text-secondary">{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14" aria-labelledby="related-services">
          <h2
            id="related-services"
            className="font-display text-ds-24 font-bold tracking-tight text-text-primary"
          >
            Other massage services
          </h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {related.map((entry) => (
              <Link
                key={entry.slug}
                href={`/services/${entry.slug}`}
                className="rounded-full border border-border px-4 py-2 text-sm font-medium text-text-primary transition hover:border-brand-secondary/40 hover:text-brand-secondary"
              >
                {entry.label}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
