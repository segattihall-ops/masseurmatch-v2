import Link from "next/link";

import { Badge } from "./badge";
import { ProNavList } from "./nav-list";
import { ProSidebarFooter } from "./sidebar-footer";

/**
 * The Pro sidebar, on screens wide enough to spare 16rem for it.
 *
 * Hidden below `lg` and replaced by `ProMobileNav`'s drawer. It used to render
 * unconditionally, which left a phone 119px of content next to 256px of nav —
 * the dashboard was legible only on a laptop.
 *
 * The nav itself lives in `nav.ts`, so nothing here has to be edited to add a
 * destination. The item list mirrors production's, including the absence of a
 * section heading: "My Profile" is a destination in the list, not a label over
 * it.
 *
 * Sign-out is the one addition. Production reaches it from chrome that does not
 * exist in this app, and a dashboard with no way out is worse than a small
 * divergence.
 */
export function ProSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <Link href="/" className="text-lg font-semibold text-foreground">
          MasseurMatch
        </Link>
        <Badge variant="earn">Pro</Badge>
      </div>

      <nav aria-label="Provider dashboard" className="flex-1 overflow-y-auto px-3 pb-4">
        <ProNavList />
      </nav>

      {/* Pinned to the foot rather than scrolled with the list: it is the way
          out when the list itself was not the answer. */}
      <ProSidebarFooter />
    </aside>
  );
}
