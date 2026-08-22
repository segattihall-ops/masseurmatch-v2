import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { PRO_NAV, QUICK_ACTIONS } from "@/components/pro/nav";

/**
 * Every destination in the sidebar has a page behind it.
 *
 * `nav.ts` says this in its own comment — "a nav item pointing at a route
 * nobody built is the failure mode this file exists to make obvious" — but
 * saying it does not check it. Renaming a route or adding an item is exactly
 * when the two drift, and the symptom is a 404 reached from the primary nav.
 */
const appDir = fileURLToPath(new URL("../src/app/", import.meta.url));

function pageFor(href: string): string {
  return `${appDir}${href.replace(/^\//, "")}/page.tsx`;
}

describe("Pro navigation", () => {
  it.each(PRO_NAV.map((item) => [item.label, item.href] as const))(
    "%s (%s) has a page",
    (_label, href) => {
      expect(existsSync(pageFor(href))).toBe(true);
    },
  );

  it.each(QUICK_ACTIONS.map((action) => [action.label, action.href] as const))(
    "quick action %s (%s) has a page",
    (_label, href) => {
      expect(existsSync(pageFor(href))).toBe(true);
    },
  );

  it("has no duplicate destinations", () => {
    const hrefs = PRO_NAV.map((item) => item.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("keeps every quick action reachable from the sidebar too", () => {
    // The bar at the foot of the dashboard is a shortcut, not a second nav. A
    // destination only reachable from it is one nobody finds from another page.
    const sidebar = new Set(PRO_NAV.map((item) => item.href));
    for (const action of QUICK_ACTIONS) {
      expect(sidebar.has(action.href)).toBe(true);
    }
  });
});

/**
 * Nothing under `/therapist` renders its own copy of a page.
 *
 * That segment is the legacy shell. Every route in it now redirects into
 * `/pro`, which is the only shell with a mobile navigation and the only place
 * these pages are implemented. The rule is worth checking rather than
 * remembering: the pages this replaced had drifted far enough apart that the
 * legacy subscription page was quoting Standard at $29 against a real price of
 * $39, and the legacy coach page was reading nothing at all.
 */
describe("legacy /therapist routes", () => {
  const therapistDir = fileURLToPath(new URL("../src/app/therapist/", import.meta.url));
  const pages = readdirSync(therapistDir, { recursive: true, encoding: "utf8" }).filter((entry) =>
    entry.endsWith("page.tsx"),
  );

  it("still has routes to redirect", () => {
    expect(pages.length).toBeGreaterThan(0);
  });

  it.each(pages)("%s redirects into /pro", (page) => {
    const source = readFileSync(`${therapistDir}${page}`, "utf8");
    expect(source).toMatch(/redirect\("\/pro\//);
  });
});
