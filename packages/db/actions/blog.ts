import "server-only";

import { unstable_cache } from "next/cache";

import { createAnonClient, hasSupabaseCredentials } from "../client";

/**
 * Blog posts.
 *
 * These live in the database rather than in a file, because the four indexed
 * posts were already there and are edited through the admin area. The old
 * repository also carried two *static* post lists (`blog/posts.ts` and
 * `_lib/blog-data.ts`) whose slugs match nothing in the live sitemap — they
 * were never published. Reading the database is the only version that agrees
 * with what is actually indexed.
 *
 * `blog_posts` carries `blog_posts_public_read USING (true)` and a SELECT grant
 * to `anon`, so the ordinary anon client is enough; no service role, and RLS
 * still applies.
 */

/** One block of post content. `content` is a JSON array of these, stored as text. */
export type BlogBlock = {
  type: string;
  content?: string;
  items?: string[];
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string | null;
  seoDescription: string | null;
  publishedAt: string;
  tags: string[];
  blocks: BlogBlock[];
};

type Row = {
  slug: string;
  title: string;
  excerpt: string | null;
  seo_description: string | null;
  published_at: string;
  tags: string[] | null;
  content: string | null;
  body: string | null;
};

/**
 * Parse the stored content into blocks.
 *
 * The column is `text` holding JSON, not `jsonb`, so it can hold anything. A
 * post whose content will not parse renders as a single paragraph of whatever
 * was in there rather than throwing — a malformed row should degrade to
 * readable text, not take the whole blog down.
 */
function toBlocks(row: Row): BlogBlock[] {
  const raw = row.content ?? row.body ?? "";
  if (!raw.trim()) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (block): block is BlogBlock =>
          typeof block === "object" && block !== null && "type" in block,
      );
    }
  } catch {
    // Not JSON — fall through.
  }

  return [{ type: "paragraph", content: raw }];
}

function toPost(row: Row): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    seoDescription: row.seo_description,
    publishedAt: row.published_at,
    tags: row.tags ?? [],
    blocks: toBlocks(row),
  };
}

const COLUMNS = "slug,title,excerpt,seo_description,published_at,tags,content,body";

/**
 * Every published post, newest first.
 *
 * Cached and tagged so a post edited in the admin area appears without a
 * redeploy, while a burst of traffic does not become a burst of queries.
 */
export const getBlogPosts = unstable_cache(
  async (): Promise<BlogPost[]> => {
    // Same contract as the directory: with no credentials the blog renders
    // empty rather than failing the build. CI and a fresh clone have none, and
    // `generateStaticParams` runs at build time.
    if (!hasSupabaseCredentials()) return [];

    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select(COLUMNS)
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false });

    if (error) throw new Error(`Could not load blog posts: ${error.message}`);
    return ((data ?? []) as unknown as Row[]).map(toPost);
  },
  ["blog", "posts"],
  { revalidate: 600, tags: ["blog"] },
);

/** One post by slug, or null. */
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const posts = await getBlogPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}
