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

/**
 * The moderation queue.
 *
 * Resolved items animate out via `AnimatePresence`, which is not decoration
 * here: with a list that mutates under the reviewer, an item vanishing
 * instantly makes it genuinely unclear which one was just acted on. The exit
 * gives that feedback.
 *
 * Rows are removed optimistically once the server action reports success. The
 * server remains the authority — a failure puts the row back with its error.
 */
export function ModerationQueue({ rows }: { rows: QueueRow[] }) {
  const [resolved, setResolved] = React.useState<Record<string, true>>({});
  const visible = rows.filter((row) => !resolved[row.id]);

  if (visible.length === 0) {
    return (
      <Card className="p-8 text-center">
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
              onResolved={() => setResolved((r) => ({ ...r, [row.id]: true }))}
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
      <Card className="p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-ink">{row.name}</h3>
            <p className="text-sm text-ink/60">
              {[row.city, row.state].filter(Boolean).join(", ") || "No location"} ·{" "}
              {row.kind === "edited" ? "Edited since approval" : "New submission"}
            </p>
          </div>
          {row.publicUrl ? (
            <a
              href={row.publicUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-wine hover:underline"
            >
              View public page ↗
            </a>
          ) : null}
        </div>

        {row.kind === "edited" && row.moderationNotes ? (
          <p className="mb-4 rounded-md bg-wineSoft/50 px-3 py-2 text-sm text-wineDark">
            {row.moderationNotes}
          </p>
        ) : null}

        <dl className="mb-4 space-y-2 text-sm">
          <div>
            <dt className="font-medium text-ink">Headline</dt>
            <dd className="text-ink/70">{row.headline ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-medium text-ink">Services</dt>
            <dd className="text-ink/70">{row.services.join(", ") || "—"}</dd>
          </div>
          <div>
            <dt className="font-medium text-ink">Bio</dt>
            <dd className="whitespace-pre-wrap text-ink/70">{row.bio ?? "—"}</dd>
          </div>
        </dl>

        {row.photos.length > 0 ? (
          <ul className="mb-4 flex flex-wrap gap-2">
            {row.photos.map((photo) => (
              <li key={photo.id}>
                {/* eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary asset behind admin auth */}
                <img
                  src={photo.url ?? ""}
                  alt=""
                  className="h-24 w-24 rounded-md object-cover"
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

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-ink">
              FOSTA-SESTA review — required to approve
            </legend>
            {FOSTA_CHECKS.map((check) => (
              <label key={check.id} className="flex gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  name="fosta"
                  value={check.id}
                  className="mt-1 h-4 w-4 accent-wine"
                />
                <span>
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
              rows={2}
              required
              minLength={10}
              className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-wine/40"
            />
          </div>

          {state.error ? (
            <p role="alert" className="text-sm text-wine">
              {state.error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {MODERATION_ACTIONS.map((action) => (
              <Button
                key={action}
                type="submit"
                name="action"
                value={action}
                disabled={pending}
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
