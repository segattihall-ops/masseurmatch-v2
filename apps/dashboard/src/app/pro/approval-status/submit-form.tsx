"use client";

import { Button } from "@masseurmatch/ui";
import { useFormState, useFormStatus } from "react-dom";

import { submitForReview } from "@/app/onboarding/actions";
import { EMPTY_STEP_STATE } from "@/app/onboarding/form-state";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Submitting…" : "Submit for review"}
    </Button>
  );
}

/**
 * Send the profile to the moderation queue.
 *
 * Binds the same action the last onboarding step uses, rather than a second
 * one: submitting is one operation, and two call sites writing
 * `profile_status` is how they end up disagreeing about what "submitted" means.
 *
 * The server re-checks completeness regardless of what this renders — a hidden
 * or disabled button is a courtesy, not a control.
 */
export function SubmitForReviewForm() {
  const [state, action] = useFormState(submitForReview, EMPTY_STEP_STATE);

  return (
    <form action={action} className="space-y-2">
      <Submit />
      <p aria-live="polite" className="text-sm">
        {state.ok ? (
          <span className="text-foreground">
            Submitted. We usually get to it within a day or two.
          </span>
        ) : state.error ? (
          <span className="text-destructive">{state.error}</span>
        ) : null}
      </p>
    </form>
  );
}
