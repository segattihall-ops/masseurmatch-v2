import { describe, expect, it } from "vitest";

import { normaliseReferralCode, referralSignUpUrl } from "@/lib/referrals";

describe("normaliseReferralCode", () => {
  it("accepts what a code can be", () => {
    expect(normaliseReferralCode("ABC123")).toBe("ABC123");
    expect(normaliseReferralCode("  mm-abc_9  ")).toBe("mm-abc_9");
  });

  it("keeps the case it was given", () => {
    // A code differing only in case is a different code. Upper-casing here
    // would send credit to whoever happens to own the other one.
    expect(normaliseReferralCode("AbC123")).toBe("AbC123");
  });

  it("refuses anything that is not path-safe", () => {
    expect(normaliseReferralCode("abc/../../etc")).toBeNull();
    expect(normaliseReferralCode("abc def")).toBeNull();
    expect(normaliseReferralCode("<script>")).toBeNull();
  });

  it("refuses lengths a real code never has", () => {
    expect(normaliseReferralCode("ab")).toBeNull();
    expect(normaliseReferralCode("x".repeat(41))).toBeNull();
    expect(normaliseReferralCode("")).toBeNull();
    expect(normaliseReferralCode(null)).toBeNull();
    expect(normaliseReferralCode(undefined)).toBeNull();
  });
});

describe("referralSignUpUrl", () => {
  it("builds the short link", () => {
    expect(referralSignUpUrl("https://pro.example.com", "ABC123")).toBe(
      "https://pro.example.com/r/ABC123",
    );
  });

  it("does not double the slash when the origin carries one", () => {
    expect(referralSignUpUrl("https://pro.example.com/", "ABC123")).toBe(
      "https://pro.example.com/r/ABC123",
    );
  });
});
