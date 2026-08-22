"use server";

import { revalidatePath } from "next/cache";
import { HIDDEN, PUBLIC } from "@masseurmatch/db/visibility";

import type { ToggleResult } from "@/components/pro/toggle-action-button";
import { requireTherapist } from "@/lib/guards";
import { updateModerationState } from "@/lib/profile";

import { setAvailableNow } from "../available-now-actions";

/**
 * The two toggles the dashboard can flip in place.
 *
 * Travel dates and outcall radius are not here on purpose: both need more than
 * a boolean, and a button that half-configures them would leave a therapist
 * with a state they cannot see or correct from this page.
 */

export async function toggleAvailableNow(next: boolean): Promise<ToggleResult> {
  return setAvailableNow(next);
}

/**
 * Show or hide the listing.
 *
 * Visibility and approval are separate states, and this only touches the first.
 * Hiding a profile does not withdraw it from review, and turning it back on
 * does not re-approve it — a therapist who takes a fortnight off should not
 * come back to a queue.
 *
 * `visibility_status` is intentionally not directly writable by authenticated
 * clients. This server action authorizes the therapist first and then uses the
 * trusted writer, so the UI remains functional without reopening profile
 * approval, billing, or verification fields to direct REST writes.
 */
export async function toggleVisibility(next: boolean): Promise<ToggleResult> {
  const viewer = await requireTherapist("/pro/dashboard");

  const written = await updateModerationState(viewer.user.id, {
    visibility_status: next ? PUBLIC : HIDDEN,
  });

  if (written === 0) {
    return { ok: false, message: "That did not save. Please sign in again." };
  }

  // The public directory caches; without this the listing would lag the switch.
  revalidatePath("/", "layout");

  return {
    ok: true,
    message: next
      ? "Your profile is discoverable again."
      : "Your profile is hidden from search and discovery.",
  };
}
