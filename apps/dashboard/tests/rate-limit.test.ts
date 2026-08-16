import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { __resetRateLimits, clientAddress, LIMITS, rateLimit } from "@/lib/rate-limit";

beforeEach(() => {
  __resetRateLimits();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("the window", () => {
  it("allows exactly `limit` requests, then refuses", () => {
    for (let i = 0; i < 5; i += 1) {
      expect(rateLimit("k", 5, 1000).ok).toBe(true);
    }
    expect(rateLimit("k", 5, 1000).ok).toBe(false);
  });

  it("counts down remaining", () => {
    expect(rateLimit("k", 3, 1000).remaining).toBe(2);
    expect(rateLimit("k", 3, 1000).remaining).toBe(1);
    expect(rateLimit("k", 3, 1000).remaining).toBe(0);
  });

  it("reopens once the window passes", () => {
    for (let i = 0; i < 3; i += 1) rateLimit("k", 3, 1000);
    expect(rateLimit("k", 3, 1000).ok).toBe(false);

    vi.advanceTimersByTime(1001);
    expect(rateLimit("k", 3, 1000).ok).toBe(true);
  });

  it("reports a Retry-After of at least one second", () => {
    for (let i = 0; i < 3; i += 1) rateLimit("k", 3, 1000);
    const result = rateLimit("k", 3, 1000);
    // Never 0 — a Retry-After of 0 invites an immediate retry that also fails.
    expect(result.retryAfter).toBeGreaterThanOrEqual(1);
  });

  it("keeps keys independent", () => {
    for (let i = 0; i < 3; i += 1) rateLimit("a", 3, 1000);
    expect(rateLimit("a", 3, 1000).ok).toBe(false);
    expect(rateLimit("b", 3, 1000).ok).toBe(true);
  });
});

describe("what a fixed window permits at the boundary", () => {
  it("allows up to 2x the limit across two adjacent windows", () => {
    // Documented in lib/rate-limit.ts as an accepted trade-off, not a bug.
    // Pinned here so the trade-off is visible rather than discovered.
    let allowed = 0;
    for (let i = 0; i < 5; i += 1) if (rateLimit("k", 5, 1000).ok) allowed += 1;
    vi.advanceTimersByTime(1001);
    for (let i = 0; i < 5; i += 1) if (rateLimit("k", 5, 1000).ok) allowed += 1;

    expect(allowed).toBe(10);
  });
});

describe("clientAddress", () => {
  it("takes the first x-forwarded-for entry", () => {
    // Behind Vercel the first entry is the real peer; anything the client
    // appends comes after it.
    const headers = new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" });
    expect(clientAddress(headers)).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip", () => {
    expect(clientAddress(new Headers({ "x-real-ip": "203.0.113.9" }))).toBe("203.0.113.9");
  });

  it("buckets unidentifiable callers together rather than letting them through", () => {
    // Over-limiting is the safe direction. Returning a unique value per
    // request would give every anonymous caller their own fresh quota.
    expect(clientAddress(new Headers())).toBe("unknown");
    expect(clientAddress(new Headers())).toBe("unknown");
  });

  it("ignores an empty forwarded header", () => {
    expect(clientAddress(new Headers({ "x-forwarded-for": "" }))).toBe("unknown");
  });
});

describe("the configured limits", () => {
  it("are all positive and windowed", () => {
    for (const [name, config] of Object.entries(LIMITS)) {
      expect(config.limit, name).toBeGreaterThan(0);
      expect(config.windowMs, name).toBeGreaterThan(0);
    }
  });
});
