/**
 * What the sign-up form will accept, as pure rules.
 *
 * Kept out of the server action so it can be tested without a database and a
 * Supabase session, and so the wording of each refusal is reviewable in one
 * place. The action calls this on every submission regardless of what the
 * browser validated: `required` and `minLength` on an input are a convenience
 * for a person, not a control — a posted form never has to have been rendered.
 */

/**
 * Supabase's own minimum is six. Eight is the floor here because this password
 * protects a listing with a phone number and a photo gallery on it, and the
 * cost of the stricter rule is one extra character.
 */
export const MIN_PASSWORD_LENGTH = 8;

export type Credentials = { email: string; password: string; confirm: string };

/**
 * The password half on its own — sign-up checks it alongside an address, and
 * the reset form checks it with no address in play. One function so the floor
 * cannot drift between the place a password is created and the place it is
 * replaced.
 */
export function validatePassword(password: string, confirm: string): string | null {
  if (!password) return "Enter a new password.";
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters for your password.`;
  }
  if (confirm !== password) return "The two passwords do not match.";
  return null;
}

/**
 * Deliberately shallow email validation — a single `@` with something either
 * side. Anything stricter rejects addresses that are legal and deliverable,
 * and the confirmation email is the real check: an address that cannot receive
 * it never becomes a usable account.
 */
function looksLikeEmail(value: string): boolean {
  const at = value.indexOf("@");
  return at > 0 && at < value.length - 1 && !/\s/.test(value);
}

/** The first problem with these credentials, or null when there is none. */
export function validateCredentials({ email, password, confirm }: Credentials): string | null {
  if (!email || !password) return "Enter your email and a password.";
  if (!looksLikeEmail(email)) return "That does not look like an email address.";
  return validatePassword(password, confirm);
}
