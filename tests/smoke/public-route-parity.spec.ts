import { expect, test } from "@playwright/test";

const SERVICE_ROUTES = [
  "/services/deep-tissue",
  "/services/swedish",
  "/services/sports",
  "/services/thai",
  "/services/mobile",
  "/services/hotel",
  "/services/lymphatic",
  "/services/hot-stone",
] as const;

test.describe("restored public route parity", () => {
  test("every legacy service detail route renders", async ({ request }) => {
    const broken: string[] = [];

    for (const path of SERVICE_ROUTES) {
      const response = await request.get(path);
      const text = await response.text();
      if (response.status() !== 200 || text.length < 1200) {
        broken.push(`${path} -> ${response.status()} (${text.length}b)`);
      }
    }

    expect(broken).toEqual([]);
  });

  test("service detail routes are declared in the sitemap", async ({ request }) => {
    const body = await (await request.get("/sitemap.xml")).text();
    const declared = new Set(
      [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname),
    );

    expect(SERVICE_ROUTES.filter((path) => !declared.has(path))).toEqual([]);
  });

  test("legacy local SEO route families still resolve", async ({ request }) => {
    for (const path of [
      "/new-york/lgbtq-friendly",
      "/new-york/lgbtq-friendly/deep-tissue",
      "/new-york/areas/chelsea",
    ]) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
    }
  });

  test("a real profile cannot render under the wrong state or city", async ({ request }) => {
    // Mati's canonical route is /ny/new-york/mati-eb87b62c in the production
    // fixture used by the existing smoke suite. A slug-only lookup used to make
    // this arbitrary location render the same profile as a 200.
    const response = await request.get("/ca/san-francisco/mati-eb87b62c");
    expect(response.status()).toBe(404);
  });

  test("legacy explore routes land on canonical discovery pages", async ({ page }) => {
    await page.goto("/explore");
    expect(new URL(page.url()).pathname).toBe("/therapists");

    await page.goto("/explore/usa");
    expect(new URL(page.url()).pathname).toBe("/therapists");

    await page.goto("/explore/ny");
    expect(new URL(page.url()).pathname).toBe("/states");

    await page.goto("/explore/usa/new-york");
    expect(new URL(page.url()).pathname).toBe("/ny/new-york");
  });

  test("obsolete acquisition routes preserve old links without stale claims", async ({ page }) => {
    await page.goto("/free");
    expect(new URL(page.url()).pathname).toBe("/pricing");

    await page.goto("/waitlist");
    expect(new URL(page.url()).pathname).toBe("/for-therapists");
  });
});
