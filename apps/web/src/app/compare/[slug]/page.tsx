import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { competitorSlugs, getCompetitorBySlug, competitorsByTier } from "@/content/competitors";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

/**
 * A head-to-head comparison.
 *
 * Prerendered, with `dynamicParams = false` so an unknown competitor 404s
 * rather than rendering an empty shell at a URL search engines would then
 * index.
 */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return competitorSlugs.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const competitor = getCompetitorBySlug(params.slug);
  if (!competitor) return { title: "Comparison not found" };

  const path = `/compare/${competitor.slug}`;
  return {
    title: competitor.metaTitle,
    description: competitor.metaDescription,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      type: "article",
      url: absoluteUrl(path),
      siteName: SITE_NAME,
      title: competitor.metaTitle,
      description: competitor.metaDescription,
    },
  };
}

export default function ComparisonPage({ params }: { params: { slug: string } }) {
  const competitor = getCompetitorBySlug(params.slug);
  if (!competitor) notFound();

  const others = competitorsByTier.filter((c) => c.slug !== competitor.slug).slice(0, 3);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-16 pt-16">
      <nav aria-label="Breadcrumb" className="text-sm text-text-secondary">
        <Link href="/compare" className="hover:text-text-primary">
          Compare
        </Link>
      </nav>

      <header className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
          {competitor.category}
        </p>
        <h1 className="mt-2 font-display text-ds-40 font-bold tracking-tight text-text-primary">
          MasseurMatch vs {competitor.name}
        </h1>
        <p className="mt-4 leading-relaxed text-text-secondary">{competitor.heroSummary}</p>
      </header>

      <section className="mt-10 rounded-3xl border border-border-subtle p-6">
        <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
          Verdict
        </h2>
        <p className="mt-3 leading-relaxed text-text-secondary">{competitor.verdict}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">MasseurMatch is better for</h3>
            <p className="mt-1 text-sm leading-relaxed text-text-secondary">
              {competitor.bestForMasseurMatch}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">
              {competitor.name} is better for
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-text-secondary">
              {competitor.bestForCompetitor}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
          Feature by feature
        </h2>
        {/* Wide content scrolls inside its own container so the page body never
            scrolls horizontally on a phone. */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="py-2 pr-4 font-semibold text-text-primary">Feature</th>
                <th className="py-2 pr-4 font-semibold text-text-primary">MasseurMatch</th>
                <th className="py-2 font-semibold text-text-primary">{competitor.name}</th>
              </tr>
            </thead>
            <tbody>
              {competitor.featureRows.map((row) => (
                <tr key={row.feature} className="border-b border-border-subtle align-top">
                  <td className="py-3 pr-4 font-medium text-text-primary">{row.feature}</td>
                  <td className="py-3 pr-4 text-text-secondary">{row.masseurmatch}</td>
                  <td className="py-3 text-text-secondary">{row.competitor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10 grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="font-display text-ds-18 font-semibold tracking-tight text-text-primary">
            Why MasseurMatch
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            {competitor.whyMasseurMatch.map((item) => (
              <li key={item} className="text-sm leading-relaxed text-text-secondary">
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-ds-18 font-semibold tracking-tight text-text-primary">
            When {competitor.name} fits
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            {competitor.whenCompetitorFits.map((item) => (
              <li key={item} className="text-sm leading-relaxed text-text-secondary">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {competitor.faqs.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            Questions
          </h2>
          <dl className="mt-4 space-y-5">
            {competitor.faqs.map((faq) => (
              <div key={faq.question}>
                <dt className="font-semibold text-text-primary">{faq.question}</dt>
                <dd className="mt-1 leading-relaxed text-text-secondary">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <section className="mt-12 border-t border-border-subtle pt-8">
        <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
          {competitor.ctaTitle}
        </h2>
        <p className="mt-3 leading-relaxed text-text-secondary">{competitor.ctaBody}</p>
        <Link
          href="/search"
          className="mt-4 inline-block rounded-full bg-action-primary px-5 py-2.5 text-sm font-semibold text-text-inverse transition hover:bg-action-primary-hover"
        >
          Browse therapists
        </Link>
      </section>

      {others.length > 0 ? (
        <section className="mt-12 border-t border-border-subtle pt-6">
          <h2 className="font-display text-ds-18 font-semibold tracking-tight text-text-primary">
            Other comparisons
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {others.map((other) => (
              <li key={other.slug}>
                <Link
                  href={`/compare/${other.slug}`}
                  className="rounded-full border border-border-subtle px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:border-brand-secondary hover:text-text-primary"
                >
                  vs {other.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
