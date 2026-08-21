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
};

/**
 * The identity queue.
 *
 * The document is deliberately **not** rendered inline. A government ID sitting
 * in an admin's page is one screen share or one shoulder away from being
 * disclosed, and it stays in the browser cache afterwards. Opening it is one
 * click, and that click is a decision the reviewer makes rather than a picture
 * that appears because the page loaded.
 *
 * The link is signed and lives for a minute, so a stale tab is not a lasting
 * key to someone's passport.
 */
export function VerificationQueue({ rows }: { rows: VerificationRow[] }) {
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
      <Card className="p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-ink">{row.name}</h3>
            <p className="text-sm text-ink/60">
              {row.kindLabel}
              {row.submittedAt ? ` · sent ${row.submittedAt}` : ""}
            </p>
          </div>
          {row.viewUrl ? (
            <a
              href={row.viewUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-wine hover:underline"
            >
              Open document ↗
            </a>
          ) : (
            <span className="text-sm text-ink/50">File missing</span>
          )}
        </div>

        <form action={submit} className="space-y-4 border-t border-ink/10 pt-4">
          <input type="hidden" name="document_id" value={row.id} />

          <div className="space-y-1.5">
            <label htmlFor={`reason-${row.id}`} className="text-sm font-medium text-ink">
              Reason
            </label>
            <textarea
              id={`reason-${row.id}`}
              name="reason"
              rows={2}
              required
              minLength={10}
              placeholder="What you checked, or what was wrong with it."
              className="w-full rounded-lg border border-ink/15 p-3 text-sm text-ink"
            />
            <p className="text-xs text-ink/50">
              Goes in the audit log. Do not copy any document number into it.
            </p>
          </div>

          {state.error ? (
            <p role="alert" className="text-sm text-wine">
              {state.error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" name="action" value="approve" disabled={pending}>
              {pending ? "Saving…" : "Approve"}
            </Button>
            <Button type="submit" name="action" value="reject" variant="outline" disabled={pending}>
              Reject
            </Button>
          </div>
        </form>
      </Card>
    </li>
  );
}
