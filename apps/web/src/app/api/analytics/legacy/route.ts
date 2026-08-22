import { createServiceClient } from "@masseurmatch/db/client";
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 60;
const seen = new Map<string, { count: number; resetAt: number }>();
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function callerKey(request: NextRequest): string {
  const ip =
    (request.headers.get("x-forwarded-for") ?? "unknown").split(",")[0]?.trim() ?? "unknown";
  let hash = 0;
  for (let i = 0; i < ip.length; i += 1) hash = (hash * 31 + ip.charCodeAt(i)) | 0;
  return String(hash);
}

function allow(key: string): boolean {
  const now = Date.now();
  const entry = seen.get(key);
  if (!entry || now > entry.resetAt) {
    seen.set(key, { count: 1, resetAt: now + WINDOW_MS });
    if (seen.size > 5_000) for (const [k, value] of seen) if (now > value.resetAt) seen.delete(k);
    return true;
  }
  entry.count += 1;
  return entry.count <= MAX_PER_WINDOW;
}

function text(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, max);
  return trimmed || null;
}

function compactFilters(value: unknown): Record<string, string | boolean | number> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const out: Record<string, string | boolean | number> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>).slice(0, 30)) {
    if (typeof raw === "string") out[key.slice(0, 60)] = raw.slice(0, 200);
    else if (typeof raw === "boolean" || typeof raw === "number") out[key.slice(0, 60)] = raw;
  }
  return out;
}

export async function POST(request: NextRequest) {
  if (!allow(callerKey(request))) return NextResponse.json({ ok: false }, { status: 429 });

  const body = (await request.json().catch(() => null)) as {
    type?: unknown;
    data?: Record<string, unknown>;
  } | null;
  if (!body || !body.data) return NextResponse.json({ ok: false }, { status: 400 });

  let client;
  try {
    client = createServiceClient();
  } catch {
    return NextResponse.json({ ok: true, recorded: false }, { status: 202 });
  }

  if (body.type === "search") {
    const query = text(body.data.query, 300);
    if (!query) return NextResponse.json({ ok: false }, { status: 400 });
    const { error } = await client.from("search_analytics").insert({
      query,
      city: text(body.data.city, 120),
      state: text(body.data.state, 120),
      zip_code: text(body.data.zip_code, 20),
      filters: compactFilters(body.data.filters),
      user_ip: null,
    });
    return NextResponse.json({ ok: !error, recorded: !error }, { status: error ? 500 : 200 });
  }

  if (body.type === "inquiry") {
    const profileId = text(body.data.profile_id, 64);
    const inquiryType = text(body.data.inquiry_type, 40);
    if (
      !profileId ||
      !UUID.test(profileId) ||
      !["call", "text", "email", "contact_form"].includes(inquiryType ?? "")
    ) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    const { error } = await client.from("inquiry_analytics").insert({
      profile_id: profileId,
      inquiry_type: inquiryType,
      technique_requested: text(body.data.technique_requested, 120),
      session_type: text(body.data.session_type, 40),
      user_city: text(body.data.user_city, 120),
      user_state: text(body.data.user_state, 120),
      user_zip: text(body.data.user_zip, 20),
      session_id: text(body.data.session_id, 120),
      user_ip: null,
    });
    return NextResponse.json({ ok: !error, recorded: !error }, { status: error ? 500 : 200 });
  }

  return NextResponse.json({ ok: false }, { status: 400 });
}
