import { Card } from "@masseurmatch/ui";
import type { Metadata } from "next";

import { listAdminBlogPosts } from "@/lib/admin-blog";
import { requireAdmin } from "@/lib/guards";

import { deleteBlogPost, saveBlogPost } from "./actions";

export const metadata: Metadata = {
  title: "Blog CMS",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function localInput(value: string): string {
  const date = new Date(value);
  const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return shifted.toISOString().slice(0, 16);
}

function prettyJson(value: string): string {
  try {
    return JSON.stringify(JSON.parse(value) as unknown, null, 2);
  } catch {
    return JSON.stringify([{ type: "paragraph", content: value }], null, 2);
  }
}

export default async function BlogCmsPage({
  searchParams,
}: {
  searchParams: { notice?: string; slug?: string };
}) {
  await requireAdmin("/blog");
  const posts = await listAdminBlogPosts();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-wine">Content</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">Blog CMS</h1>
          <p className="mt-2 max-w-3xl text-sm text-ink/60">
            These records are the exact <code>blog_posts</code> rows read by the public blog. No
            duplicate static post list is maintained.
          </p>
        </div>
        <a
          href="https://www.masseurmatch.com/blog"
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-wine/20 px-3 py-2 text-sm font-medium text-wine hover:bg-wineSoft/30"
        >
          Open public blog ↗
        </a>
      </header>

      {searchParams.notice ? (
        <p className="mt-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">
          {searchParams.notice === "deleted"
            ? `Deleted ${searchParams.slug ?? "blog post"}.`
            : `Saved ${searchParams.slug ?? "blog post"}. Public blog cache refreshes automatically.`}
        </p>
      ) : null}

      <Card className="mt-8 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-ink">Create post</h2>
        <p className="mt-1 text-sm text-ink/55">
          Content is stored as the same JSON block array rendered by the public article page.
        </p>
        <BlogForm
          action={saveBlogPost}
          submitLabel="Create post"
          defaults={{
            slug: "",
            title: "",
            excerpt: "",
            seoDescription: "",
            content: "[\n  {\n    \"type\": \"paragraph\",\n    \"content\": \"Write the opening paragraph here.\"\n  }\n]",
            tags: "",
            publishedAt: localInput(new Date().toISOString()),
          }}
        />
      </Card>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-ink">Published records</h2>
            <p className="mt-1 text-sm text-ink/55">{posts.length} database posts.</p>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {posts.length === 0 ? (
            <Card className="p-8 text-center text-sm text-ink/55">No blog posts in the database.</Card>
          ) : (
            posts.map((post) => (
              <details key={post.id} className="rounded-2xl border border-ink/10 bg-white shadow-sm">
                <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <p className="font-semibold text-ink">{post.title}</p>
                    <p className="mt-1 text-xs text-ink/50">
                      /blog/{post.slug} · {new Date(post.publishedAt).toLocaleString()}
                    </p>
                  </div>
                  <a
                    href={`https://www.masseurmatch.com/blog/${post.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    className="text-xs font-semibold text-wine hover:underline"
                  >
                    View live ↗
                  </a>
                </summary>
                <div className="border-t border-ink/10 p-5 sm:p-6">
                  <BlogForm
                    action={saveBlogPost}
                    submitLabel="Save changes"
                    id={post.id}
                    defaults={{
                      slug: post.slug,
                      title: post.title,
                      excerpt: post.excerpt,
                      seoDescription: post.seoDescription,
                      content: prettyJson(post.content),
                      tags: post.tags.join(", "),
                      publishedAt: localInput(post.publishedAt),
                    }}
                  />

                  <form action={deleteBlogPost} className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4">
                    <input type="hidden" name="id" value={post.id} />
                    <p className="text-sm font-semibold text-red-900">Permanent deletion</p>
                    <p className="mt-1 text-xs text-red-800">
                      Type <code>{post.slug}</code> exactly. The action is audited and cannot be undone.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <input
                        name="confirm_slug"
                        required
                        autoComplete="off"
                        className="input max-w-sm border-red-200"
                        placeholder={post.slug}
                      />
                      <button
                        type="submit"
                        className="min-h-11 rounded-lg bg-red-700 px-4 text-sm font-medium text-white"
                      >
                        Delete post
                      </button>
                    </div>
                  </form>
                </div>
              </details>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

function BlogForm({
  action,
  submitLabel,
  id,
  defaults,
}: {
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  id?: string;
  defaults: {
    slug: string;
    title: string;
    excerpt: string;
    seoDescription: string;
    content: string;
    tags: string;
    publishedAt: string;
  };
}) {
  return (
    <form action={action} className="mt-5 grid gap-4 sm:grid-cols-2">
      {id ? <input type="hidden" name="id" value={id} /> : null}
      <Field label="Slug">
        <input name="slug" required defaultValue={defaults.slug} className="input" placeholder="how-to-choose-a-massage-therapist" />
      </Field>
      <Field label="Publish date">
        <input name="published_at" type="datetime-local" required defaultValue={defaults.publishedAt} className="input" />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Title">
          <input name="title" required maxLength={220} defaultValue={defaults.title} className="input" />
        </Field>
      </div>
      <Field label="Excerpt">
        <textarea name="excerpt" maxLength={600} defaultValue={defaults.excerpt} rows={4} className="input min-h-28" />
      </Field>
      <Field label="SEO description">
        <textarea name="seo_description" maxLength={320} defaultValue={defaults.seoDescription} rows={4} className="input min-h-28" />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Tags (comma separated)">
          <input name="tags" defaultValue={defaults.tags} className="input" placeholder="safety, massage, directory" />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Content blocks (JSON)">
          <textarea
            name="content_json"
            required
            defaultValue={defaults.content}
            rows={18}
            spellCheck={false}
            className="input min-h-[28rem] font-mono text-xs"
          />
        </Field>
        <p className="mt-2 text-xs text-ink/45">
          Supported public block types include <code>paragraph</code>, <code>h2</code>, <code>h3</code> and <code>list</code> with an <code>items</code> array.
        </p>
      </div>
      <div className="sm:col-span-2 border-t border-ink/10 pt-4">
        <button type="submit" className="min-h-11 rounded-lg bg-wine px-4 text-sm font-medium text-white">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-ink/60">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
