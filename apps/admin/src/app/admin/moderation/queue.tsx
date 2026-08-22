"use client";

import { AnimatePresence, Button, Card, PresenceItem } from "@masseurmatch/ui";
import * as React from "react";

import { ACTION_LABELS, FOSTA_CHECKS, MODERATION_ACTIONS } from "@/lib/moderation";

import { EMPTY_STEP_STATE } from "../../onboarding/form-state";
import { moderateProfile } from "./actions";

export type QueueRow = {
  id: string;
  name: string;
  headline: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;
  services: string[];
  kind: "new" | "edited";
  moderationNotes: string | null;
  photos: { id: string; url: string | null; moderation_status: string | null }[];
  publicUrl: string | null;
};

export function ModerationQueue({ rows }: { rows: QueueRow[] }) {
  const [resolved, setResolved] = React.useState<Record<string, true>>({});
  const visible = rows.filter((row) => !resolved[row.id]);

  if (visible.length === 0) {
    return (
      <Card className="p-6 text-center sm:p-8">
        <p className="text-sm text-ink/60">Nothing waiting for review.</p>
      </Card>
    );
  }

  return (
    <ul className="space-y-4">
      <AnimatePresence initial={false}>
        {visible.map((row) => (
          <PresenceItem key={row.id} itemKey={row.id}>
            <QueueCard
              row={row}
              onResolved={() => setResolved((current) => ({ ...current, [row.id]: true }))}
            />
          </PresenceItem>
        ))}
      </AnimatePresence>
    </ul>
  );
}

function QueueCard({ row, onResolved }: { row: QueueRow; onResolved: () => void }) {
  const [state, setState] = React.useState(EMPTY_STEP_STATE);
  const [pending, startTransition] = React.useTransition();

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await moderateProfile(EMPTY_STEP_STATE, formData);
      setState(result);
      if (result.ok) onResolved();
    });
  }

  return (
    <li>
      <Card className="p-4 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-ink">{row.name}</h3>
            <p className="mt-1 text-sm leading-6 text-ink/60">
              {[row.city, row.state].filter(Boolean).join(", ") || "No location"} ·{" "}
              {row.kind === "edited" ? "Edited since approval" : "New submission"}
            </p>
          </div>
          {row.publicUrl ? (
            <a
              href={row.publicUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-wine/20 px-3 py-2 text-sm font-medium text-wine hover:bg-wineSoft/30 sm:w-auto"
            >
              View public page ↗
            </a>
          ) : null}
        </div>

        {row.kind === "edited" && row.moderationNotes ? (
          <p className="mb-4 rounded-md bg-wineSoft/50 px-3 py-2 text-sm leading-6 text-wineDark">
            {row.moderationNotes}
          </p>
        ) : null}

        <dl className="mb-4 space-y-3 text-sm">
          <div>
            <dt className="font-medium text-ink">Headline</dt>
            <dd className="mt-0.5 break-words text-ink/70">{row.headline ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-medium text-ink">Services</dt>
            <dd className="mt-0.5 break-words text-ink/70">{row.services.join(", ") || "—"}</dd>
          </div>
          <div>
            <dt className="font-medium text-ink">Bio</dt>
            <dd className="mt-0.5 whitespace-pre-wrap break-words leading-6 text-ink/70">
              {row.bio ?? "—"}
            </dd>
          </div>
        </dl>

        {row.photos.length > 0 ? (
          <ul className="mb-4 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
            {row.photos.map((photo) => (
              <li key={photo.id} className="min-w-0">
                {/* eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary asset behind admin auth */}
                <img
                  src={photo.url ?? ""}
                  alt=""
                  className="aspect-square h-auto w-full rounded-md object-cover sm:h-24 sm:w-24"
                  loading="lazy"
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-4 text-sm text-ink/50">No photos submitted.</p>
        )}

        <form action={submit} className="space-y-4 border-t border-ink/10 pt-4">
          <input type="hidden" name="profile_id" value={row.id} />

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-ink">
              FOSTA-SESTA review — required to approve
            </legend>
            {FOSTA_CHECKS.map((check) => (
              <label key={check.id} className="flex min-h-11 gap-3 text-sm text-ink">
                <input
                  type="checkbox"
                  name="fosta"
                  value={check.id}
                  className="mt-1 h-5 w-5 shrink-0 accent-wine"
                />
                <span className="leading-6">
                  <strong className="font-medium">{check.label}</strong>{" "}
                  <span className="text-ink/60">{check.detail}</span>
                </span>
              </label>
            ))}
          </fieldset>

          <div className="space-y-1.5">
            <label htmlFor={`reason-${row.id}`} className="text-sm font-medium text-ink">
              Reason (recorded in the audit log)
            </label>
            <textarea
              id={`reason-${row.id}`}
              name="reason"
              rows={3}
              required
              minLength={10}
              className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-base text-ink outline-none focus-visible:ring-2 focus-visible:ring-wine/40 sm:text-sm"
            />
          </div>

          {state.error ? (
            <p role="alert" className="rounded-lg bg-wineSoft/40 px-3 py-2 text-sm text-wineDark">
              {state.error}
            </p>
          ) : null}

          <div className="grid gap-2 sm:flex sm:flex-wrap">
            {MODERATION_ACTIONS.map((action) => (
              <Button
                key={action}
                type="submit"
                name="action"
                value={action}
                disabled={pending}
                className="w-full sm:w-auto"
                variant={
                  action === "approve" ? "primary" : action === "reject" ? "outline" : "danger"
                }
              >
                {pending ? "Working…" : ACTION_LABELS[action]}
              </Button>
            ))}
          </div>
        </form>
      </Card>
    </li>
  );
}
