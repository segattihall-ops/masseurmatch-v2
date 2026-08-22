"use server";

import { getViewer } from "@masseurmatch/db/auth";
import { createServiceClient } from "@masseurmatch/db/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { listingSchema, toProfilePatch } from "@/lib/listing";
import { changedSensitiveFields } from "@/lib/onboarding";

import type { StepState } from "../onboarding/form-state";

/**
 * Save the full listing.
 *
 * The sibling of `saveProfile` in `actions.ts`, which edits the eleven fields
 * the first version of this page offered. Both write the same row through the
 * same trusted path and both re-review the same way; this one covers every
 * field the therapist actually has.
 *
 * Re-moderation follows the rule `actions.ts` sets out and does not restate:
 * an approved profile whose sensitive fields change becomes
 * `moderation_status = 'pending_review'` while `profile_status` stays
 * `approved`, so a typo fix in a bio does not delist anyone while they wait
 * for a human.
 */

async function requireTherapistId(): Promise<string> {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in?next=%2Fprofile");
  if (viewer.role !== "provider" && viewer.role !== "admin") redirect("/not-authorized");
  return viewer.user.id;
}

/**
 * Zod issues keyed the way the form reads them.
 *
 * Paths are flattened with a dot — `sessions.1.incall` — because the errors
 * that matter most here belong to a row inside a repeatable collection, and
 * `flatten()` discards everything below the first segment. A form that only
 * knew "something in sessions is wrong" could not point at the row.
 */
function issuesByPath(error: {
  issues: readonly { path: PropertyKey[]; message: string }[];
}): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "form";
    (out[key] ??= []).push(issue.message);
  }
  return out;
}

export async function saveListing(_prev: StepState, formData: FormData): Promise<StepState> {
  const userId = await requireTherapistId();

  /*
   * The client posts the whole listing as one JSON field rather than as flat
   * form entries. The shape is nested — sessions, hour ranges and education
   * are arrays of objects — and `FormData` can only express that by encoding
   * indices into key names, which both sides would then have to parse. One
   * payload, parsed once, keeps the schema the only thing that defines shape.
   */
  const raw = formData.get("listing");
  let submitted: unknown;
  try {
    submitted = JSON.parse(String(raw ?? ""));
  } catch {
    return { error: "That change was not saved: the form sent something unreadable." };
  }

  const parsed = listingSchema.safeParse(submitted);
  if (!parsed.success) return { fieldErrors: issuesByPath(parsed.error) };

  const patch: Record<string, unknown> = { ...toProfilePatch(parsed.data) };
  const supabase = createServiceClient();

  const { data: before, error: readError } = await supabase
    .from("profiles")
    // One literal, not a concatenation: the client parses this string at the
    // type level, and anything it cannot read collapses the row to an error type.
    .select(
      "display_name,full_name,headline,bio,avatar_url,photo_url,service_categories,additional_services,profile_status",
    )
    .eq("id", userId)
    .maybeSingle();

  if (readError) return { error: `That change was not saved: ${readError.message}` };
  if (!before) return { error: "That change was not saved. Please sign in again." };

  const changed = changedSensitiveFields(before, patch);
  const needsReview = before.profile_status === "approved" && changed.length > 0;
  if (needsReview) {
    patch.moderation_status = "pending_review";
    patch.moderation_notes = `Re-review after edit to: ${changed.join(", ")}`;
    patch.reviewed_at = null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ ...patch, updated_at: new Date().toISOString() } as never)
    .eq("id", userId)
    .select("id");

  if (error) return { error: `That change was not saved: ${error.message}` };
  if ((data ?? []).length === 0)
    return { error: "That change was not saved. Please sign in again." };

  revalidatePath("/profile");
  revalidatePath("/pro/listing");
  // The public page is ISR'd; without this the edit would not surface until the
  // hourly revalidation window elapsed.
  revalidatePath("/", "layout");

  return {
    ok: true,
    error: needsReview
      ? `Saved. Because you changed ${changed.join(", ")}, your profile is queued for another review — it stays visible in the meantime.`
      : undefined,
  };
}
