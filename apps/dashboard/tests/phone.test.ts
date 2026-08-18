import { describe, expect, it } from "vitest";

import { isVerificationCode, maskPhone, toE164 } from "@/lib/phone";

/**
 * Phone normalisation.
 *
 * Every failure here is a silent one — an SMS that never arrives, or one that
 * arrives at someone else's phone — so the refusals matter as much as the
 * conversions.
 */

describe("toE164", () => {
  it("normalises a US number written the way people write it", () => {
    expect(toE164("(555) 123-4567")).toBe("+15551234567");
    expect(toE164("555-123-4567")).toBe("+15551234567");
    expect(toE164("555.123.4567")).toBe("+15551234567");
    expect(toE164("5551234567")).toBe("+15551234567");
    expect(toE164("1 555 123 4567")).toBe("+15551234567");
  });

  it("takes an explicitly international number at its word", () => {
    expect(toE164("+44 20 7123 4567")).toBe("+442071234567");
    expect(toE164("+5511987654321")).toBe("+5511987654321");
  });

  it("refuses rather than guessing at an ambiguous number", () => {
    // Nine digits with no country code could be any of a dozen countries.
    expect(toE164("123456789")).toBeNull();
    expect(toE164("12345")).toBeNull();
    expect(toE164("")).toBeNull();
    expect(toE164("not a phone")).toBeNull();
    // Eleven digits that do not start with the US country code.
    expect(toE164("25551234567")).toBeNull();
  });

  it("refuses a `+` number that is too short or too long for E.164", () => {
    expect(toE164("+1234567")).toBeNull();
    expect(toE164("+1234567890123456")).toBeNull();
  });
});

describe("maskPhone", () => {
  it("shows only enough to recognise the number", () => {
    expect(maskPhone("+15551234567")).toBe("••• ••• 4567");
    expect(maskPhone("+15551234567")).not.toContain("555123");
  });
});

describe("isVerificationCode", () => {
  it("accepts exactly six digits", () => {
    expect(isVerificationCode("123456")).toBe(true);
    expect(isVerificationCode(" 123456 ")).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isVerificationCode("12345")).toBe(false);
    expect(isVerificationCode("1234567")).toBe(false);
    expect(isVerificationCode("12a456")).toBe(false);
    expect(isVerificationCode("")).toBe(false);
  });
});
