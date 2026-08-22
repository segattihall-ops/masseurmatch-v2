"use server";

import { revalidatePath } from "next/cache";

import { requireTherapist } from "@/lib/guards";
import { requestReviewImport } from "@/lib/imported-reviews";
import { getOrCreateMyProfile } from "@/lib/profile";
import { LIMITS, rateLimit } from "@/lib/rate-limit";
import { reviewImportSchema } from "@/lib/review-imports";

import type { ImportFormState } from "./form-state";

/**
 * Ask for an existing listing's reviews to be brought across.
 *
 * The therapist supplies a link; the row lands in `profile_migrations` for a
 * person to check. Nothing they submit here becomes a public review — see the
 * note at the top of `@/lib/review-imports`.
 *
 * `profile_id` comes from the authorised session, never from the form. It is
 * the only thing stopping a request being filed against somebody else's
 * profile, and a hidden input would put that decision in the browser.
 */
export async function requestImport(
  _prev: ImportFormState,
  formData: FormData,
): Promise<ImportFormState> {
  const viewer = await requireTherapist("/pro/import-reviews");

  const limited = rateLimit(
    `review-import:${viewer.user.id}`,
    LIMITS.reviewImport.limit,
    LIMITS.reviewImport.windowMs,
  );
  if (!limited.ok) {
    return { error: "That is a lot of requests at once. Try again in a little while." };
  }

  const parsed = reviewImportSchema.safeParse({
    source_url: formData.get("source_url") ?? "",
    platform: formData.get("platform") ?? "",
    email: formData.get("email") ?? "",
    notes: formData.get("notes") ?? "",
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { profile } = await getOrCreateMyProfile(viewer.user.id);
  const outcome = await requestReviewImport(profile.id, parsed.data);

  if (!outcome.ok) return { error: outcome.error };

  revalidatePath("/pro/import-reviews");
  return { ok: true };
}
