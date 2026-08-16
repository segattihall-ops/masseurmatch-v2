import { getBlogPost, getBlogPosts, type BlogBlock } from "@masseurmatch/db/actions/blog";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { absoluteUrl, SITE_NAME } from "@/lib/site";

export const revalidate = 600;

/**
 * Prerender the posts that exist at build time, but keep `dynamicParams` on
 * (the default) so a post published afterwards renders on first request rather
 * than 404ing until the next deploy. Unlike guides and comparisons, this
 * content is edited outside the repository.
 */
export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getBlogPost(params.slug);
  if (!post) return { title: "Post not found" };

  const path = `/blog/${post.slug}`;
  const description = post.seoDescription ?? post.excerpt ?? undefined;

  return {
    title: post.title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      type: "article",
      url: absoluteUrl(path),
      siteName: SITE_NAME,
      title: post.title,
      description,
      publishedTime: post.publishedAt,
    },
  };
}

/**
 * Render one content block.
 *
 * The block `type` comes from the database and is not a closed set, so an
 * unrecognised type falls back to a paragraph rather than rendering nothing.
 * Dropping unknown blocks silently would lose paragraphs from a published post
 * with no sign anything was missing.
 */
function Block({ block }: { block: BlogBlock }) {
  const text = block.content ?? "";

  if (block.type === "h2") {
    return (
      <h2 className="mt-10 font-display text-ds-24 font-bold tracking-tight text-text-primary">
        {text}
      </h2>
    );
  }
  if (block.type === "h3" || block.type === "heading") {
    return (
      <h3 className="mt-8 font-display text-ds-18 font-semibold tracking-tight text-text-primary">
        {text}
      </h3>
    );
  }
  if (block.type === "list" && block.items) {
    return (
      <ul className="mt-4 list-disc space-y-2 pl-6">
        {block.items.map((item) => (
          <li key={item} className="leading-relaxed text-text-secondary">
            {item}
          </li>
        ))}
      </ul>
    );
  }
  if (!text.trim()) return null;

  return <p className="mt-4 leading-relaxed text-text-secondary">{text}</p>;
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);
  if (!post) notFound();

  const published = new Date(post.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-16 pt-16">
      <nav aria-label="Breadcrumb" className="text-sm text-text-secondary">
        <Link href="/blog" className="hover:text-text-primary">
          Blog
        </Link>
      </nav>

      <header className="mt-4 border-b border-border-subtle pb-6">
        <h1 className="font-display text-ds-40 font-bold tracking-tight text-text-primary">
          {post.title}
        </h1>
        <p className="mt-3 text-sm text-text-secondary">{published}</p>
      </header>

      <article>
        {post.blocks.map((block, index) => (
          <Block key={`${block.type}-${index}`} block={block} />
        ))}
      </article>
    </main>
  );
}
