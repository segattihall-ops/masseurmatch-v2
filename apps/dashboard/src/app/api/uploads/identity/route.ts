import { getViewer } from "@masseurmatch/db/auth";
import { NextResponse } from "next/server";

import {
  ALLOWED_DOCUMENT_TYPES,
  isDocumentKind,
  MAX_DOCUMENT_BYTES,
} from "@/lib/identity-documents";
import { createDocumentUploadTicket } from "@/lib/identity-storage";
import { LIMITS, rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/uploads/identity — mint a one-shot upload URL for one document.
 *
 * Mirrors `/api/uploads/photo`: the browser gets a signed URL and sends the
 * bytes straight to storage, so a government ID never passes through this
 * server. See `@/lib/identity-storage` for why.
 *
 * What is checked here is what the caller *claims* it is about to send. The
 * bucket enforces the same limits on what actually arrives, which is the check
 * that counts — this one just fails early and says why.
 */

// crypto.randomUUID and the storage client. Stated literally: Next reads route
// segment config statically, so a re-export is invisible to it.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: "Sign in to verify your identity." }, { status: 401 });
  }
  if (viewer.role !== "provider" && viewer.role !== "admin") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  // Keyed on the account: this endpoint needs a session, and an address-shaped
  // key would throttle a whole building together. Before the storage round
  // trip, which is the work being protected.
  const limited = rateLimit(
    `identity:${viewer.user.id}`,
    LIMITS.photoUpload.limit,
    LIMITS.photoUpload.windowMs,
  );
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many uploads. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
    );
  }

  let body: { kind?: unknown; contentType?: unknown; size?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const kind = String(body.kind ?? "");
  const contentType = String(body.contentType ?? "");
  const size = Number(body.size ?? 0);

  if (!isDocumentKind(kind)) {
    return NextResponse.json({ error: "Choose which document this is." }, { status: 400 });
  }
  if (!(ALLOWED_DOCUMENT_TYPES as readonly string[]).includes(contentType)) {
    return NextResponse.json(
      { error: "Upload a photo or a PDF — JPEG, PNG, WebP, HEIC or PDF." },
      { status: 400 },
    );
  }
  if (!Number.isFinite(size) || size <= 0 || size > MAX_DOCUMENT_BYTES) {
    return NextResponse.json(
      { error: `That file is too large. The limit is ${MAX_DOCUMENT_BYTES / (1024 * 1024)}MB.` },
      { status: 400 },
    );
  }

  try {
    const ticket = await createDocumentUploadTicket(viewer.user.id, kind, contentType);
    return NextResponse.json(ticket);
  } catch (cause) {
    console.error("[identity] could not issue an upload ticket", cause);
    return NextResponse.json(
      { error: "We could not start the upload. Please try again." },
      { status: 503 },
    );
  }
}
