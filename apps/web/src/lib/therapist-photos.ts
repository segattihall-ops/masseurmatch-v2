import "server-only";

import { createAnonClient, hasSupabaseCredentials } from "@masseurmatch/db/client";
import type { TherapistListing } from "@masseurmatch/db/actions/directory-config";

import { hasImage } from "@/lib/cloudinary";

/**
 * Attach the first approved real profile photo when the listing row does not
 * already expose avatar_url or photo_url.
 *
 * This deliberately lives in the web layer instead of directory.ts while the
 * feature-port PR is changing that shared data-access file. The query is
 * batched across all missing profile IDs, avoiding one database request per
 * card.
 */
export async function withApprovedProfilePhotos(
  therapists: TherapistListing[],
): Promise<TherapistListing[]> {
  const missingPhotoIds = therapists
    .filter((therapist) => !hasImage(therapist.avatar_url) && !hasImage(therapist.photo_url))
    .map((therapist) => therapist.id);

  if (missingPhotoIds.length === 0 || !hasSupabaseCredentials()) return therapists;

  const { data, error } = await createAnonClient()
    .from("profile_photos")
    .select("profile_id,url,is_primary,sort_order")
    .in("profile_id", missingPhotoIds)
    .eq("moderation_status", "approved")
    .order("is_primary", { ascending: false })
    .order("sort_order", { ascending: true });

  if (error) throw new Error(`Failed to load directory profile photos: ${error.message}`);

  const firstPhotoByProfile = new Map<string, string>();

  for (const photo of data ?? []) {
    if (!photo.profile_id || !hasImage(photo.url) || firstPhotoByProfile.has(photo.profile_id)) {
      continue;
    }
    firstPhotoByProfile.set(photo.profile_id, photo.url);
  }

  if (firstPhotoByProfile.size === 0) return therapists;

  return therapists.map((therapist) => {
    if (hasImage(therapist.avatar_url) || hasImage(therapist.photo_url)) return therapist;

    const approvedPhoto = firstPhotoByProfile.get(therapist.id);
    return approvedPhoto ? { ...therapist, photo_url: approvedPhoto } : therapist;
  });
}
