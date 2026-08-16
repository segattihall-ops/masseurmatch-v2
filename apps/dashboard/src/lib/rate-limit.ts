import "server-only";

/**
 * Rate limiting.
 *
 * **Read this before relying on it.** This is an in-memory fixed-window
 * counter, held per process. On Vercel that means per lambda instance, and
 * instances are created and recycled freely — so an attacker distributing
 * requests across a scaled-out deployment gets a multiple of the nominal limit,
 * and a cold start resets every counter.
 *
 * It is therefore a speed bump, not a guarantee. What it does stop is the
 * common case: one client hammering one endpoint from one place. What it does
 * not stop is a distributed attempt, and it must not be the only thing standing
 * between an attacker and something expensive.
 *
 * The honest fix is a shared store — Upstash Redis or Vercel KV, both of which
 * are a drop-in replacement for `hits` below. That needs an account and a
 * credential, so it is deliberately left as a documented gap rather than
 * pretended away. `PARITY.md` records it.
 *
 * Ordering matters at each call site: check the limit *before* doing the
 * expensive thing (a signature verification, a Cloudinary signing round trip),
 * because a limiter that runs after the work it is protecting protects nothing.
 */

type Window = { count: number; resetAt: number };

const hits = new Map<string, Window>();

/**
 * Drop expired windows.
 *
 * Without this the map grows once per distinct key forever, which for an
 * IP-keyed limiter is an unbounded memory leak. Called on each check, and cheap
 * because it only runs when the map is large enough to be worth sweeping.
 */
function sweep(now: number): void {
  if (hits.size < 1000) return;
  for (const [key, window] of hits) {
    if (window.resetAt <= now) hits.delete(key);
  }
}

export type RateLimitResult = {
  ok: boolean;
  /** Requests left in the current window. */
  remaining: number;
  /** Seconds until the window resets — the value for `Retry-After`. */
  retryAfter: number;
};

/**
 * Consume one request against `key`.
 *
 * Fixed window rather than sliding: a sliding window needs per-request
 * timestamps, and the burst a fixed window permits at a boundary (up to 2x the
 * limit across two adjacent windows) is not worth that cost here.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = hits.get(key);

  if (!existing || existing.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  existing.count += 1;
  const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  if (existing.count > limit) {
    return { ok: false, remaining: 0, retryAfter };
  }

  return { ok: true, remaining: limit - existing.count, retryAfter };
}

/** Reset all windows. Tests only. */
export function __resetRateLimits(): void {
  hits.clear();
}

/**
 * The client's address, as far as it can be trusted.
 *
 * `x-forwarded-for` is client-controlled in general, but behind Vercel's proxy
 * the *first* entry is the real peer and anything a client sends is appended
 * after it. Taking the first entry is therefore correct here and wrong on an
 * origin exposed directly to the internet — noted because this function will
 * eventually be copied somewhere it is not true.
 *
 * Falls back to a constant, which buckets every unidentifiable caller together.
 * That is the safe direction: it over-limits rather than under-limits.
 */
export function clientAddress(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Limits, in one place so they can be reviewed together.
 *
 * Each is generous for a real user and tight enough to matter: the photo limit
 * is well above a therapist uploading a full gallery in one sitting, and the
 * webhook limit is far above PayPal's real delivery rate.
 */
export const LIMITS = {
  /** Cloudinary signing. Each call is a signed credential for an upload. */
  photoUpload: { limit: 30, windowMs: 60_000 },
  /** Webhook deliveries, per source address. Guards the signature check. */
  webhook: { limit: 120, windowMs: 60_000 },
  /** Billing actions — each one reaches a payment provider. */
  billingAction: { limit: 10, windowMs: 60_000 },
} as const;
