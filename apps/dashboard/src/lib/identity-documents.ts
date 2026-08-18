/**
 * What counts as an identity document — shared by the browser and the server.
 *
 * Deliberately separate from `./identity-storage.ts`, which is `server-only`
 * because it holds the service-role client. The upload form needs the list of
 * document kinds and the size limit to render, and importing them from the
 * storage module would drag that guard into a client component — which is
 * exactly the build error this split fixes rather than works around.
 *
 * Nothing here is a secret or a control. The real limits are enforced on the
 * bucket and in the ticket endpoint; these values exist so the form can say the
 * same thing before the person waits for an upload to be refused.
 */

/** 10MB. Comfortably above a phone photo of a passport, well below a video. */
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

export const ALLOWED_DOCUMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
] as const;

/** What we ask for, in the order it is asked. */
export const DOCUMENT_KINDS = [
  { id: "id_front", label: "Government ID — front" },
  { id: "id_back", label: "Government ID — back" },
  { id: "selfie", label: "Selfie holding the ID" },
] as const;

export type DocumentKind = (typeof DOCUMENT_KINDS)[number]["id"];

export function isDocumentKind(value: string): value is DocumentKind {
  return DOCUMENT_KINDS.some((kind) => kind.id === value);
}
