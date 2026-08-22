"use server";

import { createServiceClient } from "@masseurmatch/db/client";
import type { Json } from "@masseurmatch/db/types";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/guards";

async function writeAudit(
  adminId: string,
  action: string,
  targetType: string,
  targetId: string,
  reason: string,
  details: Json = {},
) {
  const { error } = await createServiceClient().from("audit_log").insert({
    admin_id: adminId,
    admin_user_id: adminId,
    action,
    target_type: targetType,
    target_id: targetId,
    reason,
    details,
  });
  if (error) throw new Error(`Could not write audit log: ${error.message}`);
}

export async function moderatePhoto(formData: FormData): Promise<void> {
  const viewer = await requireAdmin("/admin/photos");
  const photoId = String(formData.get("photo_id") ?? "").trim();
  const action = String(formData.get("action") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  if (!photoId) throw new Error("Photo id is required.");
  if (action !== "approve" && action !== "reject") throw new Error("Invalid photo action.");
  if (action === "reject" && reason.length < 10) {
    throw new Error("A rejection reason of at least 10 characters is required.");
  }

  const service = createServiceClient();
  const { data: photo, error: readError } = await service
    .from("profile_photos")
    .select("id,profile_id,moderation_status")
    .eq("id", photoId)
    .maybeSingle();
  if (readError) throw new Error(`Could not load photo: ${readError.message}`);
  if (!photo) throw new Error("Photo not found.");
  if (photo.moderation_status !== "pending") {
    throw new Error("Photo has already been reviewed.");
  }

  const auditReason = reason || "Photo reviewed and approved by admin.";
  await writeAudit(viewer.user.id, `photo.${action}`, "profile_photo", photoId, auditReason, {
    profile_id: photo.profile_id,
  });

  const nextStatus = action === "approve" ? "approved" : "rejected";
  const { error: updateError } = await service
    .from("profile_photos")
    .update({
      moderation_status: nextStatus,
      moderation_reason: auditReason,
      updated_at: new Date().toISOString(),
    })
    .eq("id", photoId)
    .eq("moderation_status", "pending");
  if (updateError) throw new Error(`Could not update photo: ${updateError.message}`);

  await service
    .from("moderation_queue")
    .update({
      status: nextStatus,
      admin_reason: auditReason,
      resolved_by: viewer.user.id,
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("item_type", "photo")
    .eq("target_id", photoId)
    .eq("status", "pending");

  revalidatePath("/admin/photos");
  revalidatePath("/admin/moderation");
  revalidatePath("/admin");
}

export async function updateReport(formData: FormData): Promise<void> {
  const viewer = await requireAdmin("/admin/profile-reports");
  const source = String(formData.get("source") ?? "");
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const notes = String(formData.get("notes") ?? "")
    .trim()
    .slice(0, 2000);

  if (!id) throw new Error("Report id is required.");
  const service = createServiceClient();
  const now = new Date().toISOString();

  if (source === "profile_report") {
    if (!new Set(["open", "reviewing", "actioned", "dismissed"]).has(status)) {
      throw new Error("Invalid report status.");
    }
    const resolved = status === "actioned" || status === "dismissed";
    await writeAudit(
      viewer.user.id,
      "profile_report.updated",
      "profile_report",
      id,
      notes || status,
      { status },
    );
    const { error } = await service
      .from("profile_reports")
      .update({
        status,
        admin_notes: notes || null,
        resolved_by: resolved ? viewer.user.id : null,
        resolved_at: resolved ? now : null,
        updated_at: now,
      })
      .eq("id", id);
    if (error) throw new Error(`Could not update report: ${error.message}`);
  } else if (source === "complaint") {
    if (!new Set(["pending", "resolved", "dismissed"]).has(status)) {
      throw new Error("Invalid complaint status.");
    }
    const resolved = status === "resolved" || status === "dismissed";
    await writeAudit(viewer.user.id, "complaint.updated", "complaint", id, notes || status, {
      status,
    });
    const { error } = await service
      .from("complaints")
      .update({
        status,
        admin_notes: notes || null,
        reviewed_by: viewer.user.id,
        reviewed_at: now,
        resolved_at: resolved ? now : null,
        updated_at: now,
      })
      .eq("id", id);
    if (error) throw new Error(`Could not update complaint: ${error.message}`);
  } else {
    throw new Error("Unknown report source.");
  }

  revalidatePath("/admin/profile-reports");
  revalidatePath("/admin/reports");
  revalidatePath("/admin");
}

function manualMetadata(value: unknown): {
  files: Record<string, { path?: string }>;
  [key: string]: unknown;
} {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { files: {} };
  const root = value as Record<string, unknown>;
  const manual = root.manual;
  if (!manual || typeof manual !== "object" || Array.isArray(manual)) return { files: {} };
  const parsed = manual as Record<string, unknown>;
  const files =
    parsed.files && typeof parsed.files === "object" && !Array.isArray(parsed.files)
      ? (parsed.files as Record<string, { path?: string }>)
      : {};
  return { ...parsed, files };
}

export async function decideManualIdentity(formData: FormData): Promise<void> {
  const viewer = await requireAdmin("/admin/verifications/manual");
  const id = String(formData.get("verification_id") ?? "").trim();
  const decision = String(formData.get("decision") ?? "").trim();
  const reason = String(formData.get("reason") ?? "")
    .trim()
    .slice(0, 1000);

  if (!id) throw new Error("Verification id is required.");
  if (decision !== "approve" && decision !== "reject") throw new Error("Invalid decision.");
  if (reason.length < 10) {
    throw new Error("A review reason of at least 10 characters is required.");
  }

  const service = createServiceClient();
  const { data: verification, error: readError } = await service
    .from("identity_verifications")
    .select("id,user_id,profile_id,provider,status,metadata")
    .eq("id", id)
    .maybeSingle();
  if (readError) throw new Error(`Could not load verification: ${readError.message}`);
  if (!verification || verification.provider !== "manual") {
    throw new Error("Manual verification not found.");
  }
  if (verification.status !== "pending") {
    throw new Error("Verification has already been reviewed.");
  }

  await writeAudit(
    viewer.user.id,
    `identity.manual.${decision}`,
    "identity_verification",
    id,
    reason,
    { user_id: verification.user_id, profile_id: verification.profile_id },
  );

  const current = (verification.metadata ?? {}) as Record<string, unknown>;
  const manual = manualMetadata(current);
  const paths = Object.values(manual.files)
    .map((entry) => entry?.path)
    .filter((path): path is string => Boolean(path));
  const now = new Date().toISOString();
  const nextStatus = decision === "approve" ? "verified" : "requires_input";
  const reviewedMetadata = {
    ...current,
    manual: {
      ...manual,
      reviewedAt: now,
      reviewedBy: viewer.user.id,
      decision,
      reviewReason: reason,
    },
  };

  // Persist the decision before deleting any sensitive file. Cleanup is last and
  // never allowed to erase the only copy before the review outcome is durable.
  const { error: verificationError } = await service
    .from("identity_verifications")
    .update({
      status: nextStatus,
      last_error: decision === "reject" ? reason : null,
      metadata: reviewedMetadata as Json,
      updated_at: now,
    })
    .eq("id", id)
    .eq("status", "pending");
  if (verificationError) {
    throw new Error(`Could not finalize verification: ${verificationError.message}`);
  }

  if (verification.profile_id) {
    if (decision === "approve") {
      const { error: profileError } = await service
        .from("profiles")
        .update({
          is_verified_identity: true,
          verification_status: "verified",
          identity_verified_at: now,
          updated_at: now,
        })
        .eq("id", verification.profile_id);
      if (profileError) {
        throw new Error(`Verification saved, but profile status failed: ${profileError.message}`);
      }
    } else {
      // A failed manual attempt must not revoke a badge that may already have
      // been earned through another verification method (Stripe or V2 docs).
      const { data: profile, error: profileReadError } = await service
        .from("profiles")
        .select("is_verified_identity")
        .eq("id", verification.profile_id)
        .maybeSingle();
      if (profileReadError) {
        throw new Error(
          `Verification saved, but profile status could not be checked: ${profileReadError.message}`,
        );
      }

      if (!profile?.is_verified_identity) {
        const { error: profileError } = await service
          .from("profiles")
          .update({ verification_status: "rejected", updated_at: now })
          .eq("id", verification.profile_id);
        if (profileError) {
          throw new Error(`Verification saved, but profile status failed: ${profileError.message}`);
        }
      }
    }
  }

  if (paths.length > 0) {
    const { error: storageError } = await service.storage.from("identity-documents").remove(paths);
    if (storageError) {
      console.error("[admin] manual identity cleanup failed", {
        verificationId: id,
        message: storageError.message,
      });
    } else {
      const cleanedMetadata = {
        ...reviewedMetadata,
        manual: {
          ...manualMetadata(reviewedMetadata),
          files: {},
          reviewedAt: now,
          reviewedBy: viewer.user.id,
          decision,
          reviewReason: reason,
          documentsDeletedAt: new Date().toISOString(),
        },
      };
      const { error: cleanupMetadataError } = await service
        .from("identity_verifications")
        .update({ metadata: cleanedMetadata as Json, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (cleanupMetadataError) {
        console.error("[admin] identity metadata cleanup failed", {
          verificationId: id,
          message: cleanupMetadataError.message,
        });
      }
    }
  }

  if (verification.user_id) {
    const title =
      decision === "approve"
        ? "Identity verification approved"
        : "Identity verification needs attention";
    const body = decision === "approve" ? "Your identity verification was approved." : reason;
    const { error: notificationError } = await service.from("notifications").insert({
      user_id: verification.user_id,
      title,
      body,
      message: body,
      type: "identity_verification",
      data: { verification_id: id, status: nextStatus },
      is_read: false,
    });
    if (notificationError) {
      console.error("[admin] identity notification failed", {
        verificationId: id,
        message: notificationError.message,
      });
    }
  }

  revalidatePath("/verifications/manual");
  revalidatePath("/verifications");
  revalidatePath("/reports");
  revalidatePath("/");
  revalidatePath("/admin/verifications/manual");
  revalidatePath("/admin/verifications");
  revalidatePath("/admin/reports");
  revalidatePath("/admin");
}
