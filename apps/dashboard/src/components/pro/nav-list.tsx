"use client";

import { cn } from "@masseurmatch/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "./badge";
import { PRO_NAV } from "./nav";

/**
 * The seventeen destinations, as a list.
 *
 * Shared by the desktop sidebar and the mobile drawer so the two cannot drift
 * into different navs — the failure mode of every "and a mobile menu too"
 * change, where a destination gets added to one list and not the other.
 *
 * `onNavigate` is how the drawer closes itself. The desktop sidebar passes
 * nothing: there is no overlay to dismiss, and a sidebar that reacted to its
 * own links would just be work.
 */
export function ProNavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <ul className="space-y-0.5">
      {PRO_NAV.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                // `min-h-11` rather than padding alone: this list is the primary
                // nav on a phone, and a 32px row is below every touch-target
                // guideline going. It costs nothing on a pointer device.
                "flex min-h-11 items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition",
                active
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge ? <Badge variant={item.badge.variant}>{item.badge.label}</Badge> : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
