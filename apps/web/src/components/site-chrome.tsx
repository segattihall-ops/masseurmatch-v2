import Link from "next/link";

import { SITE_NAME } from "@/lib/site";

/** Primary navigation. Plain links — no client JS needed. */
const NAV = [
  { href: "/search", label: "Find a therapist" },
  { href: "/cities", label: "Cities" },
  { href: "/guides", label: "Guides" },
  { href: "/for-therapists", label: "For therapists" },
];

/**
 * Footer navigation.
 *
 * Grouped and fairly long on purpose. Roughly fifty pages were added for the
 * cutover — legal, policy, marketing, guides — and a footer that links four of
 * them leaves the rest reachable only by typing the URL. That is bad for a
 * reader looking for the refund policy, and bad for the pages themselves:
 * internal links are how a crawler finds and weights them, so an orphaned page
 * is close to an unpublished one.
 *
 * Not every page is here. The full policy index lives at /legal, which is
 * linked below; duplicating all 23 into the footer would bury the four or five
 * anyone actually looks for.
 */
const FOOTER_GROUPS: { heading: string; links: { href: string; label: string }[] }[] = [
  {
    heading: "Browse",
    links: [
      { href: "/search", label: "Find a therapist" },
      { href: "/therapists", label: "All therapists" },
      { href: "/cities", label: "Cities" },
      { href: "/states", label: "States" },
      { href: "/near-me", label: "Near me" },
    ],
  },
  {
    heading: "Learn",
    links: [
      { href: "/guides", label: "Guides" },
      { href: "/blog", label: "Blog" },
      { href: "/compare", label: "Compare" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    heading: "Therapists",
    links: [
      { href: "/for-therapists", label: "List your practice" },
      { href: "/pricing", label: "Pricing" },
      { href: "/verification", label: "Verification" },
      { href: "/advertise", label: "Advertise" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/safety", label: "Safety" },
      { href: "/trust", label: "Trust & safety" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/legal", label: "Legal centre" },
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
      { href: "/cookie-policy", label: "Cookies" },
      { href: "/moderation-policy", label: "Moderation policy" },
      { href: "/law-enforcement", label: "Law enforcement" },
      { href: "/report-block-safety", label: "Report a problem" },
    ],
  },
];

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-bg-surface">
      <nav
        aria-label="Primary"
        className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:gap-6 sm:px-6"
      >
        <Link
          href="/"
          className="shrink-0 font-display text-ds-18 font-bold tracking-tight text-text-primary"
        >
          {SITE_NAME}
        </Link>

        <ul className="hidden list-none items-center gap-6 p-0 text-sm sm:flex">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-text-secondary transition-colors hover:text-brand-secondary"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <ul className="flex list-none items-center gap-3 p-0 text-xs sm:hidden">
          <li>
            <Link
              href="/search"
              className="whitespace-nowrap font-medium text-text-secondary transition-colors hover:text-brand-secondary"
            >
              Find
            </Link>
          </li>
          <li>
            <Link
              href="/for-therapists"
              className="whitespace-nowrap font-medium text-brand-secondary transition-colors hover:text-action-primary-hover"
            >
              List
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-bg-subtle">
      <nav
        aria-label="Footer"
        className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-8 px-6 pt-12 sm:grid-cols-3 lg:grid-cols-5"
      >
        {FOOTER_GROUPS.map((group) => (
          <div key={group.heading}>
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-text-primary">
              {group.heading}
            </h2>
            <ul className="mt-3 list-none space-y-2 p-0 text-sm">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-secondary transition-colors hover:text-brand-secondary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mx-auto mt-10 flex w-full max-w-6xl flex-col gap-4 border-t border-border-subtle px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-secondary">
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </p>
        <ul className="flex list-none flex-wrap gap-5 p-0 text-sm">
          {FOOTER_GROUPS.flatMap((group) => group.links)
            .filter((link) => ["/terms", "/privacy", "/legal", "/contact"].includes(link.href))
            .map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-text-secondary transition-colors hover:text-brand-secondary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
        </ul>
      </div>
    </footer>
  );
}
