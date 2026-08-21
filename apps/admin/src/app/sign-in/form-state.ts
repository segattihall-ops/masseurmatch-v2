/**
 * Form state for the sign-in action.
 *
 * Separate from `actions.ts` because a `"use server"` module may only export
 * async functions — exporting a type alongside the action fails the build with
 * "Only async functions are allowed to be exported in a 'use server' file".
 */
export type SignInState = { error?: string };

export const EMPTY_SIGN_IN_STATE: SignInState = {};
