import { describe, expect, it } from "vitest";

import { safeNext } from "../src/lib/safe-next";

describe("admin safeNext", () => {
  it("keeps same-origin admin paths", () => {
    expect(safeNext("/moderation")).toBe("/moderation");
    expect(safeNext("/tickets/123")).toBe("/tickets/123");
  });

  it("rejects external and protocol-relative redirects", () => {
    expect(safeNext("https://example.com")).toBe("/");
    expect(safeNext("//example.com")).toBe("/");
    expect(safeNext("/\\example.com")).toBe("/");
  });
});
