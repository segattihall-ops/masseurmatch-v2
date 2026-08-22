"use client";

import { Button, Input } from "@masseurmatch/ui";
import { useFormState, useFormStatus } from "react-dom";

import { TICKET_CATEGORIES, TICKET_PRIORITIES } from "@/lib/ticket-vocabulary";

import { openTicket } from "./actions";
import { EMPTY_TICKET_STATE } from "./form-state";

/** React 18 here, so `useFormState`/`useFormStatus` from `react-dom`. */
function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Sending…" : "Open ticket"}
    </Button>
  );
}

function Err({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p className="text-sm text-destructive" role="alert">
      {errors[0]}
    </p>
  );
}

const FIELD =
  "w-full rounded-xl border border-border/90 bg-white/92 px-4 py-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/25";

export function NewTicketForm() {
  const [state, formAction] = useFormState(openTicket, EMPTY_TICKET_STATE);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="subject" className="text-sm font-medium text-foreground">
          Subject
        </label>
        <Input id="subject" name="subject" required maxLength={200} placeholder="In a few words" />
        <Err errors={state.fieldErrors?.subject} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="category" className="text-sm font-medium text-foreground">
            What is it about
          </label>
          <select id="category" name="category" defaultValue="billing" className={FIELD}>
            {TICKET_CATEGORIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Err errors={state.fieldErrors?.category} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="priority" className="text-sm font-medium text-foreground">
            How urgent
          </label>
          <select id="priority" name="priority" defaultValue="normal" className={FIELD}>
            {TICKET_PRIORITIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Err errors={state.fieldErrors?.priority} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="message" className="text-sm font-medium text-foreground">
          What happened
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          maxLength={5000}
          className={FIELD}
          placeholder="What you were doing, what you expected, and what happened instead."
        />
        <Err errors={state.fieldErrors?.message} />
      </div>

      {/* Announced rather than only painted: the form stays put on success. */}
      <p aria-live="polite" className="text-sm">
        {state.ok ? (
          <span className="text-foreground">Opened. It is in the list below.</span>
        ) : state.error ? (
          <span className="text-destructive">{state.error}</span>
        ) : null}
      </p>

      <Submit />
    </form>
  );
}
