"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Badge } from "./badge";
import { ProNavList } from "./nav-list";
import { ProSidebarFooter } from "./sidebar-footer";

/**
 * The Pro nav on a phone: a sticky bar, and a drawer behind it.
 *
 * `lg:hidden`, the mirror of `ProSidebar`'s `hidden lg:flex`, so exactly one of
 * the two is mounted at any width and the nav never appears twice.
 *
 * The bar is sticky rather than static because these pages scroll a long way —
 * the analytics and listing pages both run past a phone screen several times
 * over, and a nav you have to scroll back up to reach is one people stop using.
 */
export function ProMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Navigating closes the drawer. Without this the panel stays over the page it
  // just navigated to, which reads as a broken link rather than a finished one.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    // The page behind a drawer must not scroll under it — on iOS especially,
    // where the drag is caught by whichever element happens to be beneath.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus moves into the panel so the next Tab lands on a nav item rather
    // than somewhere behind the overlay, and Escape closes it like any dialog.
    panel.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  // Returning focus to the button that opened it is the half of the dialog
  // contract that is easy to forget; without it a keyboard user is dropped at
  // the top of the document every time they dismiss the menu.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !open) trigger.current?.focus();
    wasOpen.current = open;
  }, [open]);

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card px-4 py-3 lg:hidden">
        <button
          ref={trigger}
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="pro-mobile-nav"
          className="-ml-1 inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition hover:bg-muted"
        >
          <Menu className="h-5 w-5" aria-hidden />
          <span className="sr-only">Open menu</span>
        </button>

        <Link href="/pro/dashboard" className="text-base font-semibold text-foreground">
          MasseurMatch
        </Link>
        <Badge variant="earn">Pro</Badge>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* A button rather than a div: tapping the dimmed area is a real way
              to dismiss this, and it should be one for a screen reader too. */}
          <button
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="absolute inset-0 h-full w-full cursor-default bg-foreground/40"
          />

          <div
            id="pro-mobile-nav"
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label="Provider dashboard menu"
            tabIndex={-1}
            className="absolute inset-y-0 left-0 flex w-[17rem] max-w-[85vw] flex-col bg-card shadow-xl outline-none"
          >
            <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-foreground">MasseurMatch</span>
                <Badge variant="earn">Pro</Badge>
              </div>
              <button
                type="button"
                onClick={close}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" aria-hidden />
                <span className="sr-only">Close menu</span>
              </button>
            </div>

            <nav aria-label="Provider dashboard" className="flex-1 overflow-y-auto px-3 py-3">
              <ProNavList onNavigate={close} />
            </nav>

            <ProSidebarFooter onNavigate={close} />
          </div>
        </div>
      ) : null}
    </>
  );
}
