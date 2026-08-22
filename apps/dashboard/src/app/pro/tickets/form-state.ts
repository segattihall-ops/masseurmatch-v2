import type { FieldErrors } from "@/app/onboarding/form-state";

/** Its own module: a `"use server"` file may only export async functions. */
export type TicketFormState = {
  ok?: boolean;
  /** Succeeded, but not wholly — shown instead of the success line. */
  warning?: string;
  error?: string;
  fieldErrors?: FieldErrors;
};

export const EMPTY_TICKET_STATE: TicketFormState = {};
