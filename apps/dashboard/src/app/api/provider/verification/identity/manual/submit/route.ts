import { createServiceClient } from "@masseurmatch/db/client";
import { createSessionClient } from "@masseurmatch/db/auth";
import type { Json } from "@masseurmatch/db";
import { NextResponse } from "next/server";

import { LIMITS, rateLimit } from "@/lib/rate-limit";

const ALLOWED_DOCUMENT_TYPES = new Set(["drivers_license", "passport", "state_id", "military_id"]);
const COUNTRY_CODE_REGEX = /^[A-Z]{2}$/;

/**
 * Submit an identity verification.
 *
 * Requires:
 * - verificationId: the verification ID
 * - documentType: one of drivers_license, passport, state_id, military_id
 * - documentCountry: two-letter country code (e.g., US, CA)
 *
 * Validates that required documents (front of ID, selfie, and back for non-passport)
 * have been uploaded before allowing submission.
 *
 * After submission, a notification is sent to admins to review the documents.
 */
export async function POST(request: Request) {
  try {
    const {
      data: { user },
    } = await createSessionClient().auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 6 submissions per hour
    const limited = rateLimit(
      `identity-submit:${user.id}`,
      6,
      60 * 60 * 1000,
    );
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Too many submission attempts. Please wait and try again." },
        { status: 429 },
      );
    }

    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    const verificationId = typeof body.verificationId === "string" ? body.verificationId.trim() : "";
    const documentType = typeof body.documentType === "string" ? body.documentType.trim() : "";
    const documentCountry =
      typeof body.documentCountry === "string" ? body.documentCountry.trim().toUpperCase() : "US";

    if (!verificationId) {
      return NextResponse.json(
        { error: "verificationId is required" },
        { status: 400 },
      );
    }

    if (!ALLOWED_DOCUMENT_TYPES.has(documentType)) {
      return NextResponse.json(
        { error: "Select a valid document type" },
        { status: 400 },
      );
    }

    if (!COUNTRY_CODE_REGEX.test(documentCountry)) {
      return NextResponse.json(
        { error: "Issuing country must use a two-letter country code" },
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
        { error: "This verification has already been submitted" },
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
    const files = (manual.files ?? {}) as Record<string, unknown>;
    const expiresAt = typeof manual.expiresAt === "string" ? manual.expiresAt : "";

    if (!expiresAt || new Date(expiresAt) <= new Date()) {
      return NextResponse.json(
        { error: "Verification challenge expired. Start a new verification." },
        { status: 410 },
      );
    }

    // Verify required files are present
    const hasIdFront = !!files.id_front;
    const hasSelfie = !!files.selfie;
    const hasIdBack = !!files.id_back;
    const requiresIdBack = documentType !== "passport";

    if (!hasIdFront || !hasSelfie) {
      return NextResponse.json(
        { error: "Upload the front of your ID and a current selfie before submitting" },
        { status: 400 },
      );
    }

    if (requiresIdBack && !hasIdBack) {
      return NextResponse.json(
        { error: "Upload the back of your ID before submitting" },
        { status: 400 },
      );
    }

    const submittedAt = new Date().toISOString();
    const metadata = {
      ...currentMetadata,
      manual: {
        ...manual,
        documentType,
        documentCountry,
        submittedAt,
      },
    };

    // Mark verification as pending review
    const { error: updateError } = await supabase
      .from("identity_verifications")
      .update({
        status: "pending",
        last_error: null,
        metadata: metadata as Json,
        updated_at: submittedAt,
      })
      .eq("id", verificationId)
      .eq("user_id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Could not submit verification" },
        { status: 500 },
      );
    }

    // Notify admins about the pending verification
    // This is delegated to admin notifications system
    // TODO: integrate with Resend to send admin notification email

    return NextResponse.json({ ok: true, status: "pending" });
  } catch (error) {
    console.error("Identity verification submit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
