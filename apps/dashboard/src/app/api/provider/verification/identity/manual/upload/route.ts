import { createServiceClient } from "@masseurmatch/db/client";
import { createSessionClient } from "@masseurmatch/db/auth";
import type { Json } from "@masseurmatch/db";
import { NextResponse } from "next/server";

import { LIMITS, rateLimit } from "@/lib/rate-limit";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_KINDS = new Set(["id_front", "id_back", "selfie"]);
const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function matchesMagicBytes(bytes: Uint8Array, mimeType: string): boolean {
  if (mimeType === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (mimeType === "image/png") {
    const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return bytes.length >= signature.length && signature.every((value, index) => bytes[index] === value);
  }

  if (mimeType === "image/webp") {
    return (
      bytes.length >= 12 &&
      String.fromCharCode(...Array.from(bytes.slice(0, 4))) === "RIFF" &&
      String.fromCharCode(...Array.from(bytes.slice(8, 12))) === "WEBP"
    );
  }

  return false;
}

/**
 * Upload a document for identity verification.
 *
 * Requires:
 * - verificationId: the ID returned from POST /start
 * - kind: one of "id_front", "id_back", "selfie"
 * - file: image file (JPEG, PNG, or WebP, max 8MB)
 *
 * Validates file format by magic bytes to prevent spoofing the MIME type.
 */
export async function POST(request: Request) {
  try {
    const {
      data: { user },
    } = await createSessionClient().auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 12 uploads per 10 minutes
    const limited = rateLimit(
      `identity-upload:${user.id}`,
      12,
      10 * 60 * 1000,
    );
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Too many upload attempts. Please wait and try again." },
        { status: 429 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const verificationId = String(formData.get("verificationId") ?? "").trim();
    const kind = String(formData.get("kind") ?? "").trim();

    if (!verificationId) {
      return NextResponse.json(
        { error: "verificationId is required" },
        { status: 400 },
      );
    }

    if (!ALLOWED_KINDS.has(kind)) {
      return NextResponse.json(
        { error: "Invalid document kind. Use id_front, id_back, or selfie." },
        { status: 400 },
      );
    }

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, or WebP images are allowed" },
        { status: 400 },
      );
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File must be between 1 byte and 8 MB" },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    // Verify the verification exists and is active
    const { data: verification, error: verificationError } = await supabase
      .from("identity_verifications")
      .select("id, user_id, provider, status, metadata")
      .eq("id", verificationId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (verificationError || !verification || verification.provider !== "manual") {
      return NextResponse.json(
        { error: "Verification not found" },
        { status: 404 },
      );
    }

    if (!["not_started", "pending"].includes(verification.status as string)) {
      return NextResponse.json(
        { error: "This verification can no longer accept uploads" },
        { status: 409 },
      );
    }

    const currentMetadata = verification.metadata as Record<string, unknown> | null;
    if (!currentMetadata?.manual) {
      return NextResponse.json(
        { error: "Verification is invalid" },
        { status: 409 },
      );
    }

    const manual = currentMetadata.manual as Record<string, unknown>;
    const expiresAt = typeof manual.expiresAt === "string" ? manual.expiresAt : "";

    if (!expiresAt || new Date(expiresAt) <= new Date()) {
      return NextResponse.json(
        { error: "Verification challenge expired. Start a new verification." },
        { status: 410 },
      );
    }

    // Validate file content matches declared MIME type
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    if (!matchesMagicBytes(bytes, file.type)) {
      return NextResponse.json(
        { error: "The uploaded file content does not match its image format" },
        { status: 400 },
      );
    }

    // Upload to Supabase Storage
    const ext = EXT_MAP[file.type];
    const storagePath = `${user.id}/manual/${verificationId}/${kind}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("identity-documents")
      .upload(storagePath, bytes, { contentType: file.type, upsert: true });

    if (uploadError) {
      return NextResponse.json(
        { error: "Upload failed. Please try again." },
        { status: 500 },
      );
    }

    // Update metadata to track the uploaded file
    const files = (manual.files ?? {}) as Record<string, unknown>;
    const metadata = {
      ...currentMetadata,
      manual: {
        ...manual,
        files: {
          ...files,
          [kind]: {
            path: storagePath,
            mimeType: file.type,
            size: file.size,
            uploadedAt: new Date().toISOString(),
          },
        },
      },
    };

    const { error: updateError } = await supabase
      .from("identity_verifications")
      .update({
        metadata: metadata as Json,
        updated_at: new Date().toISOString(),
      })
      .eq("id", verificationId)
      .eq("user_id", user.id);

    if (updateError) {
      // Rollback: remove the file we just uploaded
      await supabase.storage
        .from("identity-documents")
        .remove([storagePath]);
      return NextResponse.json(
        { error: "Could not save file information" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, kind });
  } catch (error) {
    console.error("Identity verification upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
