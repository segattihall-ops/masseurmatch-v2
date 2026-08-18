"use server";

import { createServiceClient } from "@masseurmatch/db/client";
import { revalidatePath } from "next/cache";

import { requireTherapist } from "@/lib/guards";
import { isDocumentKind } from "@/lib/identity-documents";

/**
 * Recording that a document was uploaded.
 *
 * Runs after the browser has PUT the file to the signed URL, and writes the
 * row that puts it in front of a human. The service client, because
 * `profile_documents` is owner-read and pipeline-write by design — see
 * POLICIES.md — so the account being verified cannot write its own entry into
 * the review queue by any other route.
 *
 * `storagePath` is not taken on trust: it must start with the caller's own user
 * id, which is the prefix `createDocumentUploadTicket` builds. Without that
 * check a caller could submit any path in the bucket, including another
 * therapist's document, and have it reviewed as their own.
 */
export async function recordIdentityDocument(
  storagePath: string,
  kind: string,
): Promise<{ error?: string }> {
  const viewer = await requireTherapist("/verify-id");

  if (!isDocumentKind(kind)) return { error: "Choose which document this is." };
  if (!storagePath.startsWith(`${viewer.user.id}/`)) {
    return { error: "That upload does not belong to this account." };
  }

  const { error } = await createServiceClient().from("profile_documents").insert({
    profile_id: viewer.user.id,
    document_type: kind,
    type: kind,
    storage_path: storagePath,
    status: "pending",
  });

  if (error) return { error: `Could not submit the document: ${error.message}` };

  revalidatePath("/verify-id");
  return {};
}
