/** See `../sign-in/form-state.ts` — a `"use server"` module cannot export a type. */
export type ResetPasswordState = { error?: string };

export const EMPTY_RESET_PASSWORD_STATE: ResetPasswordState = {};
