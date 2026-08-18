"use client";

import { Button } from "@masseurmatch/ui";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { DOCUMENT_KINDS, MAX_DOCUMENT_BYTES } from "@/lib/identity-documents";

import { recordIdentityDocument } from "./actions";

/**
 * Upload one document.
 *
 * Three steps the person does not see: ask this server for a one-shot URL, PUT
 * the file straight to storage with it, then tell the server it landed. The
 * middle step is why the file never passes through our compute — see
 * `@/lib/identity-storage`.
 *
 * Not a `<form action={…}>` because the server action is the *last* of the
 * three steps rather than the submit target, and pretending otherwise would
 * mean posting the file to a serverless function that caps request bodies well
 * below the size of a phone photo of a passport.
 */
export function IdentityUploadForm() {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<string>(DOCUMENT_KINDS[0].id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    const file = fileInput.current?.files?.[0];
    if (!file) {
      setError("Choose a file first.");
      return;
    }
    if (file.size > MAX_DOCUMENT_BYTES) {
      setError(`That file is too large. The limit is ${MAX_DOCUMENT_BYTES / (1024 * 1024)}MB.`);
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const ticketResponse = await fetch("/api/uploads/identity", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind, contentType: file.type, size: file.size }),
      });
      const ticket = await ticketResponse.json();
      if (!ticketResponse.ok) throw new Error(ticket.error ?? "Could not start the upload.");

      const upload = await fetch(ticket.signedUrl, {
        method: "PUT",
        headers: { "content-type": file.type },
        body: file,
      });
      if (!upload.ok) throw new Error("The upload did not complete. Please try again.");

      const recorded = await recordIdentityDocument(ticket.path, kind);
      if (recorded.error) throw new Error(recorded.error);

      if (fileInput.current) fileInput.current.value = "";
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="kind" className="text-sm font-medium text-ink">
          What is this?
        </label>
        <select
          id="kind"
          value={kind}
          onChange={(event) => setKind(event.target.value)}
          className="h-11 w-full rounded-lg border border-ink/15 bg-white px-3 text-sm text-ink"
        >
          {DOCUMENT_KINDS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="document" className="text-sm font-medium text-ink">
          File
        </label>
        <input
          id="document"
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf"
          className="block w-full text-sm text-ink/70 file:mr-3 file:rounded-lg file:border-0 file:bg-ink/5 file:px-4 file:py-2 file:text-sm file:font-medium file:text-ink"
        />
        <p className="text-xs text-ink/50">
          A photo or PDF, up to {MAX_DOCUMENT_BYTES / (1024 * 1024)}MB. Make sure the whole document
          is in frame and the text is readable.
        </p>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-wine">
          {error}
        </p>
      ) : null}

      <Button type="button" onClick={submit} disabled={busy} className="w-full">
        {busy ? "Uploading…" : "Submit for review"}
      </Button>
    </div>
  );
}
