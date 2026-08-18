/** See `../sign-in/form-state.ts` — a `"use server"` module cannot export a type. */
export type VerifyPhoneState =
  /** Asking for the number. */
  | { stage: "phone"; error?: string }
  /** A code has been sent; `phone` is E.164 and rides in a hidden field. */
  | { stage: "code"; phone: string; error?: string }
  /** Confirmed and written to the profile. */
  | { stage: "done"; phone: string };

export const EMPTY_VERIFY_PHONE_STATE: VerifyPhoneState = { stage: "phone" };
