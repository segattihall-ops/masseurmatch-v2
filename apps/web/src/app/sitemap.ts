import type { MetadataRoute } from "next";
import { getCities, getVisibleTherapists } from "@masseurmatch/db/actions/directory";
import { cityPath, profilePath } from "@masseurmatch/db/actions/directory-config";

import { absoluteUrl } from "@/lib/site";

/**
 * Sitemap, generated from the database.
 *
 * Lists every city and every publicly visible profile. It reads through the
 * anon client, so the sitemap can only ever contain URLs a logged-out visitor
 * could reach — a suspended or unapproved profile cannot leak in here.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cities, therapists] = await Promise.all([getCities(), getVisibleTherapists()]);
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/faq"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/terms"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/privacy"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const cityRoutes: MetadataRoute.Sitemap = cities.map((city) => ({
    url: absoluteUrl(cityPath(city)),
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const profileRoutes: MetadataRoute.Sitemap = therapists.flatMap((therapist) => {
    const path = profilePath(therapist);
    if (!path) return [];
    return [
      {
        url: absoluteUrl(path),
        // Real per-profile lastmod, so crawlers only re-fetch what changed.
        lastModified: therapist.updated_at ? new Date(therapist.updated_at) : now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      },
    ];
  });

  return [...staticRoutes, ...cityRoutes, ...profileRoutes];
}
