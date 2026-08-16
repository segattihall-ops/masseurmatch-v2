import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  sentryEnabled,
  turnstileEnabled,
  turnstileSiteKey,
  verifyTurnstile,
} from "@masseurmatch/config/observability";

/**
 * Turnstile and Sentry are optional by construction.
 *
 * The property that matters, and the one these tests exist to pin: an
 * unconfigured Turnstile must report `not_configured`, never `passed`. A caller
 * that cannot tell those apart has a bot check that silently does nothing —
 * worse than having none, because nobody looks for a gap they believe is
 * covered.
 */

const KEYS = [
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
  "TURNSTILE_SECRET_KEY",
  "NEXT_PUBLIC_SENTRY_DSN",
] as const;

beforeEach(() => {
  for (const key of KEYS) delete process.env[key];
});

afterEach(() => {
  vi.unstubAllGlobals();
  for (const key of KEYS) delete process.env[key];
});

describe("with nothing configured", () => {
  it("reports Turnstile as off", () => {
    expect(turnstileSiteKey()).toBeNull();
    expect(turnstileEnabled()).toBe(false);
  });

  it("reports Sentry as off", () => {
    expect(sentryEnabled()).toBe(false);
  });

  it("returns not_configured — never passed — and contacts nobody", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    expect(await verifyTurnstile("any-token")).toEqual({ status: "not_configured" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("stays not_configured when only one of the two keys is set", async () => {
    // A half-configured widget must not read as enforcement.
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "site";
    expect(turnstileEnabled()).toBe(false);
    expect(await verifyTurnstile("token")).toEqual({ status: "not_configured" });
  });

  it("treats an empty string as absent", () => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "   ";
    process.env.NEXT_PUBLIC_SENTRY_DSN = "";
    expect(turnstileSiteKey()).toBeNull();
    expect(sentryEnabled()).toBe(false);
  });
});

describe("with Turnstile configured", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "site-key";
    process.env.TURNSTILE_SECRET_KEY = "secret-key";
  });

  it("is reported as on", () => {
    expect(turnstileEnabled()).toBe(true);
  });

  it("passes when Cloudflare says so", async () => {
    vi.stubGlobal("fetch", async () => ({ ok: true, json: async () => ({ success: true }) }));
    expect(await verifyTurnstile("good")).toEqual({ status: "passed" });
  });

  it("fails a missing token without calling out", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    expect(await verifyTurnstile(null)).toEqual({ status: "failed", reason: "missing-token" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("surfaces Cloudflare's rejection reason", async () => {
    vi.stubGlobal("fetch", async () => ({
      ok: true,
      json: async () => ({ success: false, "error-codes": ["invalid-input-response"] }),
    }));
    expect(await verifyTurnstile("bad")).toEqual({
      status: "failed",
      reason: "invalid-input-response",
    });
  });

  it("fails closed when the verifier is unreachable", async () => {
    // Not `passed`. If the verifier cannot be reached, the request is
    // unverified — that is the honest answer and the safe one.
    vi.stubGlobal("fetch", async () => {
      throw new Error("network down");
    });
    expect(await verifyTurnstile("token")).toEqual({
      status: "failed",
      reason: "verifier-unreachable",
    });
  });

  it("fails closed on a non-200 from the verifier", async () => {
    vi.stubGlobal("fetch", async () => ({ ok: false, status: 503, json: async () => ({}) }));
    expect(await verifyTurnstile("token")).toEqual({
      status: "failed",
      reason: "verifier-http-503",
    });
  });

  it("forwards the client address when given one", async () => {
    let sent = "";
    vi.stubGlobal("fetch", async (_url: string, init: { body: URLSearchParams }) => {
      sent = init.body.toString();
      return { ok: true, json: async () => ({ success: true }) };
    });

    await verifyTurnstile("token", "203.0.113.7");
    expect(sent).toContain("remoteip=203.0.113.7");
    expect(sent).toContain("secret=secret-key");
  });
});
