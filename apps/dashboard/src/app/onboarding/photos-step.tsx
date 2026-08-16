"use client";

import { AnimatePresence, Button, PresenceItem } from "@masseurmatch/ui";
import * as React from "react";

import { confirmPhoto, deletePhoto } from "./photo-actions";

type Photo = { id: string; url: string | null; moderation_status: string | null };

type Ticket = {
  uploadUrl: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  publicId: string;
  allowedFormats: string;
  maxBytes: number;
  error?: string;
};

type Phase = "idle" | "signing" | "uploading" | "saving" | "done" | "error";

/**
 * Direct-to-Cloudinary upload.
 *
 * Three hops: ask our server for a signed ticket, PUT the bytes straight to
 * Cloudinary, then hand the resulting `public_id` back for verification and
 * persistence. The file never passes through our server, and the API secret
 * never reaches this file.
 *
 * `XMLHttpRequest` rather than `fetch` purely because it reports upload
 * progress; `fetch` still cannot.
 */
export function PhotosStep({ photos, limit }: { photos: Photo[]; limit: number }) {
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [pct, setPct] = React.useState(0);
  const [message, setMessage] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const atLimit = photos.length >= limit;

  async function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setMessage(null);
    setPct(0);

    try {
      setPhase("signing");
      const ticketResponse = await fetch("/api/uploads/photo", { method: "POST" });
      const ticket = (await ticketResponse.json()) as Ticket;
      if (!ticketResponse.ok) throw new Error(ticket.error ?? "Could not start the upload.");

      // Checked here too so an oversized file fails instantly instead of after
      // a long upload that Cloudinary would reject anyway.
      if (file.size > ticket.maxBytes) {
        throw new Error(
          `That file is larger than ${Math.round(ticket.maxBytes / 1024 / 1024)} MB.`,
        );
      }

      setPhase("uploading");
      const form = new FormData();
      form.append("file", file);
      form.append("api_key", ticket.apiKey);
      form.append("timestamp", String(ticket.timestamp));
      form.append("signature", ticket.signature);
      form.append("folder", ticket.folder);
      form.append("public_id", ticket.publicId);
      form.append("allowed_formats", ticket.allowedFormats);
      form.append("max_bytes", String(ticket.maxBytes));

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", ticket.uploadUrl);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setPct(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () =>
          xhr.status >= 200 && xhr.status < 300
            ? resolve()
            : reject(new Error("Cloudinary rejected that file."));
        xhr.onerror = () => reject(new Error("The upload failed. Check your connection."));
        xhr.send(form);
      });

      setPhase("saving");
      const saveForm = new FormData();
      saveForm.append("public_id", ticket.publicId);
      const result = await confirmPhoto({}, saveForm);
      if (result.error) throw new Error(result.error);

      setPhase("done");
      setMessage("Photo added.");
      if (inputRef.current) inputRef.current.value = "";
    } catch (error) {
      setPhase("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  const busy = phase === "signing" || phase === "uploading" || phase === "saving";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-ink/70">
          {photos.length} of {limit} photos. New photos are reviewed before they appear publicly.
        </p>

        <label className="mt-3 inline-block">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            onChange={onPick}
            disabled={busy || atLimit}
            className="block w-full text-sm text-ink/70 file:mr-3 file:rounded-md file:border-0 file:bg-wine file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-wineDark disabled:opacity-50"
          />
        </label>

        {atLimit ? (
          <p className="mt-2 text-sm text-ink/60">
            You have reached your plan&apos;s photo limit. Remove one to add another.
          </p>
        ) : null}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {busy ? (
          <PresenceItem key="progress" itemKey="progress">
            <div className="space-y-1.5">
              <div className="h-2 w-full overflow-hidden rounded-full bg-ink/10">
                <div
                  className="h-full rounded-full bg-wine transition-[width] duration-200"
                  style={{ width: `${phase === "uploading" ? pct : 100}%` }}
                />
              </div>
              <p className="text-sm text-ink/60" role="status">
                {phase === "signing"
                  ? "Preparing…"
                  : phase === "uploading"
                    ? `Uploading… ${pct}%`
                    : "Saving…"}
              </p>
            </div>
          </PresenceItem>
        ) : null}

        {message ? (
          <PresenceItem key={message} itemKey={message}>
            <p
              role={phase === "error" ? "alert" : "status"}
              className={phase === "error" ? "text-sm text-wine" : "text-sm text-wineDark"}
            >
              {message}
            </p>
          </PresenceItem>
        ) : null}
      </AnimatePresence>

      {photos.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <AnimatePresence initial={false}>
            {photos.map((photo) => (
              <PresenceItem key={photo.id} itemKey={photo.id} preset="scale">
                <li className="overflow-hidden rounded-lg border border-ink/10">
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary asset in a private dashboard; next/image adds no value behind auth */}
                  <img
                    src={photo.url ?? ""}
                    alt=""
                    className="aspect-square w-full object-cover"
                    loading="lazy"
                  />
                  <div className="flex items-center justify-between gap-2 p-2">
                    <span className="text-xs text-ink/60">
                      {photo.moderation_status === "approved" ? "Approved" : "In review"}
                    </span>
                    <form action={(fd) => void deletePhoto({}, fd)}>
                      <input type="hidden" name="photo_id" value={photo.id} />
                      <Button type="submit" variant="ghost" size="sm">
                        Remove
                      </Button>
                    </form>
                  </div>
                </li>
              </PresenceItem>
            ))}
          </AnimatePresence>
        </ul>
      ) : null}
    </div>
  );
}
