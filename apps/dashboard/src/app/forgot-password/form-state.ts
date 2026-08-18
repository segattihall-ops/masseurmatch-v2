/** See `../sign-in/form-state.ts` — a `"use server"` module cannot export a type. */
export type ForgotPasswordState =
  | { status: "idle" }
  | { status: "error"; error: string }
  /**
   * Shown whether or not the address has an account. Saying "no account with
   * that email" here would answer, for anyone who asks, which of a list of
   * addresses belongs to a therapist on this site — the same enumeration
   * sign-in refuses to answer.
   */
  | { status: "sent"; email: string };

export const EMPTY_FORGOT_PASSWORD_STATE: ForgotPasswordState = { status: "idle" };
