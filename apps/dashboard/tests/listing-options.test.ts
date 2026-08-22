import { describe, expect, it } from "vitest";

import { YEAR_MAX, YEAR_MIN, YEARS } from "@/lib/listing-options";

describe("listing year options", () => {
  it("tracks the current UTC year without annual maintenance", () => {
    const currentYear = new Date().getUTCFullYear();

    expect(YEAR_MAX).toBe(currentYear);
    expect(YEARS[0]).toBe(String(currentYear));
    expect(YEARS.at(-1)).toBe(String(YEAR_MIN));
    expect(YEARS).toHaveLength(currentYear - YEAR_MIN + 1);
  });
});
