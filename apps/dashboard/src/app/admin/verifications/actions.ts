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
  if (!viewer) redirect("/sign-in?next=%2Fadmin%2Fverifications");
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

  const kind = document.document_type ?? document.type ?? "";
  if (isDocumentKind(kind)) {
    return {
      error:
        "Government ID verification is manual-only. Use the Manual ID queue in the standalone Admin.",
    };
  }

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
      },
    });

  if (logError) {
    return {
      error: `Could not write the audit entry, so nothing was changed: ${logError.message}`,
    };
  }

  const { error: statusError } = await service
    .from("profile_documents")
    .update({ status: action === "approve" ? "approved" : "rejected" })
    .eq("id", documentId)
    .eq("status", "pending");

  if (statusError) return { error: `Logged, but the change failed: ${statusError.message}` };

  const storedPath = document.storage_path ?? document.url;
  if (storedPath) {
    await forgetDocument(storedPath);
    await service
      .from("profile_documents")
      .update({ storage_path: null, url: null })
      .eq("id", documentId);
  }

  revalidatePath("/admin/verifications");
  revalidatePath("/admin");
  return { ok: true };
}
