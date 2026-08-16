/**
 * Form state shared by the onboarding actions and their forms.
 *
 * Separate module because a `"use server"` file may only export async
 * functions — exporting these types from `actions.ts` fails the build.
 */
export type FieldErrors = Record<string, string[]>;

export type StepState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: FieldErrors;
};

export const EMPTY_STEP_STATE: StepState = {};
