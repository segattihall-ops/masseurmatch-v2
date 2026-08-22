import { randomUUID } from "node:crypto";

import { getViewer } from "@masseurmatch/db/auth";
import { createServiceClient } from "@masseurmatch/db/client";
import { NextResponse, type NextRequest } from "next/server";

import { createVideoUploadTicket, verifyUploadedVideoAsset } from "@/lib/cloudinary";
import { getOrCreateMyProfile } from "@/lib/profile";
import { LIMITS, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function viewerProfile() {
  const viewer = await getViewer();
  if (!viewer)
    return {
      error: NextResponse.json({ error: "Sign in to manage your video." }, { status: 401 }),
    };
  if (viewer.role !== "provider" && viewer.role !== "admin") {
    return { error: NextResponse.json({ error: "Not authorized." }, { status: 403 }) };
  }
  const loaded = await getOrCreateMyProfile(viewer.user.id);
  return { viewer, profile: loaded.profile };
}

export async function POST() {
  const loaded = await viewerProfile();
  if (loaded.error || !loaded.viewer) return loaded.error!;
  const limited = rateLimit(
    `video:${loaded.viewer.user.id}`,
    LIMITS.photoUpload.limit,
    LIMITS.photoUpload.windowMs,
  );
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many upload attempts. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
    );
  }
  try {
    return NextResponse.json(createVideoUploadTicket(loaded.viewer.user.id, randomUUID()), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ error: "Video upload is not configured." }, { status: 503 });
  }
}

export async function PATCH(request: NextRequest) {
  const loaded = await viewerProfile();
  if (loaded.error || !loaded.viewer || !loaded.profile) return loaded.error!;
  let body: { publicId?: string };
  try {
    body = (await request.json()) as { publicId?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const publicId = String(body.publicId ?? "").trim();
  if (!publicId) return NextResponse.json({ error: "Missing video id." }, { status: 400 });

  try {
    const asset = await verifyUploadedVideoAsset(loaded.viewer.user.id, publicId);
    const { error } = await createServiceClient()
      .from("profiles")
      .update({ presentation_video_url: asset.url, updated_at: new Date().toISOString() })
      .eq("id", loaded.profile.id);
    if (error) throw error;
    return NextResponse.json({ ok: true, url: asset.url, duration: asset.duration });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save that video." },
      { status: 400 },
    );
  }
}

export async function DELETE() {
  const loaded = await viewerProfile();
  if (loaded.error || !loaded.profile) return loaded.error!;
  const { error } = await createServiceClient()
    .from("profiles")
    .update({ presentation_video_url: null, updated_at: new Date().toISOString() })
    .eq("id", loaded.profile.id);
  return error
    ? NextResponse.json({ error: "Could not remove the video." }, { status: 500 })
    : NextResponse.json({ ok: true });
}
