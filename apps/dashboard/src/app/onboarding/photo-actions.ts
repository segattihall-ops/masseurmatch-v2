"use server";

import { createSessionClient, getViewer } from "@masseurmatch/db/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { photoLimitForProfile, verifyUploadedAsset } from "@/lib/cloudinary";
import { getOrCreateMyProfile } from "@/lib/profile";

import type { StepState } from "./form-state";

async function requireTherapistId(): Promise<string> {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in?next=%2Fonboarding");
  if (viewer.role !== "provider" && viewer.role !== "admin") redirect("/not-authorized");
  return viewer.user.id;
}

/**
 * Persist a photo the browser says it uploaded.
 *
 * The client passes a `public_id`, not a URL. The URL is fetched from
 * Cloudinary during verification, so a caller cannot store an arbitrary
 * off-platform image by claiming it as their own upload.
 *
 * The quota is re-checked here even though the ticket endpoint already checked
 * it: tickets are minted one at a time, and a client could hold several and
 * confirm them together.
 */
export async function confirmPhoto(_prev: StepState, formData: FormData): Promise<StepState> {
  const userId = await requireTherapistId();
  const publicId = String(formData.get("public_id") ?? "").trim();
  if (!publicId) return { error: "Nothing to save." };

  const { profile, photoCount } = await getOrCreateMyProfile(userId);
  const limit = photoLimitForProfile(profile);
  if (photoCount >= limit) {
    return { error: `Your plan allows ${limit} photos.` };
  }

  let asset;
  try {
    asset = await verifyUploadedAsset(userId, publicId);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not verify that upload." };
  }

  const supabase = createSessionClient();
  const { error } = await supabase.from("profile_photos").insert({
    profile_id: profile.id,
    user_id: userId,
    url: asset.url,
    storage_path: publicId,
    // New imagery is always unreviewed, whatever the profile's own status.
    moderation_status: "pending",
    // A pending photo cannot be public Primary. Database guards also enforce
    // this, so a direct REST insert cannot bypass the same rule.
    is_primary: false,
    sort_order: photoCount,
  });

  if (error) return { error: `Could not save that photo: ${error.message}` };

  // Do not mirror a pending upload onto profiles.photo_url/avatar_url. Public
  // cards and detail pages resolve their images from approved profile_photos;
  // mirroring here used to make a brand-new unreviewed image visible as soon as
  // an already-approved therapist uploaded it.
  revalidatePath("/onboarding");
  revalidatePath("/therapist/photos");
  return { ok: true };
}

/**
 * Make one of the caller's photos the primary.
 *
 * Two statements, deliberately ordered new-first: if the second one fails the
 * profile briefly has two primaries, which the UI resolves on next read. The
 * other order — clear-all then set — fails into zero primaries, which is the
 * state the public card cannot render from.
 */
export async function setPrimaryPhoto(_prev: StepState, formData: FormData): Promise<StepState> {
  const userId = await requireTherapistId();
  const photoId = String(formData.get("photo_id") ?? "").trim();
  if (!photoId) return { error: "Nothing to select." };

  const supabase = createSessionClient();

  const { data: chosen, error: setError } = await supabase
    .from("profile_photos")
    .update({ is_primary: true })
    .eq("id", photoId)
    .eq("user_id", userId)
    .select("id,url");

  if (setError) return { error: `Could not set that photo as primary: ${setError.message}` };
  if ((chosen ?? []).length === 0) return { error: "That photo was not found." };

  const { error: clearError } = await supabase
    .from("profile_photos")
    .update({ is_primary: false })
    .eq("user_id", userId)
    .neq("id", photoId);

  if (clearError) return { error: `Set as primary, but could not unmark the previous one.` };

  // Keep the public card's denormalised copy in step with the new choice.
  const url = chosen?.[0]?.url;
  if (url) {
    await updateMyProfile(userId, { photo_url: url, avatar_url: url });
  }

  revalidatePath("/therapist/photos");
  return { ok: true };
}

/** Remove one of the caller's own photos. RLS scopes the delete regardless. */
export async function deletePhoto(_prev: StepState, formData: FormData): Promise<StepState> {
  const userId = await requireTherapistId();
  const photoId = String(formData.get("photo_id") ?? "").trim();
  if (!photoId) return { error: "Nothing to remove." };

  const supabase = createSessionClient();
  const { data, error } = await supabase
    .from("profile_photos")
    .delete()
    .eq("id", photoId)
    .eq("user_id", userId)
    .select("id");

  if (error) return { error: `Could not remove that photo: ${error.message}` };
  if ((data ?? []).length === 0) return { error: "That photo was not found." };

  revalidatePath("/onboarding");
  revalidatePath("/therapist/photos");
  return { ok: true };
}
