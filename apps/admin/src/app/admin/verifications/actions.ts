"use server";

import { createSessionClient, getViewer } from "@masseurmatch/db/auth";
import { createServiceClient } from "@masseurmatch/db/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { DOCUMENT_KINDS, isDocumentKind } from "@/lib/identity-documents";
import { forgetDocument } from "@/lib/identity-storage";

import type { StepState } from "../../onboarding/form-state";

async function requireAdminId(): Promise<string> {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in?next=%2Fverifications");
  if (viewer.role !== "admin") redirect("/not-authorized");
  return viewer.user.id;
}

export async function decideVerification(_prev: StepState, formData: FormData): Promise<StepState> {
  const adminId = await requireAdminId();

  const documentId = String(formData.get("document_id") ?? "").trim();
  const action = String(formData.get("action") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (!documentId) return { error: "No document selected." };
  if (action !== "approve" && action !== "reject") return { error: "Unknown action." };
  if (reason.length < 10) {
    return { error: "Give a reason of at least 10 characters — it goes in the audit log." };
  }

  const service = createServiceClient();

  const { data: document, error: readError } = await service
    .from("profile_documents")
    .select("id,profile_id,storage_path,url,status,document_type,type")
    .eq("id", documentId)
    .maybeSingle();

  if (readError) return { error: `Could not read the document: ${readError.message}` };
  if (!document) return { error: "That document no longer exists." };
  if (document.status !== "pending") {
    return { error: "That document has already been decided." };
  }

  const identityDocument = Boolean(
    document.document_type && isDocumentKind(document.document_type),
  );
  const auditPrefix = identityDocument ? "identity_document" : "credential_document";

  const { error: logError } = await createSessionClient()
    .from("audit_log")
    .insert({
      admin_id: adminId,
      admin_user_id: adminId,
      action: `${auditPrefix}.${action}`,
      target_type: "profile_document",
      target_id: documentId,
      target_profile_id: document.profile_id,
      reason,
      details: {
        document_id: documentId,
        document_type: document.document_type ?? document.type ?? null,
        identity_document: identityDocument,
      },
    });

  if (logError) {
    return {
      error: `Could not write the audit entry, so nothing was changed: ${logError.message}`,
    };
  }

  const nextDocumentStatus = action === "approve" ? "approved" : "rejected";
  const { error: statusError } = await service
    .from("profile_documents")
    .update({ status: nextDocumentStatus })
    .eq("id", documentId)
    .eq("status", "pending");

  if (statusError) return { error: `Logged, but the change failed: ${statusError.message}` };

  if (identityDocument && document.profile_id) {
    if (action === "approve") {
      const requiredKinds = DOCUMENT_KINDS.map((kind) => kind.id);
      const { data: identityDocuments, error: identityReadError } = await service
        .from("profile_documents")
        .select("document_type,status")
        .eq("profile_id", document.profile_id)
        .in("document_type", requiredKinds);

      if (identityReadError) {
        return {
          error: `Document approved, but verification progress could not be checked: ${identityReadError.message}`,
        };
      }

      const approvedKinds = new Set(
        (identityDocuments ?? [])
          .filter((row) => row.status === "approved" && row.document_type)
          .map((row) => row.document_type as string),
      );
      const complete = requiredKinds.every((kind) => approvedKinds.has(kind));

      if (complete) {
        const now = new Date().toISOString();
        const { error: badgeError } = await service
          .from("profiles")
          .update({
            is_verified_identity: true,
            verification_status: "verified",
            identity_verified_at: now,
            updated_at: now,
          })
          .eq("id", document.profile_id);

        if (badgeError) {
          return {
            error: `All documents are approved, but the identity badge failed: ${badgeError.message}`,
          };
        }
      }
    } else {
      const { data: profile, error: profileReadError } = await service
        .from("profiles")
        .select("is_verified_identity")
        .eq("id", document.profile_id)
        .maybeSingle();

      if (profileReadError) {
        return {
          error: `Document rejected, but profile status could not be checked: ${profileReadError.message}`,
        };
      }

      if (!profile?.is_verified_identity) {
        const { error: profileStatusError } = await service
          .from("profiles")
          .update({ verification_status: "rejected", updated_at: new Date().toISOString() })
          .eq("id", document.profile_id);

        if (profileStatusError) {
          return {
            error: `Document rejected, but profile verification status failed: ${profileStatusError.message}`,
          };
        }
      }
    }
  }

  const storedPath = document.storage_path ?? document.url;
  if (storedPath) {
    await forgetDocument(storedPath);
    await service
      .from("profile_documents")
      .update({ storage_path: null, url: null })
      .eq("id", documentId);
  }

  revalidatePath("/verifications");
  revalidatePath("/admin/verifications");
  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true };
}
