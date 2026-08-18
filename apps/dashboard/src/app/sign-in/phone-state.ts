/** See `./form-state.ts` — a `"use server"` module cannot export a type. */
export type PhoneSignInState =
  { stage: "phone"; error?: string } | { stage: "code"; phone: string; error?: string };

export const EMPTY_PHONE_SIGN_IN_STATE: PhoneSignInState = { stage: "phone" };
