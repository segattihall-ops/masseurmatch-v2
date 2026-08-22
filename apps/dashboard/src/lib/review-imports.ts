import { z } from "zod";

/**
 * Asking for reviews to be carried across from another site.
 *
 * Pure — no database, no `server-only` — so the rules can be tested directly
 * and the same schema can validate the form on the way in and describe the
 * fields on the way out. The reads and the write live in
 * `./imported-reviews.ts`, which needs the service key.
 *
 * ---------------------------------------------------------------------------
 * Why a request and not an upload
 * ---------------------------------------------------------------------------
 * An imported review is a claim about what somebody else wrote about this
 * therapist, on a site we do not control. Letting a therapist type those in
 * would make the review section a place to write your own testimonials, which
 * is the one thing it must never be. So this collects a link and hands it to
 * the team: a person checks the source, and `imported_reviews.public_label`
 * carries the disclosure that the review was not left here.
 */

/** Long enough for a real profile URL, short enough not to be a payload. */
const MAX_URL = 500;
const MAX_NOTES = 1000;
const MAX_PLATFORM = 100;

/**
 * The site a URL points at, as a person would name it.
 *
 * `https://www.RentMasseur.com/profile/x?utm=y` → `rentmasseur.com`. Used as
 * the default when the therapist does not name the platform themselves, so the
 * admin queue is not full of rows saying "Other". Returns null rather than
 * guessing when the URL will not parse — the schema rejects those anyway, and a
 * fallback string here would hide that.
 */
export function platformFromUrl(value: string): string | null {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  return host || null;
}

/**
 * The submitted request, or the reason it was refused.
 *
 * `http`/`https` only, and checked here rather than by a regex in the form:
 * `javascript:` and `data:` URLs both satisfy "starts with a scheme", and this
 * value is rendered back to an admin as a link.
 */
export const reviewImportSchema = z.object({
  source_url: z
    .string()
    .trim()
    .min(1, "Add a link to your existing listing.")
    .max(MAX_URL, `Keep the link under ${MAX_URL} characters.`)
    .refine((value) => platformFromUrl(value) !== null, {
      message: "That does not look like a web address. It should start with http:// or https://.",
    }),
  platform: z.string().trim().max(MAX_PLATFORM).optional(),
  email: z
    .string()
    .trim()
    .min(1, "We need an email address to reach you about the import.")
    .email("That email address does not look right."),
  notes: z.string().trim().max(MAX_NOTES, `Keep notes under ${MAX_NOTES} characters.`).optional(),
});

export type ReviewImportRequest = z.infer<typeof reviewImportSchema>;

/** The row to write, with the platform filled in from the URL when it was left blank. */
export function toMigrationRow(
  request: ReviewImportRequest,
  profileId: string,
): {
  profile_id: string;
  email: string;
  platform: string;
  source_url: string;
  status: string;
  migration_notes: string | null;
} {
  return {
    profile_id: profileId,
    email: request.email,
    platform: request.platform || (platformFromUrl(request.source_url) ?? "unknown"),
    source_url: request.source_url,
    status: "pending",
    migration_notes: request.notes || null,
  };
}

/**
 * What a migration status means to the therapist who asked for it.
 *
 * `profile_migrations.status` is free text with no constraint, and production
 * has written several spellings into it. Anything unrecognised is shown as
 * itself rather than mapped to "unknown" — a status we have not seen before is
 * still information, and hiding it would make a stuck request look like no
 * request at all.
 */
export function importStatusLabel(status: string | null): string {
  switch ((status ?? "").trim().toLowerCase()) {
    case "":
      return "Received";
    case "pending":
    case "new":
    case "requested":
      return "Waiting for review";
    case "in_progress":
    case "processing":
    case "importing":
      return "Being imported";
    case "completed":
    case "complete":
    case "imported":
    case "done":
      return "Imported";
    case "verified":
      return "Imported and verified";
    case "rejected":
    case "declined":
      return "Not accepted";
    case "failed":
    case "error":
      return "Could not be imported";
    default:
      return status!.replace(/_/g, " ");
  }
}

/** Whether a request is still moving. Used to say what happens next, not to hide rows. */
export function isOpenImport(status: string | null): boolean {
  const label = importStatusLabel(status);
  return label === "Received" || label === "Waiting for review" || label === "Being imported";
}
