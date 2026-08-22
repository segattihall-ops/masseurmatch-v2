import "server-only";

import { createSessionClient } from "@masseurmatch/db/auth";
import { createServiceClient } from "@masseurmatch/db/client";

import { toMigrationRow, type ReviewImportRequest } from "./review-imports";

/**
 * Reading and writing the review-import tables.
 *
 * ---------------------------------------------------------------------------
 * Two tables, two clients, on purpose
 * ---------------------------------------------------------------------------
 * `imported_reviews` is public-read-of-published with owner scoping, so it is
 * read through the caller's own session and RLS decides what comes back.
 *
 * `profile_migrations` is admin-only — POLICIES.md files it under "Migration
 * internals". A therapist holds no grant on it at all, which is correct: it
 * carries the reviewer's notes about whether a claimed listing is really
 * theirs. So both the read and the write go through the service client, from
 * the server, *after* `requireTherapist` has authorised the caller and with
 * `profile_id` pinned to their own row. The service key is what makes the read
 * possible; the pinned id is what keeps it theirs.
 */

export type ImportedReview = {
  id: string;
  rating: number | null;
  review_text: string | null;
  reviewer_name: string | null;
  reviewer_anonymized: boolean | null;
  source_platform: string | null;
  public_label: string;
  is_public: boolean;
  review_date: string | null;
};

export type ImportRequest = {
  id: string;
  platform: string;
  source_url: string;
  status: string | null;
  created_at: string | null;
  completed_at: string | null;
  is_verified: boolean | null;
  imported_review_count: number | null;
  migration_notes: string | null;
};

/** Reviews already carried across, newest first. Empty when the table is unreachable. */
export async function listMyImportedReviews(profileId: string): Promise<ImportedReview[]> {
  const { data, error } = await createSessionClient()
    .from("imported_reviews")
    .select(
      "id,rating,review_text,reviewer_name,reviewer_anonymized,source_platform,public_label,is_public,review_date",
    )
    .eq("profile_id", profileId)
    .order("review_date", { ascending: false })
    .limit(50);

  return error ? [] : ((data ?? []) as unknown as ImportedReview[]);
}

/** Every import this therapist has asked for, newest first. */
export async function listMyImportRequests(profileId: string): Promise<ImportRequest[]> {
  let supabase;
  try {
    supabase = createServiceClient();
  } catch {
    return [];
  }

  const { data, error } = await supabase
    .from("profile_migrations")
    .select(
      "id,platform,source_url,status,created_at,completed_at,is_verified,imported_review_count,migration_notes",
    )
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(20);

  return error ? [] : ((data ?? []) as unknown as ImportRequest[]);
}

export type ImportRequestOutcome =
  | { ok: true }
  | { ok: false; error: string }
  /** The same link is already queued. Saying so beats a second identical row. */
  | { ok: false; error: string; duplicate: true };

/**
 * Queue an import request.
 *
 * Refuses a second request for a link that is already on the list rather than
 * writing a duplicate: the therapist reads it as "nothing happened", and the
 * admin queue grows a row that says the same as the one above it.
 */
export async function requestReviewImport(
  profileId: string,
  request: ReviewImportRequest,
): Promise<ImportRequestOutcome> {
  let supabase;
  try {
    supabase = createServiceClient();
  } catch {
    return { ok: false, error: "Imports are not available on this deployment." };
  }

  const row = toMigrationRow(request, profileId);

  const existing = await supabase
    .from("profile_migrations")
    .select("id,status")
    .eq("profile_id", profileId)
    .eq("source_url", row.source_url)
    .limit(1);

  if (!existing.error && (existing.data ?? []).length > 0) {
    return {
      ok: false,
      duplicate: true,
      error: "That link is already on your list below.",
    };
  }

  const { error } = await supabase.from("profile_migrations").insert(row);

  if (error) {
    return { ok: false, error: `We could not queue that import: ${error.message}` };
  }

  return { ok: true };
}
