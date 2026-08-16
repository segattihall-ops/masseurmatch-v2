import { getProfileBySlug } from "@masseurmatch/db/actions/directory";
import { profilePath } from "@masseurmatch/db/actions/directory-config";
import { notFound, permanentRedirect } from "next/navigation";

/**
 * `/therapists/{slug}` — the old site's profile URL.
 *
 * Six of these are in the live sitemap and carry the site's search equity, so
 * they must not 404 on cutover. They resolve by the same `profiles.slug` column
 * v2 uses, which is why this is a database lookup rather than a hand-written
 * redirect table: profiles added after the migration are covered automatically,
 * and a hand-maintained list would silently stop covering them.
 *
 * 308 rather than 302 — `permanentRedirect` — because the move is permanent and
 * we want search engines to transfer the ranking rather than keep indexing the
 * old URL.
 *
 * An unknown slug 404s rather than redirecting to the directory. A soft 404
 * (redirecting a dead URL to a live page) tells a crawler the page moved when
 * it did not, and leaves the dead URL in the index.
 */
export default async function LegacyProfileRedirect({ params }: { params: { slug: string } }) {
  const profile = await getProfileBySlug(params.slug);
  if (!profile) notFound();

  const target = profilePath(profile);
  if (!target) notFound();

  permanentRedirect(target);
}
