"use server";

import { createSessionClient, getViewer } from "@masseurmatch/db/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { photoLimitFor, verifyUploadedAsset } from "@/lib/cloudinary";
import { getOrCreateMyProfile, updateMyProfile } from "@/lib/profile";

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
  const limit = photoLimitFor(profile.subscription_tier, profile.photo_limit);
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
    is_primary: photoCount === 0,
    sort_order: photoCount,
  });

  if (error) return { error: `Could not save that photo: ${error.message}` };

  // Mirror the first photo onto the profile so the public card has something
  // to render without a join.
  if (photoCount === 0) {
    await updateMyProfile(userId, { photo_url: asset.url, avatar_url: asset.url });
  }

  revalidatePath("/onboarding");
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
  return { ok: true };
}
