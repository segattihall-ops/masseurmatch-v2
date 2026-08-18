/**
 * Sign-up form state.
 *
 * Lives beside the action rather than inside it because a `"use server"` module
 * may only export async functions — a `type` export there is a build error, not
 * a warning. Same reason as `../sign-in/form-state.ts`.
 */

export type SignUpState =
  /** Nothing submitted yet. */
  | { status: "idle" }
  /** Something was wrong with the submission; `error` is shown to the person. */
  | { status: "error"; error: string }
  /**
   * The account exists and Supabase has sent a confirmation email. This is also
   * what an address that is *already* registered gets, with no second email and
   * nothing written — telling the two apart would turn the form into an
   * account-enumeration oracle, which is the same reason sign-in refuses vaguely.
   */
  | { status: "check-email"; email: string };

export const EMPTY_SIGN_UP_STATE: SignUpState = { status: "idle" };
