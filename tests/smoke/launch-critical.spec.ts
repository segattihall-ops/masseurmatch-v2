import { expect, test, type APIRequestContext } from "@playwright/test";

const DASHBOARD_ORIGIN = "http://localhost:3211";

async function publicProfilePaths(request: APIRequestContext): Promise<string[]> {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  return [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => new URL(match[1]).pathname)
    .filter((path) => path.split("/").filter(Boolean).length === 3);
}

test("a public profile exposes contact and reporting actions", async ({ page, request }) => {
  const paths = await publicProfilePaths(request);
  expect(paths.length).toBeGreaterThan(0);

  let matchedPath: string | null = null;
  for (const path of paths.slice(0, 30)) {
    const response = await page.goto(path);
    if (response?.status() !== 200) continue;

    const report = page.getByRole("button", { name: "Report this profile" });
    const contact = page.locator(
      'a[href^="tel:"], a[href^="sms:"], a[href^="mailto:"], a[href*="wa.me"], a:has-text("Provider scheduling link")',
    );
    if ((await report.count()) > 0 && (await contact.count()) > 0) {
      matchedPath = path;
      await expect(report).toBeVisible();
      await expect(contact.first()).toBeVisible();
      await report.click();
      await expect(page.locator("#report-category")).toBeVisible();
      await expect(page.locator("#report-reason")).toBeVisible();
      await expect(page.locator("#report-email")).toBeVisible();
      await expect(page.getByRole("button", { name: "Submit report" })).toBeVisible();
      break;
    }
  }

  expect(matchedPath, "expected at least one public provider with a contact method").not.toBeNull();
});

test("report submission cannot invent a public profile", async ({ request }) => {
  const response = await request.post("/api/profile-reports", {
    data: {
      profileId: "00000000-0000-0000-0000-000000000000",
      profileSlug: "client-controlled-slug",
      profileName: "client-controlled-name",
      category: "profile_accuracy",
      reason: "This is a deliberately nonexistent profile used by the smoke test.",
    },
  });

  expect(response.status()).toBe(404);
});

test("contact analytics refuses a non-public profile id", async ({ request }) => {
  const response = await request.post("/api/profile-actions", {
    data: {
      profileId: "00000000-0000-0000-0000-000000000000",
      action: "call",
    },
  });

  expect(response.status()).toBe(404);
});

test.describe("launch-critical authorization boundaries", () => {
  for (const path of [
    "/admin/profile-reports",
    "/admin/moderation",
    "/pro/approval-status",
    "/pro/listing",
  ]) {
    test(`${path} is not available anonymously`, async ({ page }) => {
      await page.goto(`${DASHBOARD_ORIGIN}${path}`);
      const landed = new URL(page.url()).pathname;
      expect(landed, path).not.toBe(path);
      expect(landed, path).toMatch(/\/sign-in|\/not-authorized/);
    });
  }
});