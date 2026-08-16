import type { Metadata } from "next";
import Link from "next/link";

import {
  competitorsByTier,
  COMPARISON_HUB_INTRO,
  getCompetitorTierLabel,
  type CompetitorTier,
} from "@/content/competitors";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Compare MasseurMatch";
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

const TIERS: CompetitorTier[] = [1, 2, 3];

export default function ComparePage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 pb-16 pt-16">
      <header>
        <h1 className="font-display text-ds-40 font-bold tracking-tight text-text-primary">
          {TITLE}
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-text-secondary">{COMPARISON_HUB_INTRO}</p>
      </header>

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
