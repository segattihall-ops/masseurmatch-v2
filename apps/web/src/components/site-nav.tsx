"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { PRIMARY_NAV } from "./site-nav-data";

/**
 * The site's primary navigation.
 *
 * ---------------------------------------------------------------------------
 * What this replaces
 * ---------------------------------------------------------------------------
 * A row of four links behind `hidden sm:flex`, and on anything narrower two
 * words — "Find" and "List". There was no menu button, so on a phone four of
 * the six destinations in the bar were unreachable from the bar, and the other
 * forty-odd pages were reachable only by scrolling to the footer.
 *
 * ---------------------------------------------------------------------------
 * Why the group label is a link and the arrow is a button
 * ---------------------------------------------------------------------------
 * Splitting them is what lets "Find a therapist" go somewhere on click while
 * the submenu still opens on keyboard. Making the whole thing a button loses
 * the destination; making it a link and opening on hover alone loses keyboard
 * users. Hover opens it for pointers, the arrow opens it for everyone else.
 */
export function SiteNav({ signUpHref }: { signUpHref: string | null }) {
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const bar = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLDivElement>(null);

  const closeAll = useCallback(() => {
    setOpenGroup(null);
    setDrawerOpen(false);
  }, []);

  // Navigating closes whatever is open. Without this the panel sits over the
  // page it just navigated to, which reads as a broken link.
  useEffect(() => {
    closeAll();
  }, [pathname, closeAll]);

  useEffect(() => {
    if (!openGroup && !drawerOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      if (drawerOpen) menuButton.current?.focus();
      closeAll();
    };

    // A click anywhere else dismisses the dropdown — the behaviour every menu
    // has, and the one people try first when they opened the wrong one.
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (bar.current?.contains(target) || drawer.current?.contains(target)) return;
      closeAll();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [openGroup, drawerOpen, closeAll]);

  // The page behind an open drawer must not scroll under it.
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawer.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  const isCurrent = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* ---------------------------------------------------------------- */}
      {/* Pointer-width bar                                                 */}
      {/* ---------------------------------------------------------------- */}
      <div ref={bar} className="hidden lg:block">
        <ul className="flex list-none items-center gap-1 p-0 text-sm">
          {PRIMARY_NAV.map((group) => {
            const open = openGroup === group.label;
            const panelId = `nav-${group.href.replace(/\W+/g, "-")}`;

            return (
              <li
                key={group.label}
                className="relative"
                onMouseEnter={() => setOpenGroup(group.label)}
                onMouseLeave={() =>
                  setOpenGroup((current) => (current === group.label ? null : current))
                }
              >
                <span className="flex items-center rounded-md">
                  <Link
                    href={group.href}
                    aria-current={isCurrent(group.href) ? "page" : undefined}
                    className={`rounded-md py-2 pl-3 pr-1 transition-colors ${
                      isCurrent(group.href)
                        ? "text-brand-secondary"
                        : "text-text-secondary hover:text-brand-secondary"
                    }`}
                  >
                    {group.label}
                  </Link>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenGroup(open ? null : group.label)}
                    className="rounded-md py-2 pl-1 pr-2 text-text-secondary transition-colors hover:text-brand-secondary"
                  >
                    <Chevron className={open ? "rotate-180" : ""} />
                    <span className="sr-only">
                      {open ? `Hide ${group.label} menu` : `Show ${group.label} menu`}
                    </span>
                  </button>
                </span>

                {open ? (
                  <ul
                    id={panelId}
                    className="absolute left-0 top-full z-50 mt-1 min-w-56 list-none rounded-xl border border-border bg-bg-surface p-2 shadow-brand"
                  >
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          aria-current={isCurrent(link.href) ? "page" : undefined}
                          className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                            isCurrent(link.href)
                              ? "bg-bg-subtle text-text-primary"
                              : "text-text-secondary hover:bg-bg-subtle hover:text-text-primary"
                          }`}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Right-hand actions, at every width                                */}
      {/* ---------------------------------------------------------------- */}
      <div className="flex shrink-0 items-center gap-2">
        {signUpHref ? (
          <a
            href={signUpHref}
            className="hidden h-10 items-center rounded-lg bg-action-primary px-4 text-sm font-medium text-text-inverse transition hover:bg-action-primary-hover sm:inline-flex"
          >
            List your practice
          </a>
        ) : (
          <Link
            href="/for-therapists"
            className="hidden h-10 items-center rounded-lg bg-action-primary px-4 text-sm font-medium text-text-inverse transition hover:bg-action-primary-hover sm:inline-flex"
          >
            List your practice
          </Link>
        )}

        <button
          ref={menuButton}
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-expanded={drawerOpen}
          aria-controls="site-menu"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-text-primary transition hover:bg-bg-subtle lg:hidden"
        >
          <Burger />
          <span className="sr-only">Open menu</span>
        </button>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Drawer                                                            */}
      {/* ---------------------------------------------------------------- */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            onClick={closeAll}
            aria-label="Close menu"
            className="absolute inset-0 h-full w-full cursor-default bg-text-primary/40"
          />

          <div
            id="site-menu"
            ref={drawer}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            tabIndex={-1}
            className="absolute inset-y-0 right-0 flex w-[19rem] max-w-[88vw] flex-col bg-bg-surface shadow-brand outline-none"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <span className="font-display text-ds-18 font-bold text-text-primary">Menu</span>
              <button
                type="button"
                onClick={closeAll}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition hover:bg-bg-subtle hover:text-text-primary"
              >
                <Close />
                <span className="sr-only">Close menu</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3">
              {/* `<details>` rather than more state: the browser already knows
                  how to open and close a disclosure, and it stays keyboard
                  operable with no code of ours in the way. The first group is
                  open so the drawer never looks like a list of four words. */}
              {PRIMARY_NAV.map((group, index) => (
                <details
                  key={group.label}
                  open={index === 0}
                  className="group border-b border-border-subtle last:border-0"
                >
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-2 py-2 text-sm font-medium text-text-primary">
                    {group.label}
                    <Chevron className="text-text-secondary transition-transform group-open:rotate-180" />
                  </summary>

                  <ul className="list-none pb-2 pl-2 pr-2">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          aria-current={isCurrent(link.href) ? "page" : undefined}
                          className={`flex min-h-11 items-center rounded-lg px-3 text-sm transition-colors ${
                            isCurrent(link.href)
                              ? "bg-bg-subtle text-text-primary"
                              : "text-text-secondary hover:bg-bg-subtle hover:text-text-primary"
                          }`}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>

            <div className="border-t border-border p-3">
              {signUpHref ? (
                <a
                  href={signUpHref}
                  className="flex min-h-11 items-center justify-center rounded-lg bg-action-primary px-4 text-sm font-medium text-text-inverse transition hover:bg-action-primary-hover"
                >
                  List your practice
                </a>
              ) : (
                <Link
                  href="/for-therapists"
                  className="flex min-h-11 items-center justify-center rounded-lg bg-action-primary px-4 text-sm font-medium text-text-inverse transition hover:bg-action-primary-hover"
                >
                  List your practice
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

/* Inline rather than a dependency: three glyphs is not worth an icon package
   in an app that ships none today. */

function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`h-4 w-4 shrink-0 transition-transform ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M5 7.5 10 12.5 15 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Burger() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

function Close() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}
