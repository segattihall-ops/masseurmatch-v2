import Link from "next/link";

import { SITE_NAME } from "@/lib/site";

/** Primary navigation. Plain links — no client JS needed. */
const NAV = [
  { href: "/search", label: "Find a therapist" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
];

const FOOTER = [
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-bg-surface">
      <nav
        aria-label="Primary"
        className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4"
      >
        <Link
          href="/"
          className="font-display text-ds-18 font-bold tracking-tight text-text-primary"
        >
          {SITE_NAME}
        </Link>

        <ul className="flex list-none items-center gap-6 p-0 text-sm">
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
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-bg-subtle">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-secondary">
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </p>
        <ul className="flex list-none flex-wrap gap-5 p-0 text-sm">
          {FOOTER.map((item) => (
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
