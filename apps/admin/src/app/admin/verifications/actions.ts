"use server";

import { createSessionClient, getViewer } from "@masseurmatch/db/auth";
import { createServiceClient } from "@masseurmatch/db/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isDocumentKind } from "@/lib/identity-documents";
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
  const submittedReason = String(formData.get("reason") ?? "").trim();

  if (!documentId) return { error: "No document selected." };
  if (action !== "approve" && action !== "reject") return { error: "Unknown action." };
  if (action === "reject" && submittedReason.length < 10) {
    return { error: "Give a rejection reason of at least 10 characters." };
  }

  const reason =
    submittedReason || "Professional license details matched the submitted credential image.";
  const service = createServiceClient() as any;
  const { data: document, error: readError } = await service
    .from("profile_documents")
    .select(
      "id,profile_id,storage_path,url,status,document_type,type,holder_name,license_type,license_number,issuing_authority,jurisdiction,issued_on,expires_on",
    )
    .eq("id", documentId)
    .maybeSingle();

  if (readError) return { error: `Could not read the document: ${readError.message}` };
  if (!document) return { error: "That document no longer exists." };
  if (document.status !== "pending") return { error: "That document has already been decided." };

  const kind = document.document_type ?? document.type ?? "";
  if (isDocumentKind(kind)) {
    return { error: "Government ID verification is manual-only. Use the Manual ID queue." };
  }

  if (kind === "professional_license" && action === "approve") {
    const missing = [
      document.holder_name,
      document.license_type,
      document.license_number,
      document.issuing_authority,
      document.jurisdiction,
      document.storage_path ?? document.url,
    ].some((value) => !String(value ?? "").trim());
    if (missing) return { error: "This license is missing required fields or its supporting image." };
    if (document.expires_on && document.expires_on < new Date().toISOString().slice(0, 10)) {
      return { error: "This license is already expired and cannot be approved." };
    }
  }

  const number = String(document.license_number ?? "").replace(/\s+/g, "");
  const { error: logError } = await createSessionClient()
    .from("audit_log")
    .insert({
      admin_id: adminId,
      admin_user_id: adminId,
      action: `credential_document.${action}`,
      target_type: "profile_document",
      target_id: documentId,
      target_profile_id: document.profile_id,
      reason,
      details: {
        document_id: documentId,
        document_type: kind || null,
        identity_document: false,
        license_type: document.license_type ?? null,
        jurisdiction: document.jurisdiction ?? null,
        issuing_authority: document.issuing_authority ?? null,
        license_number_last4: number ? number.slice(-4) : null,
        expires_on: document.expires_on ?? null,
      },
    });
  if (logError) return { error: `Could not write the audit entry: ${logError.message}` };

  const now = new Date().toISOString();
  const update =
    action === "approve"
      ? { status: "approved", reviewed_by: adminId, verified_at: now, rejection_reason: null, updated_at: now }
      : { status: "rejected", reviewed_by: adminId, verified_at: null, rejection_reason: reason, updated_at: now };

  const { error: statusError } = await service
    .from("profile_documents")
    .update(update)
    .eq("id", documentId)
    .eq("status", "pending");
  if (statusError) return { error: `Logged, but the change failed: ${statusError.message}` };

  if (action === "reject") {
    const storedPath = document.storage_path ?? document.url;
    if (storedPath) {
      await forgetDocument(storedPath);
      await service
        .from("profile_documents")
        .update({ storage_path: null, url: null, updated_at: new Date().toISOString() })
        .eq("id", documentId);
    }
  }

  revalidatePath("/verifications");
  revalidatePath("/admin/verifications");
  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true };
}
