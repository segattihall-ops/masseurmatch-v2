import { getBlogPosts } from "@masseurmatch/db/actions/blog";
import type { Metadata } from "next";
import Link from "next/link";

import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Blog";
const DESCRIPTION =
  "Notes on finding a massage therapist, comparing profiles, and what a good directory listing should tell you.";
const PATH = "/blog";

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
 * Revalidated rather than static: posts are edited in the admin area, so a new
 * one should appear without a redeploy.
 */
export const revalidate = 600;

export default async function BlogIndexPage() {
  const posts = await getBlogPosts();

  return (
    <main className="mx-auto w-full max-w-4xl px-6 pb-16 pt-16">
      <header>
        <h1 className="font-display text-ds-40 font-bold tracking-tight text-text-primary">
          {TITLE}
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-text-secondary">{DESCRIPTION}</p>
      </header>

      {posts.length === 0 ? (
        <p className="mt-10 text-text-secondary">No posts yet.</p>
      ) : (
        <ul className="mt-10 space-y-4">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="block rounded-3xl border border-border-subtle p-6 transition hover:border-brand-secondary"
              >
                <h2 className="font-display text-ds-18 font-semibold tracking-tight text-text-primary">
                  {post.title}
                </h2>
                {(post.excerpt ?? post.seoDescription) ? (
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    {post.excerpt ?? post.seoDescription}
                  </p>
                ) : null}
                <p className="mt-3 text-xs text-text-secondary">
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
