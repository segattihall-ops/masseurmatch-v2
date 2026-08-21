import Link from "next/link";

import { QUICK_ACTIONS } from "./nav";

/**
 * The bar at the foot of the dashboard.
 *
 * The same destinations as the sidebar, at the end of the page, because
 * finishing a scroll and having to travel back up to the nav is the small
 * annoyance this removes.
 */
export function QuickActions() {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <p className="text-sm font-medium text-foreground">Quick actions</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm text-foreground transition hover:bg-muted"
            >
              <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
              {action.label}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
