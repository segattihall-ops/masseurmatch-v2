"use server";

import { createSessionClient, getViewer } from "@masseurmatch/db/auth";
import { createServiceClient } from "@masseurmatch/db/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { forgetDocument } from "@/lib/identity-storage";

import type { StepState } from "../../onboarding/form-state";

/**
 * Deciding an identity verification.
 *
 * Log first, then act — the same ordering as `../moderation/actions.ts`, for
 * the same reason: a failure between the two leaves a logged decision that did
 * not take effect, which is visible and fixable, where the other order leaves a
 * profile marked verified with no record of who decided that.
 *
 * The document is deleted last, after the decision is durable. Deleting it is
 * the point of the whole flow — the platform needs to have *checked* a
 * government ID, not to *hold* one — but it is cleanup, not part of the
 * decision, so it never blocks or reverses one.
 */

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

  // Enforced here, not by the textarea's `required` attribute — that is a hint
  // to a browser, not a rule. A rejection with no reason is one the therapist
  // cannot act on.
  if (reason.length < 10) {
    return { error: "Give a reason of at least 10 characters — it goes in the audit log." };
  }

  const service = createServiceClient();

  const { data: document, error: readError } = await service
    .from("profile_documents")
    .select("id,profile_id,storage_path,status")
    .eq("id", documentId)
    .maybeSingle();

  if (readError) return { error: `Could not read the document: ${readError.message}` };
  if (!document) return { error: "That document no longer exists." };
  if (document.status !== "pending") {
    return { error: "That document has already been decided." };
  }

  // 1. Log.
  const { error: logError } = await createSessionClient()
    .from("audit_log")
    .insert({
      admin_id: adminId,
      admin_user_id: adminId,
      action: `identity.${action}`,
      target_type: "profile_document",
      target_id: documentId,
      target_profile_id: document.profile_id,
      reason,
      details: { document_id: documentId },
    });

  if (logError) {
    return {
      error: `Could not write the audit entry, so nothing was changed: ${logError.message}`,
    };
  }

  // 2. Act.
  const { error: statusError } = await service
    .from("profile_documents")
    .update({ status: action === "approve" ? "approved" : "rejected" })
    .eq("id", documentId);

  if (statusError) return { error: `Logged, but the change failed: ${statusError.message}` };

  if (action === "approve" && document.profile_id) {
    const { error: badgeError } = await service
      .from("profiles")
      .update({
        is_verified_identity: true,
        identity_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", document.profile_id);

    if (badgeError) {
      return {
        error: `Logged and the document was approved, but the badge failed: ${badgeError.message}`,
      };
    }
  }

  // 3. Forget the file.
  if (document.storage_path) {
    await forgetDocument(document.storage_path);
    await service
      .from("profile_documents")
      .update({ storage_path: null, url: null })
      .eq("id", documentId);
  }

  revalidatePath("/admin/verifications");
  revalidatePath("/admin");
  return { ok: true };
}
