import "server-only";

import { createServiceClient } from "@masseurmatch/db/client";

export type AdminBlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  seoDescription: string;
  content: string;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
};

export async function listAdminBlogPosts(): Promise<AdminBlogPost[]> {
  const { data, error } = await createServiceClient()
    .from("blog_posts")
    .select("id,slug,title,excerpt,seo_description,content,body,tags,published_at,updated_at")
    .order("published_at", { ascending: false });

  if (error) throw new Error(`Could not load blog posts: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    seoDescription: row.seo_description,
    content: row.content || row.body || "[]",
    tags: row.tags ?? [],
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
  }));
}
