/**
 * Form state shared by the billing actions and their forms.
 *
 * Separate module because a `"use server"` file may only export async
 * functions — the same reason `onboarding/form-state.ts` exists.
 */
export type BillingState = {
  ok?: boolean;
  error?: string;
};

export const EMPTY_BILLING_STATE: BillingState = {};
