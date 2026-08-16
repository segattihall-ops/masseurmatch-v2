import { randomUUID } from "node:crypto";

import { getViewer } from "@masseurmatch/db/auth";
import { NextResponse } from "next/server";

import { createUploadTicket, photoLimitFor } from "@/lib/cloudinary";
import { getOrCreateMyProfile } from "@/lib/profile";
import { LIMITS, rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/uploads/photo — mint a Cloudinary upload ticket.
 *
 * Returns a signature, never a secret. The browser posts the file directly to
 * Cloudinary with it; the bytes never touch this server.
 *
 * The quota is checked here rather than only in the UI, because the UI hiding
 * a button is not a limit. A therapist at their cap gets a 403 whatever they
 * send.
 */

export const runtime = "nodejs"; // node:crypto for the SHA-1 signature
export const dynamic = "force-dynamic";

export async function POST() {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: "Sign in to upload photos." }, { status: 401 });
  }
  if (viewer.role !== "provider" && viewer.role !== "admin") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  // Keyed on the user, not the address: this endpoint requires a session, and
  // limiting by IP would throttle everyone behind one NAT together. Checked
  // before the profile read and the signing round trip, because a limiter that
  // runs after the work it protects protects nothing.
  const limited = rateLimit(
    `photo:${viewer.user.id}`,
    LIMITS.photoUpload.limit,
    LIMITS.photoUpload.windowMs,
  );
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many uploads. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
    );
  }

  let profile;
  try {
    profile = await getOrCreateMyProfile(viewer.user.id);
  } catch {
    return NextResponse.json({ error: "Could not load your profile." }, { status: 500 });
  }

  const limit = photoLimitFor(profile.profile.subscription_tier, profile.profile.photo_limit);
  if (profile.photoCount >= limit) {
    return NextResponse.json(
      { error: `Your plan allows ${limit} photos. Remove one to add another.` },
      { status: 403 },
    );
  }

  try {
    const ticket = createUploadTicket(viewer.user.id, randomUUID());
    return NextResponse.json(ticket, {
      // A signed ticket is single-use and time-bound; never let it be cached.
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    // Deliberately generic: the underlying message names which environment
    // variable is missing, which is not something to hand to a browser.
    return NextResponse.json({ error: "Photo upload is not configured." }, { status: 503 });
  }
}
