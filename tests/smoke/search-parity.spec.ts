import { expect, test } from "@playwright/test";

test.describe("directory search parity", () => {
  test("search exposes restored OLD filters", async ({ page }) => {
    await page.goto("/search");

    await expect(page.getByLabel("City")).toBeVisible();
    await expect(page.getByLabel("Service")).toBeVisible();
    await expect(page.getByLabel("Session type")).toBeVisible();
    await expect(page.getByLabel("Profile tier")).toBeVisible();
    await expect(page.getByLabel("Min price / hour")).toBeVisible();
    await expect(page.getByLabel("Max price / hour")).toBeVisible();
    await expect(page.getByText("10+ years experience")).toBeVisible();
    await expect(page.getByText("Verified only")).toBeVisible();
    await expect(page.getByText("LGBTQ+ affirming")).toBeVisible();
  });

  test("legacy city query shape remains compatible", async ({ request }) => {
    const response = await request.get("/search?city=dallas");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("Find a therapist");
  });

  test("restored filters render server-side without errors", async ({ request }) => {
    for (const query of [
      "?master=1",
      "?tier=free",
      "?session=outcall",
      "?verified=1",
      "?lgbtq=1",
      "?min=50&max=250",
      "?sort=rating",
      "?sort=price",
    ]) {
      const response = await request.get(`/search${query}`);
      expect(response.status(), query).toBe(200);
    }
  });

  test("invalid page values are normalized rather than crashing", async ({ request }) => {
    for (const page of ["0", "-3", "nope"]) {
      const response = await request.get(`/search?page=${page}`);
      expect(response.status(), page).toBe(200);
    }
  });
});
