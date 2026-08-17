import { createServiceClient } from "@masseurmatch/db/client";
import { NextResponse, type NextRequest } from "next/server";

/**
 * POST /api/views — record that someone looked at a profile.
 *
 * This app had no API routes at all; this is the first, and it exists because
 * nothing in v2 wrote to `profile_view_analytics`. The old site still does, so
 * the dashboard shows real numbers today — and they would freeze on the day the
 * domain moves. A view counter that silently stops is worse than none, because
 * a therapist reads the flat line as "nobody is looking at me".
 *
 * Runs as `service_role`. `anon` holds INSERT on the table but the insert policy
 * checks `false`, so a browser cannot write to it directly — which is correct,
 * and is why this route exists rather than a client-side insert.
 *
 * ---------------------------------------------------------------------------
 * What is deliberately not recorded
 * ---------------------------------------------------------------------------
 * `user_ip`. The column exists and the old site fills it. Nothing this product
 * shows needs it: every figure on the dashboard is an aggregate, and a table of
 * visitor IP addresses is a liability kept for no benefit. It is left null.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * A speed bump, not a guarantee.
 *
 * The endpoint is unauthenticated by necessity — visitors are anonymous — so
 * view counts are inflatable by anyone willing to write a loop. This bounds the
 * cheap version of that. Per-instance and in memory, so it resets on deploy and
 * does not coordinate across regions; the honest framing is that it stops
 * accidents and casual abuse, not a determined one.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 30;
const seen = new Map<string, { count: number; resetAt: number }>();

function allow(key: string, now: number): boolean {
  const entry = seen.get(key);
  if (!entry || now > entry.resetAt) {
    seen.set(key, { count: 1, resetAt: now + WINDOW_MS });
    // Bound the map so a stream of distinct keys cannot grow it without limit.
    if (seen.size > 5_000) {
      for (const [k, v] of seen) if (now > v.resetAt) seen.delete(k);
    }
    return true;
  }
  entry.count += 1;
  return entry.count <= MAX_PER_WINDOW;
}

/** Caller identity for rate limiting only — hashed, never stored. */
function callerKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || "unknown";
  let hash = 0;
  for (let i = 0; i < ip.length; i += 1) hash = (hash * 31 + ip.charCodeAt(i)) | 0;
  return String(hash);
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function text(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, max);
  return trimmed.length > 0 ? trimmed : null;
}

export async function POST(request: NextRequest) {
  if (!allow(callerKey(request), Date.now())) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const payload = (body ?? {}) as Record<string, unknown>;
  const profileId = text(payload.profileId, 64);
  if (!profileId || !UUID.test(profileId)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  let supabase;
  try {
    supabase = createServiceClient();
  } catch {
    // Inert without credentials, the same way Turnstile and Sentry are. A
    // preview deploy with no service key should render profiles, not 500 on
    // every one of them.
    return NextResponse.json({ ok: true, recorded: false });
  }

  const { error } = await supabase.from("profile_view_analytics").insert({
    profile_id: profileId,
    source: text(payload.source, 40) ?? "direct",
    referrer: text(payload.referrer, 500),
    session_id: text(payload.sessionId, 64),
    // Left null on purpose — see the note at the top of this file.
    user_ip: null,
  });

  if (error) {
    // A failed view record must never surface to a visitor reading a profile.
    return NextResponse.json({ ok: true, recorded: false });
  }

  return NextResponse.json({ ok: true, recorded: true });
}
