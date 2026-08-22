/** See `../sign-in/form-state.ts` — a `"use server"` module cannot export a type. */
export type OAuthState = { error?: string };

export const EMPTY_OAUTH_STATE: OAuthState = {};
