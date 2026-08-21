import "server-only";

import { createServiceClient } from "@masseurmatch/db/client";

import {
  ALLOWED_DOCUMENT_TYPES,
  MAX_DOCUMENT_BYTES,
  type DocumentKind,
} from "./identity-documents";

/**
 * Where identity documents live while they are waiting to be reviewed.
 *
 * ---------------------------------------------------------------------------
 * A private bucket, and nothing else
 * ---------------------------------------------------------------------------
 * `POLICIES.md` files `profile_documents` under "Government ID and verification
 * artifacts — the most sensitive data in the system." The bytes get the same
 * treatment: a **private** Supabase Storage bucket, no public URL, and reads
 * only through a signed link that expires in a minute. The therapist's photos
 * go to Cloudinary because they are meant to be seen by strangers; a driving
 * licence is the opposite of that, so it does not go near the same place.
 *
 * ---------------------------------------------------------------------------
 * Why the upload does not pass through this server
 * ---------------------------------------------------------------------------
 * The browser gets a signed upload URL and PUTs the file straight to Supabase,
 * the same shape as the Cloudinary ticket in `/api/uploads/photo`. Two reasons:
 * a serverless function body is capped around 4.5MB and a photo of a passport
 * taken on a modern phone is routinely larger, and a document that never
 * touches our compute is a document that cannot be logged, cached, or left in a
 * temp directory by accident.
 *
 * The size and type limits are set **on the bucket**, not just checked here.
 * A ticket-issuing endpoint can only police what the caller *claims* it is
 * about to upload; the bucket polices what actually arrives.
 *
 * ---------------------------------------------------------------------------
 * The file is deleted once a decision is made
 * ---------------------------------------------------------------------------
 * See `forgetDocument`. Keeping a government ID after it has served its purpose
 * is a liability with no upside — the `profile_documents` row and the audit
 * entry are the record that a human looked at a document and decided, which is
 * what anyone would need later. The document itself is not.
 */

export const IDENTITY_BUCKET = "identity-documents";

/**
 * Create the bucket if it is not there yet.
 *
 * Done in code rather than left as a line in a runbook because the failure mode
 * of the runbook is silent: the feature ships, the button works, the upload
 * 404s, and nobody finds out until a therapist says verification is broken.
 * Creating it here also means it is created *with* its limits rather than with
 * whatever a console form defaults to.
 *
 * Idempotent — an existing bucket comes back as an error that is recognised and
 * ignored rather than retried.
 */
export async function ensureIdentityBucket(): Promise<void> {
  const supabase = createServiceClient();

  const { data } = await supabase.storage.getBucket(IDENTITY_BUCKET);
  if (data) return;

  const { error } = await supabase.storage.createBucket(IDENTITY_BUCKET, {
    public: false,
    fileSizeLimit: MAX_DOCUMENT_BYTES,
    allowedMimeTypes: [...ALLOWED_DOCUMENT_TYPES],
  });

  // Two processes can race here; whoever loses sees "already exists", which is
  // the outcome it wanted.
  if (error && !/already exists/i.test(error.message)) {
    throw new Error(`Could not prepare document storage: ${error.message}`);
  }
}

/** Extension for the object key. Not trusted for anything but the name. */
function extensionFor(contentType: string): string {
  if (contentType === "application/pdf") return "pdf";
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  if (contentType === "image/heic" || contentType === "image/heif") return "heic";
  return "jpg";
}

export type UploadTicket = { path: string; signedUrl: string; token: string };

/**
 * A one-shot URL the browser can PUT one file to.
 *
 * The path is namespaced by user id, so even a bug in a future policy cannot
 * turn one therapist's key into another's, and the random component means a
 * second upload never silently overwrites the first.
 */
export async function createDocumentUploadTicket(
  userId: string,
  kind: DocumentKind,
  contentType: string,
): Promise<UploadTicket> {
  await ensureIdentityBucket();

  const path = `${userId}/${kind}-${crypto.randomUUID()}.${extensionFor(contentType)}`;

  const { data, error } = await createServiceClient()
    .storage.from(IDENTITY_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    throw new Error(`Could not start the upload: ${error?.message ?? "no ticket returned"}`);
  }

  return { path, signedUrl: data.signedUrl, token: data.token };
}

/**
 * A short-lived link for an admin to look at one document.
 *
 * A minute is enough to open it and not much else. It is deliberately not
 * longer: a signed URL is a bearer token for a government ID, and every extra
 * minute is time it survives in a browser history, a chat window, or a screen
 * share.
 */
export async function documentViewUrl(storagePath: string): Promise<string | null> {
  const { data, error } = await createServiceClient()
    .storage.from(IDENTITY_BUCKET)
    .createSignedUrl(storagePath, 60);

  if (error || !data) return null;
  return data.signedUrl;
}

/**
 * Delete the stored file, keeping the row that says it was reviewed.
 *
 * Called once a decision has been recorded. Returns quietly on failure: the
 * decision has already been written, and turning a storage hiccup into a failed
 * approval would leave the therapist unverified because of a cleanup step.
 * A leftover object is a thing to sweep, not a reason to refuse.
 */
export async function forgetDocument(storagePath: string): Promise<void> {
  const { error } = await createServiceClient().storage.from(IDENTITY_BUCKET).remove([storagePath]);

  if (error) {
    console.error("[identity] could not delete a reviewed document", storagePath, error.message);
  }
}
