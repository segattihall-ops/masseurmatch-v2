"use client";

import * as React from "react";

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

async function videoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const element = document.createElement("video");
    const url = URL.createObjectURL(file);
    element.preload = "metadata";
    element.onloadedmetadata = () => {
      const duration = element.duration;
      URL.revokeObjectURL(url);
      Number.isFinite(duration)
        ? resolve(duration)
        : reject(new Error("Could not read video duration."));
    };
    element.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That video could not be read."));
    };
    element.src = url;
  });
}

export function ProfileVideoUploader({ initialUrl }: { initialUrl: string | null }) {
  const [url, setUrl] = React.useState(initialUrl);
  const [busy, setBusy] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [message, setMessage] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function pick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || busy) return;
    setMessage(null);
    setProgress(0);
    setBusy(true);
    try {
      const duration = await videoDuration(file);
      if (duration > 30.05) throw new Error("Profile videos must be 30 seconds or shorter.");

      const ticketResponse = await fetch("/api/uploads/video", { method: "POST" });
      const ticket = (await ticketResponse.json()) as Ticket;
      if (!ticketResponse.ok) throw new Error(ticket.error ?? "Could not start the upload.");
      if (file.size > ticket.maxBytes) {
        throw new Error(
          `That video is larger than ${Math.round(ticket.maxBytes / 1024 / 1024)} MB.`,
        );
      }

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
        xhr.upload.onprogress = (upload) => {
          if (upload.lengthComputable)
            setProgress(Math.round((upload.loaded / upload.total) * 100));
        };
        xhr.onload = () =>
          xhr.status >= 200 && xhr.status < 300
            ? resolve()
            : reject(new Error("Cloudinary rejected that video."));
        xhr.onerror = () => reject(new Error("The upload failed. Check your connection."));
        xhr.send(form);
      });

      const confirm = await fetch("/api/uploads/video", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ publicId: ticket.publicId }),
      });
      const result = (await confirm.json()) as { url?: string; error?: string };
      if (!confirm.ok || !result.url) throw new Error(result.error ?? "Could not save the video.");
      setUrl(result.url);
      setMessage("30-second profile video saved.");
      if (inputRef.current) inputRef.current.value = "";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not upload that video.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/uploads/video", { method: "DELETE" });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not remove the video.");
      setUrl(null);
      setMessage("Profile video removed.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not remove the video.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-brand">
      <p className="text-xs font-bold uppercase tracking-wider text-action-primary">
        Profile video
      </p>
      <h2 className="mt-2 text-xl font-semibold text-ink">Add a 30-second introduction</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/60">
        Upload one short MP4, MOV or WebM. The server verifies the final Cloudinary asset and
        rejects anything longer than 30 seconds.
      </p>

      {url ? (
        <div className="mt-5 max-w-xl overflow-hidden rounded-2xl border border-border bg-black">
          <video
            src={url}
            controls
            playsInline
            preload="metadata"
            className="aspect-video w-full object-cover"
          />
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <label className="cursor-pointer rounded-xl bg-wine px-4 py-2.5 text-sm font-semibold text-white">
          {busy ? "Uploading…" : url ? "Replace video" : "Upload video"}
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm"
            onChange={pick}
            disabled={busy}
            className="sr-only"
          />
        </label>
        {url ? (
          <button
            type="button"
            onClick={() => void remove()}
            disabled={busy}
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-ink disabled:opacity-50"
          >
            Remove video
          </button>
        ) : null}
        {busy ? <span className="text-sm text-ink/60">{progress}%</span> : null}
      </div>
      {message ? (
        <p className="mt-3 text-sm text-ink/70" aria-live="polite">
          {message}
        </p>
      ) : null}
    </section>
  );
}
