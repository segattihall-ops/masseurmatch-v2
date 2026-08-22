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
  viewUrl: string | null;
  holderName: string | null;
  licenseType: string | null;
  licenseNumber: string | null;
  issuingAuthority: string | null;
  jurisdiction: string | null;
  issuedOn: string | null;
  expiresOn: string | null;
};

export function VerificationQueue({ rows }: { rows: VerificationRow[] }) {
  const [resolved, setResolved] = React.useState<Record<string, true>>({});
  const visible = rows.filter((row) => !resolved[row.id]);

  if (visible.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-ink/60">No professional credentials are waiting.</p>
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

  const details = [
    ["Name on license", row.holderName],
    ["License type", row.licenseType],
    ["License number", row.licenseNumber],
    ["Issuing authority", row.issuingAuthority],
    ["Jurisdiction", row.jurisdiction],
    ["Issued", row.issuedOn],
    ["Expires", row.expiresOn],
  ].filter(([, value]) => Boolean(value));

  return (
    <li>
      <Card className="p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-ink">{row.name}</h3>
              <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[11px] font-medium text-ink/60">
                Professional credential
              </span>
            </div>
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
              className="rounded-lg border border-ink/15 px-3 py-2 text-sm font-medium text-wine hover:bg-ink/5"
            >
              Open license image ↗
            </a>
          ) : (
            <span className="text-sm font-medium text-wine">File missing</span>
          )}
        </div>

        {details.length ? (
          <dl className="mb-5 grid gap-3 rounded-xl border border-ink/10 bg-ink/[0.025] p-4 sm:grid-cols-2">
            {details.map(([label, value]) => (
              <div key={String(label)}>
                <dt className="text-[11px] font-medium uppercase tracking-wide text-ink/45">{label}</dt>
                <dd className="mt-1 break-words text-sm font-medium text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mb-5 rounded-lg bg-ink/5 px-3 py-2 text-sm text-ink/60">
            Legacy credential: no structured license fields were submitted.
          </p>
        )}

        <p className="mb-4 rounded-lg bg-ink/5 px-3 py-2 text-xs leading-5 text-ink/60">
          Compare the provider-entered fields above with the private license image. Approving this
          credential does not change identity verification.
        </p>

        <form action={submit} className="space-y-4 border-t border-ink/10 pt-4">
          <input type="hidden" name="document_id" value={row.id} />

          <div className="space-y-1.5">
            <label htmlFor={`reason-${row.id}`} className="text-sm font-medium text-ink">
              Review note / rejection reason
            </label>
            <textarea
              id={`reason-${row.id}`}
              name="reason"
              rows={2}
              placeholder="Optional when approving. Required when rejecting."
              className="w-full rounded-lg border border-ink/15 p-3 text-sm text-ink"
            />
            <p className="text-xs text-ink/50">
              Do not copy the license number into the note; the structured field already stores it.
            </p>
          </div>

          {state.error ? (
            <p role="alert" className="text-sm text-wine">
              {state.error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" name="action" value="approve" disabled={pending || !row.viewUrl}>
              {pending ? "Saving…" : "Approve license"}
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
