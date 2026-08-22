import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { allNavHrefs, BOTTOM_NAV, PRIMARY_NAV } from "@/components/site-nav-data";

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
    for (const group of PRIMARY_NAV) {
      expect(group.links.map((link) => link.href)).toContain(group.href);
    }
  });

  it("keeps the bottom bar to what fits under a thumb", () => {
    expect(BOTTOM_NAV.length).toBeLessThanOrEqual(5);
  });
});
