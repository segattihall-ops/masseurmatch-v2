import { describe, expect, it } from "vitest";

import { MIN_PASSWORD_LENGTH, validateCredentials, validatePassword } from "@/lib/credentials";
import { safeNext } from "@/lib/safe-next";

/**
 * The two pure pieces of the auth forms.
 *
 * Both are reached by anonymous callers with attacker-controlled input, and
 * neither needs a database — so they are worth testing exactly, and cheap to.
 */

describe("safeNext", () => {
  it("keeps an ordinary same-origin path", () => {
    expect(safeNext("/profile")).toBe("/profile");
    expect(safeNext("/subscription?tab=plans")).toBe("/subscription?tab=plans");
  });

  it("refuses anything that could leave this origin", () => {
    // Protocol-relative: a browser reads this as another host, even though it
    // starts with a slash. This is the case a naive `startsWith("/")` misses.
    expect(safeNext("//evil.example")).toBe("/");
    expect(safeNext("/\\evil.example")).toBe("/");
    expect(safeNext("https://evil.example")).toBe("/");
    expect(safeNext("javascript:alert(1)")).toBe("/");
  });

  it("falls back to the dashboard home for anything that is not a string", () => {
    expect(safeNext(undefined)).toBe("/");
    expect(safeNext(null)).toBe("/");
    expect(safeNext(42)).toBe("/");
    // Next.js types a repeated query parameter as an array.
    expect(safeNext(["/profile", "/admin"])).toBe("/profile");
    expect(safeNext([])).toBe("/");
  });
});

describe("validateCredentials", () => {
  const valid = {
    email: "someone@example.com",
    password: "correct horse",
    confirm: "correct horse",
  };

  it("accepts a usable set", () => {
    expect(validateCredentials(valid)).toBeNull();
  });

  it("requires both fields", () => {
    expect(validateCredentials({ ...valid, email: "" })).toMatch(/email/i);
    expect(validateCredentials({ ...valid, password: "", confirm: "" })).toMatch(/password/i);
  });

  it("rejects an address with no recipient or no domain", () => {
    expect(validateCredentials({ ...valid, email: "someone" })).not.toBeNull();
    expect(validateCredentials({ ...valid, email: "@example.com" })).not.toBeNull();
    expect(validateCredentials({ ...valid, email: "someone@" })).not.toBeNull();
    expect(validateCredentials({ ...valid, email: "some one@example.com" })).not.toBeNull();
  });

  it("enforces the password floor, and states it", () => {
    const short = "a".repeat(MIN_PASSWORD_LENGTH - 1);
    expect(validateCredentials({ ...valid, password: short, confirm: short })).toContain(
      String(MIN_PASSWORD_LENGTH),
    );
    const exact = "a".repeat(MIN_PASSWORD_LENGTH);
    expect(validateCredentials({ ...valid, password: exact, confirm: exact })).toBeNull();
  });

  it("catches a mistyped confirmation", () => {
    expect(validateCredentials({ ...valid, confirm: "correct hors" })).toMatch(/match/i);
  });
});

describe("validatePassword", () => {
  it("holds the same floor the sign-up form does", () => {
    const short = "a".repeat(MIN_PASSWORD_LENGTH - 1);
    expect(validatePassword(short, short)).toContain(String(MIN_PASSWORD_LENGTH));

    const exact = "a".repeat(MIN_PASSWORD_LENGTH);
    expect(validatePassword(exact, exact)).toBeNull();
  });

  it("catches an empty or mistyped confirmation", () => {
    expect(validatePassword("", "")).toMatch(/password/i);
    expect(validatePassword("a long enough one", "a long enough On")).toMatch(/match/i);
  });
});
