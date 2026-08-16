import type { Metadata } from "next";
import Link from "next/link";

import { GUIDES } from "@/content/guides";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Massage Guides";
const DESCRIPTION =
  "Practical guides to choosing a male massage therapist — incall versus outcall, modality differences, and what to check city by city.";
const PATH = "/guides";

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

/**
 * The guides index.
 *
 * Static: the articles live in `content/guides.ts`, so this and every
 * `/guides/[slug]` prerender at build time. There is nothing per-request about
 * an article, and making it dynamic would spend a database round trip on
 * content that cannot change between deploys.
 */
export const dynamic = "force-static";

function sortedGuides() {
  // Newest first. The array is authored in whatever order guides were written,
  // which is not the order a reader wants them in.
  return [...GUIDES].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export default function GuidesPage() {
  const guides = sortedGuides();

  return (
    <main className="mx-auto w-full max-w-4xl px-6 pb-16 pt-16">
      <header>
        <h1 className="font-display text-ds-40 font-bold tracking-tight text-text-primary">
          {TITLE}
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-text-secondary">{DESCRIPTION}</p>
      </header>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {guides.map((guide) => (
          <li key={guide.slug}>
            <Link
              href={`/guides/${guide.slug}`}
              className="flex h-full flex-col rounded-3xl border border-border-subtle p-6 transition hover:border-brand-secondary"
            >
              <h2 className="font-display text-ds-18 font-semibold tracking-tight text-text-primary">
                {guide.h1}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-text-secondary">
                {guide.description}
              </p>
              <p className="mt-4 text-xs text-text-muted">{guide.readMinutes} min read</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
