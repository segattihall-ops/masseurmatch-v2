import type { DirectoryFilters } from "@masseurmatch/db/actions/directory-config";

export type LegacyDirectoryDefinition = {
  slug: string;
  label: string;
  shortLabel: string;
  intro: string;
  filters: DirectoryFilters;
};

export const LEGACY_SEGMENTS: LegacyDirectoryDefinition[] = [
  {
    slug: "verified-profiles",
    label: "Verified male massage therapists",
    shortLabel: "Verified profiles",
    intro:
      "Browse public therapist profiles with visible verification signals, clear session formats and direct-contact options.",
    filters: { verified: true },
  },
  {
    slug: "male-therapists",
    label: "Male massage therapists",
    shortLabel: "Male therapists",
    intro:
      "Compare male massage therapist profiles by services, pricing, availability and trust signals, then contact providers directly.",
    filters: {},
  },
  {
    slug: "lgbtq-friendly",
    label: "LGBTQ+ affirming massage therapists",
    shortLabel: "LGBTQ+ affirming",
    intro:
      "Explore public profiles from therapists who identify their practice as LGBTQ+ affirming, with visible trust signals and direct contact.",
    filters: { lgbtq: true },
  },
  {
    slug: "sports-recovery",
    label: "Sports recovery massage",
    shortLabel: "Sports recovery",
    intro:
      "Find therapists who list sports, recovery or mobility-focused work and compare their profiles before contacting them directly.",
    filters: { query: "sports" },
  },
  {
    slug: "wellness",
    label: "Wellness massage therapists",
    shortLabel: "Wellness",
    intro:
      "Browse public massage therapist listings with clear services, pricing, location context and direct-contact options.",
    filters: {},
  },
];

export const LEGACY_KEYWORDS: LegacyDirectoryDefinition[] = [
  {
    slug: "deep-tissue",
    label: "Deep tissue massage",
    shortLabel: "Deep tissue",
    intro:
      "Compare therapists who list deep tissue techniques, pricing and session formats for focused muscle work and recovery.",
    filters: { query: "deep tissue" },
  },
  {
    slug: "swedish",
    label: "Swedish massage",
    shortLabel: "Swedish",
    intro:
      "Browse therapists who list Swedish massage and compare session formats, pricing and public trust signals.",
    filters: { query: "swedish" },
  },
  {
    slug: "sports-recovery",
    label: "Sports recovery massage",
    shortLabel: "Sports recovery",
    intro:
      "Find therapists who list sports, mobility or recovery-focused massage services in this city.",
    filters: { query: "sports" },
  },
  {
    slug: "thai",
    label: "Thai massage",
    shortLabel: "Thai",
    intro:
      "Find therapists who list Thai massage, assisted stretching or related mobility-focused techniques.",
    filters: { query: "thai" },
  },
  {
    slug: "mobile-massage",
    label: "Mobile massage",
    shortLabel: "Mobile massage",
    intro:
      "Explore therapists who offer outcall sessions and can travel to an agreed client location.",
    filters: { session: "outcall" },
  },
  {
    slug: "hotel-massage",
    label: "Hotel massage",
    shortLabel: "Hotel massage",
    intro:
      "Browse therapists who offer outcall service and contact them directly to confirm hotel availability, travel area and property requirements.",
    filters: { session: "outcall", query: "hotel" },
  },
  {
    slug: "outcall",
    label: "Outcall massage",
    shortLabel: "Outcall",
    intro:
      "Explore therapists who offer sessions at an agreed client location and compare their public pricing and profile details.",
    filters: { session: "outcall" },
  },
  {
    slug: "incall",
    label: "Incall massage",
    shortLabel: "Incall",
    intro:
      "Browse therapists who offer sessions at their own studio, office or treatment location.",
    filters: { session: "incall" },
  },
];

export function getLegacySegment(slug: string): LegacyDirectoryDefinition | null {
  return LEGACY_SEGMENTS.find((segment) => segment.slug === slug) ?? null;
}

export function getLegacyKeyword(slug: string): LegacyDirectoryDefinition | null {
  return LEGACY_KEYWORDS.find((keyword) => keyword.slug === slug) ?? null;
}

export function formatLegacyArea(slug: string): string | null {
  const clean = slug.trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(clean) || clean.length > 80) return null;
  return clean
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
