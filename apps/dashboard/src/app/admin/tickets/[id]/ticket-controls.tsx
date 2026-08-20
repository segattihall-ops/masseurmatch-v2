"use client";

import { Button } from "@masseurmatch/ui";
import { useFormState, useFormStatus } from "react-dom";

import type { StepState } from "@/app/onboarding/form-state";
import { TICKET_STATUSES } from "@/lib/ticket-statuses";

import { replyToTicket, setTicketStatus } from "../actions";

function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Sending…" : children}
    </Button>
  );
}

export function ReplyForm({ ticketId }: { ticketId: string }) {
  const [state, formAction] = useFormState<StepState, FormData>(replyToTicket, {});

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="ticket_id" value={ticketId} />
      <textarea
        name="body"
        required
        minLength={2}
        placeholder="Write a reply to the therapist…"
        className="h-28 w-full rounded-lg border border-ink/15 bg-transparent px-3 py-2 text-sm text-ink placeholder:text-ink/40"
      />
      <Submit>Send reply</Submit>
      {state.error ? (
        <p role="alert" className="text-sm text-wine">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

const LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In progress",
  waiting_on_user: "Waiting on user",
  resolved: "Resolved",
  closed: "Closed",
};

export function StatusControls({ ticketId, current }: { ticketId: string; current: string }) {
  const [state, formAction] = useFormState<StepState, FormData>(setTicketStatus, {});

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {TICKET_STATUSES.map((status) => (
          <form key={status} action={formAction}>
            <input type="hidden" name="ticket_id" value={ticketId} />
            <input type="hidden" name="status" value={status} />
            <button
              type="submit"
              disabled={status === current}
              className={`rounded-full px-3 py-1 text-xs transition ${
                status === current ? "bg-wine text-white" : "bg-ink/5 text-ink/70 hover:bg-ink/10"
              }`}
            >
              {LABELS[status]}
            </button>
          </form>
        ))}
      </div>
      {state.error ? (
        <p role="alert" className="text-sm text-wine">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
