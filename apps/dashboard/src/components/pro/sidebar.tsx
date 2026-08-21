"use client";

import { cn } from "@masseurmatch/ui";
import { LogOut, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOut } from "@/app/sign-in/actions";

import { Badge } from "./badge";
import { PRO_NAV } from "./nav";

/**
 * The Pro sidebar.
 *
 * A client component only because the active item is decided from the path.
 * The nav itself lives in `nav.ts`, so nothing here has to be edited to add a
 * destination.
 *
 * The item list mirrors production's, including the absence of a section
 * heading: "My Profile" is a destination in the list, not a label over it.
 *
 * Sign-out is the one addition. Production reaches it from chrome that does not
 * exist in this app, and a dashboard with no way out is worse than a small
 * divergence.
 */
export function ProSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-2 px-5 py-5">
        <Link href="/" className="text-lg font-semibold text-foreground">
          MasseurMatch
        </Link>
        <Badge variant="earn">Pro</Badge>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        <ul className="space-y-0.5">
          {PRO_NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition",
                    active
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge ? (
                    <Badge variant={item.badge.variant}>{item.badge.label}</Badge>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Pinned to the foot rather than scrolled with the list: it is the way
          out when the list itself was not the answer. */}
      <div className="border-t border-border p-3">
        <div className="rounded-lg border border-border p-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-muted-foreground" aria-hidden />
            <p className="text-sm font-medium text-foreground">Need guidance?</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Ask the AI Profile Coach or contact our team.
          </p>
          <div className="mt-3 flex gap-2">
            <Link
              href="/pro/ai-coach"
              className="rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90"
            >
              Open coach
            </Link>
            <a
              href="mailto:support@masseurmatch.com"
              className="rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
            >
              Support
            </a>
          </div>
        </div>

        <button
          type="button"
          onClick={() => signOut()}
          className="mt-3 flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Sign out
        </button>
      </div>
    </aside>
  );
}
