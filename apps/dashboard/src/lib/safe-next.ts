/**
 * `?next=` handling, in one place.
 *
 * Four call sites now read a return path from untrusted input: the sign-in page
 * and action, the sign-up page and action, and the email-confirmation callback.
 * Each one used to carry its own two-line copy of this check, which is exactly
 * how one of them eventually ends up missing the `//` case and turning the
 * form into an open redirect — `?next=//evil.example` is a protocol-relative
 * URL, so a browser treats it as another origin while `startsWith("/")` alone
 * happily waves it through.
 *
 * Only same-origin absolute paths survive. Anything else becomes `/`, which is
 * the dashboard home — the destination every one of these flows wants anyway.
 */

const DEFAULT = "/";

/**
 * Accepts whatever the caller has: a `FormData` entry, a `searchParams` value
 * (which Next.js types as `string | string[] | undefined`), or a raw string
 * from a URL. Anything that is not a safe path returns `/`.
 */
export function safeNext(value: unknown): string {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string") return DEFAULT;

  // A path, not a URL: rejects `https://…`, `//host`, and `\\host` (which some
  // browsers normalise to `//host`).
  if (!raw.startsWith("/")) return DEFAULT;
  if (raw.startsWith("//") || raw.startsWith("/\\")) return DEFAULT;

  return raw;
}
