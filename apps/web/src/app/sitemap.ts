import type { MetadataRoute } from "next";
import { getBlogPosts } from "@masseurmatch/db/actions/blog";
import { getCities, getVisibleTherapists } from "@masseurmatch/db/actions/directory";
import { cityPath, profilePath } from "@masseurmatch/db/actions/directory-config";

import { competitorSlugs } from "@/content/competitors";
import { GUIDES } from "@/content/guides";
import { SERVICES } from "@/content/services";
import { absoluteUrl } from "@/lib/site";

/**
 * Static routes, grouped by how often they change.
 *
 * Kept as data rather than spelled out below, because the list is now long
 * enough that a page added without a sitemap entry would not be noticed. A test
 * asserts every one of these resolves.
 */
const HUBS = ["/", "/search", "/therapists", "/cities", "/states", "/guides", "/compare", "/blog"];

const MARKETING = [
  "/about",
  "/faq",
  "/how-it-works",
  "/for-therapists",
  "/pricing",
  "/near-me",
  "/advertise",
  "/contact",
  "/how-ranking-works",
  "/services",
];

const LEGAL = [
  "/legal",
  "/terms",
  "/privacy",
  "/client-terms",
  "/provider-terms",
  "/advertising-terms",
  "/subscriptions",
  "/refund-policy",
  "/acceptable-use",
  "/prohibited-conduct",
  "/community-guidelines",
  "/content-guidelines",
  "/photo-profile-policy",
  "/cookie-policy",
  "/data-deletion",
  "/email-opt-out",
  "/sms-terms",
  "/safety",
  "/report-block-safety",
  "/trust",
  "/dmca",
  "/platform-disclaimer",
  "/ai-disclosure",
  "/badge-disclaimer",
  "/verification",
  "/accessibility",
  "/moderation-policy",
  "/law-enforcement",
  "/therapist-agreement",
];

/**
 * Sitemap, generated from the database.
 *
 * Lists every city and every publicly visible profile. It reads through the
 * anon client, so the sitemap can only ever contain URLs a logged-out visitor
 * could reach — a suspended or unapproved profile cannot leak in here.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cities, therapists, posts] = await Promise.all([
    getCities(),
    getVisibleTherapists(),
    getBlogPosts(),
  ]);
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    ...HUBS.map((path) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: path === "/" ? 1 : 0.7,
    })),
    ...MARKETING.map((path) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...LEGAL.map((path) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
    ...SERVICES.map((service) => ({
      url: absoluteUrl(`/services/${service.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...GUIDES.map((guide) => ({
      url: absoluteUrl(`/guides/${guide.slug}`),
      lastModified: new Date(guide.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...competitorSlugs.map((slug) => ({
      url: absoluteUrl(`/compare/${slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: new Date(post.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
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
