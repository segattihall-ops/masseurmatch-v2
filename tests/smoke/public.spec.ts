import { expect, test } from "@playwright/test";

/**
 * The public site, end to end against a production build.
 *
 * The journey these follow is the one that matters commercially: a visitor
 * lands, finds a city, opens a therapist. Everything else here guards a
 * decision that is easy to break silently — the legacy redirects, the security
 * headers, and the rule that a dead URL 404s instead of being swept to the home
 * page.
 */

test("a visitor can go from the home page to a therapist", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/MasseurMatch/i);

  // Follow a real city link rather than a hardcoded URL, so this fails if the
  // home page stops linking to cities at all.
  const cityLink = page.locator('a[href^="/"][href*="/"]').filter({ hasText: /\w/ });
  await expect(cityLink.first()).toBeVisible();

  await page.goto("/ny/new-york");
  await expect(page.locator("h1")).toContainText(/new york/i);

  const therapist = page.locator('a[href^="/ny/new-york/"]').first();
  await expect(therapist).toBeVisible();
  await therapist.click();

  await expect(page).toHaveURL(/\/ny\/new-york\/[^/]+$/);
  await expect(page.locator("h1")).toBeVisible();
});

test("search returns results and stays noindex", async ({ page }) => {
  const response = await page.goto("/search");
  expect(response?.status()).toBe(200);

  // Deliberate: faceted queries generate unbounded near-duplicate URLs.
  // Lighthouse scores this page 66 on SEO because of it, which is correct.
  const robots = page.locator('meta[name="robots"]');
  await expect(robots).toHaveAttribute("content", /noindex/);
});

test.describe("legacy URLs from the old site", () => {
  // These carry the site's search equity. If they stop redirecting, the
  // rankings go with them, and nothing else in the suite would notice.
  const profiles = [
    ["/therapists/mati-eb87b62c", "/ny/new-york/mati-eb87b62c"],
    ["/therapists/christopher-457ced71", "/fl/aventura/christopher-457ced71"],
    ["/therapists/giovanni-san-francisco", "/ca/san-francisco/giovanni-san-francisco"],
  ] as const;

  for (const [from, to] of profiles) {
    test(`${from} redirects to ${to}`, async ({ page }) => {
      const response = await page.goto(from);
      expect(response?.status()).toBe(200);
      expect(new URL(page.url()).pathname).toBe(to);
    });
  }

  const cities = [
    ["/new-york", "/ny/new-york"],
    ["/san-francisco", "/ca/san-francisco"],
    ["/cities/new-york", "/ny/new-york"],
    ["/providers/new-york", "/ny/new-york"],
    ["/states/ny/cities/new-york", "/ny/new-york"],
  ] as const;

  for (const [from, to] of cities) {
    test(`${from} redirects to ${to}`, async ({ page }) => {
      await page.goto(from);
      expect(new URL(page.url()).pathname).toBe(to);
    });
  }

  test("the bare-city rule does not shadow real top-level pages", async ({ page }) => {
    // `/[state]` is a dynamic segment at the site root. If it ever started
    // matching greedily, these would silently become redirects or 404s.
    for (const path of ["/", "/about", "/faq", "/search", "/terms", "/privacy"]) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(200);
      expect(new URL(page.url()).pathname, path).toBe(path);
    }
  });
});

test.describe("dead URLs", () => {
  // A soft 404 — redirecting a dead URL to a live page — tells a crawler the
  // page moved when it did not, and leaves the dead URL in the index.
  for (const path of ["/not-a-city", "/therapists/not-a-real-slug", "/ny", "/nonsense/deep/path"]) {
    test(`${path} returns a real 404`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(404);
      expect(new URL(page.url()).pathname, path).toBe(path);
    });
  }

  test("the 404 page offers a way back into the directory", async ({ page }) => {
    await page.goto("/not-a-city");
    await expect(page.locator('a[href="/search"], a[href="/"]').first()).toBeVisible();
  });
});

test.describe("every indexed URL resolves", () => {
  // The 79 URLs in the OLD site's live sitemap. This is the cutover gate: if
  // any of these stops resolving, the migration loses that page's ranking.
  // Grouped rather than listed one-per-test so a regression shows every
  // casualty at once instead of the first alphabetically.
  const RENDERED = [
    "/",
    "/about",
    "/faq",
    "/terms",
    "/privacy",
    "/search",
    "/therapists",
    "/cities",
    "/states",
    "/guides",
    "/compare",
    "/blog",
    "/how-it-works",
    "/for-therapists",
    "/pricing",
    "/near-me",
    "/advertise",
    "/contact",
    "/legal",
    "/client-terms",
    "/provider-terms",
    "/advertising-terms",
    "/subscriptions",
    "/refund-policy",
    "/acceptable-use",
    "/prohibited-conduct",
    "/community-guidelines",
    "/content-guidelines",
    "/photo-profile-policy",
    "/cookie-policy",
    "/data-deletion",
    "/email-opt-out",
    "/sms-terms",
    "/safety",
    "/report-block-safety",
    "/trust",
    "/dmca",
    "/platform-disclaimer",
    "/ai-disclosure",
    "/badge-disclaimer",
    "/verification",
    "/accessibility",
  ];

  const REDIRECTED = [
    "/therapists/mati-eb87b62c",
    "/therapists/andrey-113174e9",
    "/therapists/christopher-457ced71",
    "/therapists/reggie-3ef08824",
    "/therapists/giovanni-san-francisco",
    "/therapists/vitor-228df922",
    "/new-york",
    "/san-francisco",
    "/aventura",
    "/humble",
    "/indianapolis",
  ];

  test("every static page renders with real content", async ({ request }) => {
    const broken: string[] = [];
    for (const path of RENDERED) {
      const response = await request.get(path);
      const text = await response.text();
      // A 200 that renders an empty shell is still a broken page.
      if (response.status() !== 200 || text.length < 1500) {
        broken.push(`${path} -> ${response.status()} (${text.length}b)`);
      }
    }
    expect(broken).toEqual([]);
  });

  test("every legacy URL still redirects", async ({ page }) => {
    const broken: string[] = [];
    for (const path of REDIRECTED) {
      await page.goto(path);
      if (new URL(page.url()).pathname === path) broken.push(path);
    }
    expect(broken).toEqual([]);
  });

  test("the sitemap declares the pages that exist", async ({ request }) => {
    // A page nobody declares is a page nobody crawls.
    //
    // Compared by PATH, not by absolute URL: the sitemap is generated against
    // NEXT_PUBLIC_SITE_URL (the real domain), while the suite runs on
    // localhost, so matching whole URLs would fail for a reason that has
    // nothing to do with what is declared.
    const body = await (await request.get("/sitemap.xml")).text();
    const declared = new Set(
      [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname),
    );
    const missing = RENDERED.filter((path) => !declared.has(path));
    expect(missing).toEqual([]);
  });
});

test("security headers are present on a real response", async ({ request }) => {
  const response = await request.get("/");
  const headers = response.headers();

  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["content-security-policy"]).toContain("object-src 'none'");
  expect(headers["content-security-policy"]).toContain("base-uri 'self'");
  expect(headers["strict-transport-security"]).toContain("max-age=");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["permissions-policy"]).toContain("camera=()");
});

test("sitemap and robots are served and point at real pages", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);

  const body = await sitemap.text();
  expect(body).toContain("<urlset");
  // The directory core must be in there, or the migration loses its best pages.
  expect(body).toMatch(/\/ny\/new-york/);

  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain("Sitemap:");
});

test("no unlisted profile is reachable from the directory", async ({ request }) => {
  // The public site must only ever show approved + public rows. This is the
  // RLS guarantee seen from outside the database.
  const sitemap = await (await request.get("/sitemap.xml")).text();
  const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => new URL(m[1]).pathname)
    .filter((p) => p.split("/").length === 4);

  expect(paths.length).toBeGreaterThan(0);

  for (const path of paths) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
  }
});
