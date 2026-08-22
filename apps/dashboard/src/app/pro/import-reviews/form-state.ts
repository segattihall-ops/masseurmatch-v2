import type { FieldErrors } from "@/app/onboarding/form-state";

/**
 * Import-request form state.
 *
 * Its own module because a `"use server"` file may only export async
 * functions — a `type` export there is a build error. Same reason as
 * `sign-up/form-state.ts`.
 */
export type ImportFormState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: FieldErrors;
};

export const EMPTY_IMPORT_STATE: ImportFormState = {};
