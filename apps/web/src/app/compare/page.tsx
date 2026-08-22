import type { Metadata } from "next";
import Link from "next/link";

import {
  competitorsByTier,
  COMPARISON_HUB_INTRO,
  getCompetitorTierLabel,
  type CompetitorTier,
} from "@/content/competitors";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Compare MasseurMatch with other massage directories";
const PATH = "/compare";

export const metadata: Metadata = {
  title: TITLE,
  description: COMPARISON_HUB_INTRO,
  alternates: { canonical: absoluteUrl(PATH) },
  openGraph: {
    type: "website",
    url: absoluteUrl(PATH),
    siteName: SITE_NAME,
    title: TITLE,
    description: COMPARISON_HUB_INTRO,
  },
};

export const dynamic = "force-static";

const PRIMARY_NAMES = new Set(["MasseurFinder", "RentMasseur"]);
const primaryComparisons = competitorsByTier.filter((competitor) =>
  PRIMARY_NAMES.has(competitor.name),
);
const TIERS: CompetitorTier[] = [2, 3];

export default function ComparePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-16 pt-16">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-secondary">
          Directory comparisons
        </p>
        <h1 className="mt-3 max-w-4xl font-display text-ds-40 font-bold tracking-tight text-text-primary">
          {TITLE}
        </h1>
        <p className="mt-4 max-w-3xl leading-relaxed text-text-secondary">{COMPARISON_HUB_INTRO}</p>
      </header>

      <section className="mt-10 rounded-3xl border border-brand-secondary/20 bg-brand-soft p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">
          Most compared
        </p>
        <h2 className="mt-2 font-display text-ds-24 font-bold tracking-tight text-text-primary">
          Start with the two major alternatives
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {primaryComparisons.map((competitor) => (
            <Link
              key={competitor.slug}
              href={`/compare/${competitor.slug}`}
              className="rounded-3xl border border-border bg-bg-surface p-6 shadow-ds-sm transition hover:-translate-y-0.5 hover:border-brand-secondary/40 hover:shadow-ds-md"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">
                MasseurMatch vs
              </p>
              <h3 className="mt-2 font-display text-2xl font-bold text-text-primary">
                {competitor.name}
              </h3>
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                {competitor.hubDescription}
              </p>
              <span className="mt-5 inline-flex text-sm font-semibold text-brand-secondary">
                Open comparison →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {TIERS.map((tier) => {
        const group = competitorsByTier.filter((competitor) => competitor.tier === tier);
        if (group.length === 0) return null;

        return (
          <section key={tier} className="mt-12">
            <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
              {getCompetitorTierLabel(tier)}
            </h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {group.map((competitor) => (
                <li key={competitor.slug}>
                  <Link
                    href={`/compare/${competitor.slug}`}
                    className="flex h-full flex-col rounded-3xl border border-border-subtle p-6 transition hover:border-brand-secondary"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
                      {competitor.category}
                    </p>
                    <h3 className="mt-2 font-display text-ds-18 font-semibold tracking-tight text-text-primary">
                      MasseurMatch vs {competitor.name}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-text-secondary">
                      {competitor.hubDescription}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </main>
  );
}
