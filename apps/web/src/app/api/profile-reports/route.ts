import { createHash } from "node:crypto";

import { getUser } from "@masseurmatch/db/auth";
import { createServiceClient } from "@masseurmatch/db/client";
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CATEGORIES = new Set([
  "profile_accuracy",
  "conduct",
  "safety",
  "spam",
  "sexual_solicitation",
  "trafficking",
  "prohibited_content",
  "csam",
  "fake_or_stolen",
  "harassment_safety",
  "other",
]);
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function clean(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const text = value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, max);
  return text || null;
}

function requestIpHash(request: NextRequest): string | null {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "";
  return ip ? createHash("sha256").update(ip).digest("hex").slice(0, 32) : null;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ ok: false }, { status: 400 });

  const profileId = clean(body.profileId, 64);
  const category = clean(body.category, 80);
  const reason = clean(body.reason, 3000);
  const reporterEmail = clean(body.reporterEmail, 320)?.toLowerCase() ?? null;

  if (
    !profileId ||
    !UUID.test(profileId) ||
    !category ||
    !CATEGORIES.has(category) ||
    !reason ||
    reason.length < 10
  ) {
    return NextResponse.json(
      { ok: false, message: "Please include a clear reason for the report." },
      { status: 400 },
    );
  }

  if (reporterEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reporterEmail)) {
    return NextResponse.json(
      { ok: false, message: "Enter a valid email or leave it blank." },
      { status: 400 },
    );
  }

  let client;
  try {
    client = createServiceClient();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Reporting is temporarily unavailable." },
      { status: 503 },
    );
  }

  const ipHash = requestIpHash(request);
  if (ipHash) {
    const since = new Date(Date.now() - WINDOW_MS).toISOString();
    const { count, error: countError } = await client
      .from("profile_reports")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", since);

    if (countError) {
      return NextResponse.json(
        { ok: false, message: "We could not submit the report." },
        { status: 500 },
      );
    }
    if ((count ?? 0) >= MAX_PER_WINDOW) {
      return NextResponse.json(
        { ok: false, message: "Too many reports. Try again later." },
        { status: 429, headers: { "Retry-After": "3600" } },
      );
    }
  }

  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("id,slug,display_name,full_name,profile_status,visibility_status,is_suspended,is_banned")
    .eq("id", profileId)
    .maybeSingle();

  if (
    profileError ||
    !profile ||
    profile.profile_status !== "approved" ||
    profile.visibility_status !== "public" ||
    profile.is_suspended === true ||
    profile.is_banned === true
  ) {
    return NextResponse.json(
      { ok: false, message: "That public profile is unavailable." },
      { status: 404 },
    );
  }

  const reporter = await getUser().catch(() => null);
  const { error } = await client.from("profile_reports").insert({
    profile_id: profile.id,
    profile_slug: profile.slug,
    profile_name: profile.display_name ?? profile.full_name ?? "Provider",
    category,
    reason,
    reporter_email: reporterEmail,
    reporter_user_id: reporter?.id ?? null,
    status: "open",
    ip_hash: ipHash,
  });

  if (error) {
    return NextResponse.json(
      { ok: false, message: "We could not submit the report." },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true });
}
