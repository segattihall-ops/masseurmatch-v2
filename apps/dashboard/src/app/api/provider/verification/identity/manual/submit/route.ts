import { createServiceClient } from "@masseurmatch/db/client";
import { createSessionClient } from "@masseurmatch/db/auth";
import type { Json } from "@masseurmatch/db";
import { NextResponse } from "next/server";

import { rateLimit } from "@/lib/rate-limit";

const ALLOWED_DOCUMENT_TYPES = new Set(["drivers_license", "passport", "state_id", "military_id"]);
const COUNTRY_CODE_REGEX = /^[A-Z]{2}$/;

/**
 * Mail the review queue that a submission is waiting.
 *
 * Carries no identity data — not the documents, not the challenge code, not the
 * therapist's name. Only the verification id and a link, because the reviewer
 * has to authenticate into the admin app to see anything, and an inbox is the
 * wrong place for evidence we delete on purpose after review.
 *
 * Returns silently when the mail credentials are unset, which is the normal
 * state in local and preview environments.
 */
async function notifyAdminOfSubmission(verificationId: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_NOTIFICATION_EMAIL;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !to || !from) return;

  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL ?? "";
  const reviewLink = adminUrl
    ? `${adminUrl.replace(/\/$/, "")}/admin/verifications/manual`
    : "/admin/verifications/manual";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      // One mail per verification, however many times this route is retried.
      "Idempotency-Key": `identity-submit/${verificationId}`,
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Identity verification awaiting manual review",
      html:
        `<div style="font-family:Arial,Helvetica,sans-serif;color:#111827;max-width:640px;margin:auto">` +
        `<h1 style="font-size:18px">Identity verification awaiting review</h1>` +
        `<p>A therapist has submitted documents for manual identity review.</p>` +
        `<p style="color:#6b7280;font-size:13px">Verification ID: ${verificationId}</p>` +
        `<p><a href="${reviewLink}" style="color:#8B1E2D;font-weight:700">Open the review queue</a></p>` +
        `<p style="color:#6b7280;font-size:12px">Documents are viewable only inside the admin app, ` +
        `through links that expire, and are deleted once a decision is recorded.</p>` +
        `</div>`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend returned ${response.status}`);
  }
}

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
    const limited = rateLimit(`identity-submit:${user.id}`, 6, 60 * 60 * 1000);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Too many submission attempts. Please wait and try again." },
        { status: 429 },
      );
    }

    const body = await request.json().catch(() => ({}) as Record<string, unknown>);
    const verificationId =
      typeof body.verificationId === "string" ? body.verificationId.trim() : "";
    const documentType = typeof body.documentType === "string" ? body.documentType.trim() : "";
    const documentCountry =
      typeof body.documentCountry === "string" ? body.documentCountry.trim().toUpperCase() : "US";

    if (!verificationId) {
      return NextResponse.json({ error: "verificationId is required" }, { status: 400 });
    }

    if (!ALLOWED_DOCUMENT_TYPES.has(documentType)) {
      return NextResponse.json({ error: "Select a valid document type" }, { status: 400 });
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
      return NextResponse.json({ error: "Verification not found" }, { status: 404 });
    }

    if (!["not_started", "pending"].includes(verification.status as string)) {
      return NextResponse.json(
        { error: "This verification has already been submitted" },
        { status: 409 },
      );
    }

    const currentMetadata = verification.metadata as Record<string, unknown> | null;
    if (!currentMetadata?.manual) {
      return NextResponse.json({ error: "Verification is invalid" }, { status: 409 });
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
      return NextResponse.json({ error: "Could not submit verification" }, { status: 500 });
    }

    // Tell a human there is something to review. Best-effort on purpose: the
    // submission is already durable and visible in the queue, so a mail outage
    // must not fail the request or invite a duplicate submission.
    await notifyAdminOfSubmission(verificationId).catch((error: unknown) => {
      console.error("[identity-submit] admin notification failed", error);
    });

    return NextResponse.json({ ok: true, status: "pending" });
  } catch (error) {
    console.error("Identity verification submit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
