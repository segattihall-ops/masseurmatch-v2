"use server";

import { createServiceClient } from "@masseurmatch/db/client";
import type { Json } from "@masseurmatch/db/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { recordAdminAudit } from "@/lib/admin-audit";
import { requireAdmin } from "@/lib/guards";

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(140)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must use lowercase words separated by hyphens.");

const blockSchema = z.object({
  type: z.string().trim().min(1).max(40),
  content: z.string().max(20_000).optional(),
  items: z.array(z.string().max(5_000)).max(100).optional(),
});

function field(formData: FormData, name: string, max: number): string {
  return String(formData.get(name) ?? "")
    .trim()
    .slice(0, max);
}

function parseContent(value: string): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error("Content must be valid JSON.");
  }
  const blocks = z.array(blockSchema).max(500).parse(parsed);
  return JSON.stringify(blocks);
}

function parsePublishedAt(value: string): string {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) throw new Error("Published date is invalid.");
  return date.toISOString();
}

function toNotice(kind: "saved" | "deleted", slug: string): never {
  redirect(`/blog?notice=${kind}&slug=${encodeURIComponent(slug)}`);
}

export async function saveBlogPost(formData: FormData): Promise<void> {
  const viewer = await requireAdmin("/blog");
  const id = field(formData, "id", 100);
  const slug = slugSchema.parse(field(formData, "slug", 140));
  const title = z
    .string()
    .min(2)
    .max(220)
    .parse(field(formData, "title", 220));
  const excerpt = z
    .string()
    .max(600)
    .parse(field(formData, "excerpt", 600));
  const seoDescription = z
    .string()
    .max(320)
    .parse(field(formData, "seo_description", 320));
  const content = parseContent(String(formData.get("content_json") ?? "[]"));
  const tags = field(formData, "tags", 1000)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 30);
  const publishedAt = parsePublishedAt(field(formData, "published_at", 60));
  const now = new Date().toISOString();

  await recordAdminAudit({
    adminId: viewer.user.id,
    action: id ? "blog_post.updated" : "blog_post.created",
    targetType: "blog_post",
    targetId: id || slug,
    reason: id ? "Admin updated a published blog post." : "Admin created a blog post.",
    details: { slug, title, published_at: publishedAt, tags } as Json,
  });

  const service = createServiceClient();
  if (id) {
    const { error } = await service
      .from("blog_posts")
      .update({
        slug,
        title,
        excerpt,
        seo_description: seoDescription,
        content,
        tags,
        published_at: publishedAt,
        updated_at: now,
      })
      .eq("id", id);
    if (error) throw new Error(`Could not update blog post: ${error.message}`);
  } else {
    const { error } = await service.from("blog_posts").insert({
      slug,
      title,
      excerpt,
      seo_description: seoDescription,
      content,
      body: null,
      tags,
      published_at: publishedAt,
      created_at: now,
      updated_at: now,
    });
    if (error) throw new Error(`Could not create blog post: ${error.message}`);
  }

  revalidatePath("/blog");
  toNotice("saved", slug);
}

export async function deleteBlogPost(formData: FormData): Promise<void> {
  const viewer = await requireAdmin("/blog");
  const id = field(formData, "id", 100);
  const confirmSlug = field(formData, "confirm_slug", 140);
  if (!id) throw new Error("Blog post id is required.");

  const service = createServiceClient();
  const { data: post, error: readError } = await service
    .from("blog_posts")
    .select("id,slug,title")
    .eq("id", id)
    .maybeSingle();
  if (readError) throw new Error(`Could not load blog post: ${readError.message}`);
  if (!post) throw new Error("Blog post not found.");
  if (confirmSlug !== post.slug) throw new Error("Type the exact slug to confirm deletion.");

  await recordAdminAudit({
    adminId: viewer.user.id,
    action: "blog_post.deleted",
    targetType: "blog_post",
    targetId: post.id,
    reason: "Admin permanently deleted a blog post.",
    details: { slug: post.slug, title: post.title },
  });

  const { error } = await service.from("blog_posts").delete().eq("id", id);
  if (error) throw new Error(`Could not delete blog post: ${error.message}`);

  revalidatePath("/blog");
  toNotice("deleted", post.slug);
}
