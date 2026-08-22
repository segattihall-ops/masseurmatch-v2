import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { adminUrl } from "../src/lib/admin-url";

/**
 * `adminUrl()` is what Google is told to send an operator back to, so a value
 * this function gets wrong does not degrade — the round trip simply fails to
 * come home. The bare-hostname case is the one that actually happened: a
 * production variable was set to `dashboard.masseurmatch.com` with no scheme,
 * which is how anyone would naturally type it.
 */

const VARS = ["NEXT_PUBLIC_ADMIN_URL", "VERCEL_PROJECT_PRODUCTION_URL"] as const;

let saved: Record<string, string | undefined> = {};

beforeEach(() => {
  saved = Object.fromEntries(VARS.map((name) => [name, process.env[name]]));
  for (const name of VARS) delete process.env[name];
});

afterEach(() => {
  for (const name of VARS) {
    const value = saved[name];
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

describe("adminUrl", () => {
  it("prefers the explicit variable", () => {
    process.env.NEXT_PUBLIC_ADMIN_URL = "https://admin.masseurmatch.com";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "ignored.vercel.app";
    expect(adminUrl()).toBe("https://admin.masseurmatch.com");
  });

  it("adds the missing scheme to a bare hostname", () => {
    process.env.NEXT_PUBLIC_ADMIN_URL = "admin.masseurmatch.com";
    expect(adminUrl()).toBe("https://admin.masseurmatch.com");
  });

  it("strips a trailing slash, so the callback path is not doubled", () => {
    process.env.NEXT_PUBLIC_ADMIN_URL = "https://admin.masseurmatch.com/";
    expect(`${adminUrl()}/auth/callback`).toBe("https://admin.masseurmatch.com/auth/callback");
  });

  it("treats an empty or whitespace value as unset", () => {
    process.env.NEXT_PUBLIC_ADMIN_URL = "   ";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "admin-abc123.vercel.app";
    expect(adminUrl()).toBe("https://admin-abc123.vercel.app");
  });

  it("falls back to Vercel's production host", () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "admin-abc123.vercel.app";
    expect(adminUrl()).toBe("https://admin-abc123.vercel.app");
  });

  it("falls back to the app's own local port", () => {
    expect(adminUrl()).toBe("http://localhost:3002");
  });

  it("leaves an explicit http origin alone", () => {
    process.env.NEXT_PUBLIC_ADMIN_URL = "http://localhost:3002";
    expect(adminUrl()).toBe("http://localhost:3002");
  });
});
