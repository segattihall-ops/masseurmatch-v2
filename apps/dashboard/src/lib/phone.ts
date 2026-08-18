/**
 * Getting a typed phone number into the shape the SMS provider needs.
 *
 * Twilio and Supabase both want E.164 — `+` then country code then digits, no
 * spaces, no punctuation. A person types `(555) 123-4567`. Sending that through
 * unnormalised does not fail loudly: it fails as an SMS that never arrives,
 * which the user experiences as "the code did not come" and reports as a bug in
 * the code, not in the number.
 *
 * The default country is the US because this directory is a US directory — its
 * routes are `/[state]/[city]`. That default only applies to a number with no
 * `+`: anything explicitly international is taken at its word.
 */

/** Digits only, keeping a leading `+` if the person typed one. */
function clean(input: string): { plus: boolean; digits: string } {
  const trimmed = input.trim();
  return { plus: trimmed.startsWith("+"), digits: trimmed.replace(/\D/g, "") };
}

/**
 * Normalise to E.164, or null when it cannot be one.
 *
 * Returns null rather than a best guess. A wrong number that looks plausible
 * costs a real SMS to a stranger and leaves the user waiting for a code that
 * went somewhere else.
 */
export function toE164(input: string): string | null {
  const { plus, digits } = clean(input ?? "");
  if (!digits) return null;

  if (plus) {
    // E.164 allows at most 15 digits, and a country code means at least 8 for
    // anything real.
    return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  }

  // US/Canada, written the way people write it.
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;

  // Anything else without a `+` is ambiguous — a 9-digit number could be half a
  // dozen countries, and picking one sends the code to a stranger.
  return null;
}

/**
 * How the number is shown back while waiting for a code.
 *
 * Partly masked: the point is "does this look like your number", which the last
 * four digits answer, and the screen may be read over a shoulder.
 */
export function maskPhone(e164: string): string {
  const tail = e164.slice(-4);
  return `••• ••• ${tail}`;
}

/** SMS codes are six digits from Supabase; accept nothing else. */
export function isVerificationCode(value: string): boolean {
  return /^\d{6}$/.test(value.trim());
}
