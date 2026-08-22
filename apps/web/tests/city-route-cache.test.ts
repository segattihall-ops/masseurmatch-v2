import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const cityPagePath = fileURLToPath(new URL("../src/app/[state]/[city]/page.tsx", import.meta.url));
const cityPageSource = readFileSync(cityPagePath, "utf8");

describe("canonical city route cache policy", () => {
  it("does not cache a false city 404 across provider approvals", () => {
    expect(cityPageSource).toContain("export const revalidate = 0;");
    expect(cityPageSource).toContain("getFreshCanonicalCity");
  });
});
