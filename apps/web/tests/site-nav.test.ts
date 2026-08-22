import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { allNavHrefs, BOTTOM_NAV, PRIMARY_NAV } from "@/components/site-nav-data";

/**
 * Every destination in the menu has a page behind it.
 *
 * The navigation is now the main way anything on this site is reached — before
 * this, a phone showed two links and the other forty-odd pages were reachable
 * only from the footer. A menu item pointing at a route nobody built is a 404
 * from the primary nav, and renaming a route is exactly when it happens.
 */
const appDir = fileURLToPath(new URL("../src/app/", import.meta.url));

function hasPage(href: string): boolean {
  const segment = href === "/" ? "" : `${href.replace(/^\//, "")}/`;
  return existsSync(`${appDir}${segment}page.tsx`);
}

describe("site navigation", () => {
  it.each(allNavHrefs())("%s has a page", (href) => {
    expect(hasPage(href)).toBe(true);
  });

  it("has no duplicate destinations inside a group", () => {
    for (const group of PRIMARY_NAV) {
      const hrefs = group.links.map((link) => link.href);
      expect(new Set(hrefs).size).toBe(hrefs.length);
    }
  });

  it("opens each group on a page that is also in its own submenu", () => {
    // The group label is a link, not a dead heading. If it went somewhere the
    // submenu never mentions, the bar and the panel would disagree about what
    // the group is.
    for (const group of PRIMARY_NAV) {
      expect(group.links.map((link) => link.href)).toContain(group.href);
    }
  });

  it("keeps the bottom bar to what fits under a thumb", () => {
    // Five 44px targets is 320px exactly. A sixth does not fit on the narrowest
    // phone still in use, and this is the check that says so out loud.
    expect(BOTTOM_NAV.length).toBeLessThanOrEqual(5);
  });
});
