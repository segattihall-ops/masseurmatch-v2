import { createServiceClient } from "@masseurmatch/db/client";
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ACTIONS = ["call", "text", "whatsapp", "email", "website", "booking"] as const;
type Action = (typeof ACTIONS)[number];

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 40;
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

export async function POST(request: NextRequest) {
  if (!allow(callerKey(request))) return NextResponse.json({ ok: false }, { status: 429 });
  const body = (await request.json().catch(() => null)) as { profileId?: unknown; action?: unknown } | null;
  const profileId = typeof body?.profileId === "string" ? body.profileId.trim() : "";
  const action = typeof body?.action === "string" ? body.action.trim() : "";
  if (!UUID.test(profileId) || !ACTIONS.includes(action as Action)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  let client;
  try {
    client = createServiceClient();
  } catch {
    return NextResponse.json({ ok: true, recorded: false }, { status: 202 });
  }

  // Contact clicks feed the provider growth dashboard. The RPC is
  // SECURITY DEFINER in production and only increments this one counter.
  await client.rpc("increment_profile_contact_clicks", { p_profile_id: profileId });

  const inquiryType =
    action === "call" ? "call" : action === "email" ? "email" : action === "text" || action === "whatsapp" ? "text" : null;

  if (inquiryType) {
    await client.from("inquiry_analytics").insert({
      profile_id: profileId,
      inquiry_type: inquiryType,
      user_ip: null,
    });
  }

  return NextResponse.json({ ok: true, recorded: true });
}
