"use client";

import { Button } from "@masseurmatch/ui";
import { useFormState, useFormStatus } from "react-dom";

import { replyToTicket } from "../actions";
import { EMPTY_TICKET_STATE } from "../form-state";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Sending…" : "Send reply"}
    </Button>
  );
}

/**
 * The reply box on a thread.
 *
 * `ticket_id` rides in a hidden field, which is safe here and only here: the
 * action re-reads the ticket scoped to the caller's own `user_id` before it
 * writes anything, so a forged id finds nothing rather than somebody else's
 * conversation.
 */
export function ReplyForm({ ticketId }: { ticketId: string }) {
  const [state, formAction] = useFormState(replyToTicket, EMPTY_TICKET_STATE);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="ticket_id" value={ticketId} />

      <label htmlFor="body" className="sr-only">
        Your reply
      </label>
      <textarea
        id="body"
        name="body"
        rows={4}
        required
        maxLength={5000}
        placeholder="Add anything else that would help."
        className="w-full rounded-xl border border-border/90 bg-white/92 px-4 py-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/25"
      />

      <p aria-live="polite" className="text-sm">
        {state.ok ? (
          <span className="text-foreground">Sent.</span>
        ) : state.error ? (
          <span className="text-destructive">{state.error}</span>
        ) : state.fieldErrors?.body?.length ? (
          <span className="text-destructive">{state.fieldErrors.body[0]}</span>
        ) : null}
      </p>

      <Submit />
    </form>
  );
}
