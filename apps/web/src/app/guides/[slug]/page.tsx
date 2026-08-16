import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GUIDES } from "@/content/guides";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

/**
 * A guide article.
 *
 * `generateStaticParams` prerenders all thirteen, and `dynamicParams = false`
 * makes an unknown slug a 404 rather than an on-demand render of nothing. That
 * matters for SEO: these URLs are indexed, and a soft 404 on a typo'd variant
 * would keep the bad URL alive in the index.
 */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

function guideFor(slug: string) {
  return GUIDES.find((guide) => guide.slug === slug);
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const guide = guideFor(params.slug);
  if (!guide) return { title: "Guide not found" };

  const path = `/guides/${guide.slug}`;
  return {
    title: guide.h1,
    description: guide.description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      type: "article",
      url: absoluteUrl(path),
      siteName: SITE_NAME,
      title: guide.h1,
      description: guide.description,
      publishedTime: guide.publishedAt,
    },
  };
}

/** Links the guide points at, kept only if this site actually serves them. */
function usableLinks(links: string[]): string[] {
  // The old site had city URLs this one does not build — `/dallas`,
  // `/dallas/wellness/incall` and similar. Rendering them would put known-dead
  // links in indexed pages, which is worse than rendering no links at all.
  return links.filter((href) => href === "/safety" || href === "/compare" || href === "/search");
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const guide = guideFor(params.slug);
  if (!guide) notFound();

  const related = usableLinks(guide.relatedLinks);
  const published = new Date(guide.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-16 pt-16">
      <nav aria-label="Breadcrumb" className="text-sm text-text-secondary">
        <Link href="/guides" className="hover:text-text-primary">
          Guides
        </Link>
      </nav>

      <header className="mt-4 border-b border-border-subtle pb-6">
        <h1 className="font-display text-ds-40 font-bold tracking-tight text-text-primary">
          {guide.h1}
        </h1>
        <p className="mt-3 text-sm text-text-secondary">
          {published} · {guide.readMinutes} min read
        </p>
      </header>

      <article className="mt-8 space-y-5">
        {guide.body.map((paragraph) => (
          <p key={paragraph.slice(0, 48)} className="leading-relaxed text-text-secondary">
            {paragraph}
          </p>
        ))}
      </article>

      {related.length > 0 ? (
        <section className="mt-12 border-t border-border-subtle pt-6">
          <h2 className="font-display text-ds-18 font-semibold tracking-tight text-text-primary">
            Related
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {related.map((href) => (
              <li key={href}>
                <Link
                  href={href}
                  className="rounded-full border border-border-subtle px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:border-brand-secondary hover:text-text-primary"
                >
                  {href.replace("/", "")}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
