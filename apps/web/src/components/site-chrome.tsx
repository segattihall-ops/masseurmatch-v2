import Link from "next/link";

import { SITE_NAME, signUpUrl } from "@/lib/site";

import { SiteNav } from "./site-nav";

const FAVICON_URL =
  "https://res.cloudinary.com/dyfxkq2nk/image/upload/v1786915969/76C34E06-039E-431B-9F83-A4231D78372C_qczweo.png";
const WORDMARK_URL =
  "https://res.cloudinary.com/dyfxkq2nk/image/upload/v1787427953/ChatGPT_Image_Aug_22_2026_02_45_23_PM_kc5env.png";

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
    <header className="sticky top-0 z-50 border-b border-border bg-bg-surface">
      <nav
        aria-label="Primary"
        className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-3 px-5 py-2 sm:gap-5 sm:px-6"
      >
        <Link
          href="/"
          aria-label={`${SITE_NAME} home`}
          className="flex min-w-0 shrink-0 items-center gap-2.5"
        >
          <img
            src={FAVICON_URL}
            alt=""
            aria-hidden="true"
            width={40}
            height={40}
            className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10"
          />
          <img
            src={WORDMARK_URL}
            alt={SITE_NAME}
            width={240}
            height={68}
            className="h-auto w-[150px] object-contain sm:w-[190px] lg:w-[210px]"
          />
        </Link>

        <SiteNav signUpHref={signUpUrl()} />
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
