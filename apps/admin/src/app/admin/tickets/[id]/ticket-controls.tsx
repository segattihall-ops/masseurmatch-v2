"use client";

import { Button } from "@masseurmatch/ui";
import { useFormState, useFormStatus } from "react-dom";

import type { StepState } from "@/app/onboarding/form-state";
import { TICKET_STATUSES } from "@/lib/ticket-statuses";

import { replyToTicket, setTicketStatus } from "../actions";

function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Sending…" : children}
    </Button>
  );
}

export function ReplyForm({ ticketId }: { ticketId: string }) {
  const [state, formAction] = useFormState<StepState, FormData>(replyToTicket, {});

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="ticket_id" value={ticketId} />
      <label htmlFor={`reply-${ticketId}`} className="text-sm font-medium text-ink">
        Reply
      </label>
      <textarea
        id={`reply-${ticketId}`}
        name="body"
        required
        minLength={2}
        placeholder="Write a reply to the therapist…"
        className="h-32 w-full rounded-lg border border-ink/15 bg-transparent px-3 py-2 text-base text-ink placeholder:text-ink/40 sm:text-sm"
      />
      <Submit>Send reply</Submit>
      {state.error ? (
        <p role="alert" className="rounded-lg bg-wineSoft/40 px-3 py-2 text-sm text-wineDark">
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
      <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Ticket status</p>
      <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
        {TICKET_STATUSES.map((status) => (
          <form key={status} action={formAction} className="shrink-0">
            <input type="hidden" name="ticket_id" value={ticketId} />
            <input type="hidden" name="status" value={status} />
            <button
              type="submit"
              disabled={status === current}
              className={`min-h-10 rounded-full px-3 py-1.5 text-xs transition ${
                status === current ? "bg-wine text-white" : "bg-ink/5 text-ink/70 hover:bg-ink/10"
              }`}
            >
              {LABELS[status]}
            </button>
          </form>
        ))}
      </div>
      {state.error ? (
        <p role="alert" className="rounded-lg bg-wineSoft/40 px-3 py-2 text-sm text-wineDark">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
