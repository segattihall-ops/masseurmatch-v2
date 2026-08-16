import { expect, test } from "@playwright/test";

/**
 * The dashboard, unauthenticated.
 *
 * Everything here checks the guard rather than the feature behind it. That is
 * deliberate and it is the half worth automating: signing in needs a real
 * account and a password this environment does not have, but "is this page
 * reachable without a session" is exactly the question that gets answered wrong
 * by a refactor and noticed by nobody.
 *
 * A middleware matcher is a denylist by shape — forget to cover a path and it
 * silently becomes public. These tests are the thing that would catch that.
 */

const PROTECTED = [
  "/profile",
  "/onboarding",
  "/subscription",
  "/admin",
  "/admin/moderation",
  "/admin/demand-radar",
];

test.describe("without a session", () => {
  for (const path of PROTECTED) {
    test(`${path} is not reachable`, async ({ page }) => {
      await page.goto(path);

      // Either bounced to sign-in or refused. What must never happen is a 200
      // rendering the real page.
      const landed = new URL(page.url()).pathname;
      expect(landed, path).not.toBe(path);
      expect(landed, path).toMatch(/\/sign-in|\/not-authorized/);
    });
  }

  test("the sign-in page renders", async ({ page }) => {
    const response = await page.goto("/sign-in");
    expect(response?.status()).toBe(200);
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test("a bounce preserves where the visitor was going", async ({ page }) => {
    // Otherwise signing in dumps them on a default page and they have to
    // navigate back to what they clicked.
    await page.goto("/subscription");
    expect(page.url()).toContain("next=");
  });
});

test.describe("the upload endpoint", () => {
  test("refuses an anonymous caller", async ({ request }) => {
    // It mints a signed Cloudinary credential, so the session check must come
    // before anything else.
    const response = await request.post("/api/uploads/photo");
    expect(response.status()).toBe(401);
  });
});

test.describe("the billing webhook", () => {
  test("rejects an unsigned request", async ({ request }) => {
    const response = await request.post("/api/webhooks/billing", {
      data: { event_type: "PAYMENT.SALE.COMPLETED", id: "evt-smoke" },
    });

    // 401 when a provider is configured and the signature fails; 503 when none
    // is. Both are refusals. A 200 here would mean an unsigned request was
    // treated as a real payment event.
    expect([401, 503]).toContain(response.status());
  });

  test("rejects an empty body", async ({ request }) => {
    const response = await request.post("/api/webhooks/billing", { data: "" });
    expect([401, 503]).toContain(response.status());
  });
});

test("the dashboard is not indexable", async ({ request }) => {
  // It should never appear in search results, and the header covers route
  // handlers and redirects that never render metadata.
  const response = await request.get("/sign-in");
  expect(response.headers()["x-robots-tag"]).toContain("noindex");
});

test("security headers are present here too", async ({ request }) => {
  // The dashboard is the app most likely to be missed when headers are added,
  // because the public site is the one people check.
  const headers = (await request.get("/sign-in")).headers();
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["strict-transport-security"]).toContain("max-age=");
});
