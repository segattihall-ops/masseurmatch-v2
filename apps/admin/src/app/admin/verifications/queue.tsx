"use client";

import { AnimatePresence, Button, Card, PresenceItem } from "@masseurmatch/ui";
import * as React from "react";

import { EMPTY_STEP_STATE } from "../../onboarding/form-state";
import { decideVerification } from "./actions";

export type VerificationRow = {
  id: string;
  profileId: string | null;
  name: string;
  kindLabel: string;
  submittedAt: string | null;
  /** Signed, expires in a minute — see `documentViewUrl`. */
  viewUrl: string | null;
  isIdentity: boolean;
};

export function VerificationQueue({
  rows,
  emptyMessage = "Nothing waiting for review.",
}: {
  rows: VerificationRow[];
  emptyMessage?: string;
}) {
  const [resolved, setResolved] = React.useState<Record<string, true>>({});
  const visible = rows.filter((row) => !resolved[row.id]);

  if (visible.length === 0) {
    return (
      <Card className="p-6 text-center sm:p-8">
        <p className="text-sm text-ink/60">{emptyMessage}</p>
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

function QueueCard({ row, onResolved }: { row: VerificationRow; onResolved: () => void }) {
  const [state, setState] = React.useState(EMPTY_STEP_STATE);
  const [pending, startTransition] = React.useTransition();

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await decideVerification(EMPTY_STEP_STATE, formData);
      setState(result);
      if (result.ok) onResolved();
    });
  }

  return (
    <li>
      <Card className="p-4 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-lg font-semibold text-ink">{row.name}</h3>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  row.isIdentity ? "bg-wineSoft/60 text-wineDark" : "bg-ink/5 text-ink/60"
                }`}
              >
                {row.isIdentity ? "Identity" : "Credential"}
              </span>
            </div>
            <p className="mt-1 text-sm text-ink/60">
              {row.kindLabel}
              {row.submittedAt ? ` · sent ${row.submittedAt}` : ""}
            </p>
          </div>
          {row.viewUrl ? (
            <a
              href={row.viewUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-wine/20 px-3 py-2 text-sm font-medium text-wine hover:bg-wineSoft/30 sm:w-auto"
            >
              Open document ↗
            </a>
          ) : (
            <span className="rounded-lg bg-ink/5 px-3 py-2 text-sm text-ink/50">File missing</span>
          )}
        </div>

        {row.isIdentity ? (
          <p className="mb-4 rounded-lg bg-ink/5 px-3 py-2 text-xs leading-5 text-ink/60">
            Approving this file does not verify the profile by itself. The identity badge is granted
            only after the required ID front, ID back and selfie are all approved.
          </p>
        ) : (
          <p className="mb-4 rounded-lg bg-ink/5 px-3 py-2 text-xs leading-5 text-ink/60">
            This is a legacy credential document. Reviewing it never grants the identity badge.
          </p>
        )}

        <form action={submit} className="space-y-4 border-t border-ink/10 pt-4">
          <input type="hidden" name="document_id" value={row.id} />

          <div className="space-y-1.5">
            <label htmlFor={`reason-${row.id}`} className="text-sm font-medium text-ink">
              Review reason
            </label>
            <textarea
              id={`reason-${row.id}`}
              name="reason"
              rows={3}
              required
              minLength={10}
              placeholder="What you checked, or what was wrong with it."
              className="w-full rounded-lg border border-ink/15 bg-transparent p-3 text-base text-ink sm:text-sm"
            />
            <p className="text-xs text-ink/50">
              Goes in the audit log. Do not copy any document number into it.
            </p>
          </div>

          {state.error ? (
            <p role="alert" className="rounded-lg bg-wineSoft/40 px-3 py-2 text-sm text-wineDark">
              {state.error}
            </p>
          ) : null}

          <div className="grid gap-2 sm:flex sm:flex-wrap">
            <Button type="submit" name="action" value="approve" disabled={pending} className="w-full sm:w-auto">
              {pending ? "Saving…" : "Approve document"}
            </Button>
            <Button
              type="submit"
              name="action"
              value="reject"
              variant="outline"
              disabled={pending}
              className="w-full sm:w-auto"
            >
              Reject document
            </Button>
          </div>
        </form>
      </Card>
    </li>
  );
}
