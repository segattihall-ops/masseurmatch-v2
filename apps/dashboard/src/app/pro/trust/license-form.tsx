"use client";

import * as React from "react";

export function LicenseForm() {
  const [status, setStatus] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      const response = await fetch("/api/provider/verification/license", {
        method: "POST",
        body: new FormData(event.currentTarget),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error ?? "Could not submit license.");
      setStatus("License submitted for review.");
      event.currentTarget.reset();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not submit license.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm font-medium">
          <span>Name on license *</span>
          <input
            name="holder_name"
            required
            maxLength={160}
            className="h-11 w-full rounded-xl border border-border px-3"
          />
        </label>
        <label className="space-y-1 text-sm font-medium">
          <span>License type *</span>
          <input
            name="license_type"
            required
            maxLength={160}
            placeholder="Massage Therapist"
            className="h-11 w-full rounded-xl border border-border px-3"
          />
        </label>
        <label className="space-y-1 text-sm font-medium">
          <span>License number *</span>
          <input
            name="license_number"
            required
            maxLength={100}
            className="h-11 w-full rounded-xl border border-border px-3"
          />
        </label>
        <label className="space-y-1 text-sm font-medium">
          <span>Issuing authority *</span>
          <input
            name="issuing_authority"
            required
            maxLength={160}
            placeholder="Texas Department of Licensing and Regulation"
            className="h-11 w-full rounded-xl border border-border px-3"
          />
        </label>
        <label className="space-y-1 text-sm font-medium">
          <span>State / jurisdiction *</span>
          <input
            name="jurisdiction"
            required
            maxLength={80}
            placeholder="TX"
            className="h-11 w-full rounded-xl border border-border px-3"
          />
        </label>
        <label className="space-y-1 text-sm font-medium">
          <span>Issued date</span>
          <input
            name="issued_on"
            type="date"
            className="h-11 w-full rounded-xl border border-border px-3"
          />
        </label>
        <label className="space-y-1 text-sm font-medium">
          <span>Expiration date</span>
          <input
            name="expires_on"
            type="date"
            className="h-11 w-full rounded-xl border border-border px-3"
          />
        </label>
        <label className="space-y-1 text-sm font-medium">
          <span>Photo of license *</span>
          <input
            name="file"
            type="file"
            required
            accept="image/jpeg,image/png,image/webp"
            className="block w-full text-sm"
          />
        </label>
      </div>
      <p className="text-xs text-muted-foreground">
        The license image is private and is only available to MasseurMatch reviewers.
      </p>
      <button
        type="submit"
        disabled={busy}
        className="rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {busy ? "Submitting…" : "Submit license for review"}
      </button>
      {status ? (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {status}
        </p>
      ) : null}
    </form>
  );
}
