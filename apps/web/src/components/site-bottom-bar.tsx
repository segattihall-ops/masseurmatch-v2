"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BOTTOM_NAV, type BottomIcon } from "./site-nav-data";

/**
 * The mobile bottom bar.
 *
 * Phones only — `sm:hidden`, the mirror of the pointer-width bar in the header.
 * The footer is unchanged and still carries the full site map; this is for the
 * five destinations somebody returns to, which on a page eleven thousand pixels
 * tall are otherwise a very long scroll away.
 *
 * `pb-[env(safe-area-inset-bottom)]` is what keeps the labels above the home
 * indicator on a notched phone. The matching padding on `<body>` is what stops
 * this bar covering the last of the footer.
 */
export function SiteBottomBar() {
  const pathname = usePathname();

  const isCurrent = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg-surface pb-[env(safe-area-inset-bottom)] sm:hidden"
    >
      <ul className="flex list-none items-stretch justify-around p-0">
        {BOTTOM_NAV.map((item) => {
          const current = isCurrent(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] leading-none transition-colors ${
                  current ? "text-brand-secondary" : "text-text-secondary"
                }`}
              >
                <Icon name={item.icon} />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Five glyphs, inline. See the note in `site-nav.tsx`. */
function Icon({ name }: { name: BottomIcon }) {
  const paths: Record<BottomIcon, React.ReactNode> = {
    home: <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />,
    search: (
      <>
        <circle cx="11" cy="11" r="6" />
        <path d="m20 20-3.5-3.5" />
      </>
    ),
    map: (
      <>
        <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    book: (
      <>
        <path d="M5 4.5h9a3 3 0 0 1 3 3V20a2.5 2.5 0 0 0-2.5-2.5H5z" />
        <path d="M5 4.5V20" />
      </>
    ),
    plus: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8.5v7M8.5 12h7" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {paths[name]}
    </svg>
  );
}
