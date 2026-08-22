import { createServiceClient } from "@masseurmatch/db/client";
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CATEGORIES = ["profile_accuracy", "conduct", "safety", "spam", "other"] as const;
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const seen = new Map<string, { count: number; resetAt: number }>();

function callerKey(request: NextRequest): string {
  const ip = (request.headers.get("x-forwarded-for") ?? "unknown").split(",")[0]?.trim() ?? "unknown";
  let hash = 0;
  for (let i = 0; i < ip.length; i += 1) hash = (hash * 31 + ip.charCodeAt(i)) | 0;
  return String(hash);
}

function allow(key: string): boolean {
  const now = Date.now();
  const entry = seen.get(key);
  if (!entry || now > entry.resetAt) {
    seen.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  entry.count += 1;
  return entry.count <= MAX_PER_WINDOW;
}

function clean(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim().slice(0, max);
  return text || null;
}

export async function POST(request: NextRequest) {
  if (!allow(callerKey(request))) {
    return NextResponse.json({ ok: false, message: "Too many reports. Try again later." }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ ok: false }, { status: 400 });

  const profileId = clean(body.profileId, 64);
  const profileSlug = clean(body.profileSlug, 160);
  const profileName = clean(body.profileName, 160);
  const category = clean(body.category, 40);
  const reason = clean(body.reason, 3000);
  const reporterEmail = clean(body.reporterEmail, 320);

  if (
    !profileId ||
    !UUID.test(profileId) ||
    !profileSlug ||
    !profileName ||
    !category ||
    !CATEGORIES.includes(category as (typeof CATEGORIES)[number]) ||
    !reason ||
    reason.length < 10
  ) {
    return NextResponse.json({ ok: false, message: "Please include a clear reason for the report." }, { status: 400 });
  }

  if (reporterEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reporterEmail)) {
    return NextResponse.json({ ok: false, message: "Enter a valid email or leave it blank." }, { status: 400 });
  }

  let client;
  try {
    client = createServiceClient();
  } catch {
    return NextResponse.json({ ok: false, message: "Reporting is temporarily unavailable." }, { status: 503 });
  }

  const { error } = await client.from("profile_reports").insert({
    profile_id: profileId,
    profile_slug: profileSlug,
    profile_name: profileName,
    category,
    reason,
    reporter_email: reporterEmail,
    status: "open",
    ip_hash: null,
  });

  if (error) return NextResponse.json({ ok: false, message: "We could not submit the report." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
