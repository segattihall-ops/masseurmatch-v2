import "server-only";

import { createServiceClient } from "@masseurmatch/db/client";

export type AdminProfileDetail = {
  id: string;
  userId: string | null;
  slug: string | null;
  displayName: string | null;
  fullName: string | null;
  headline: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  profileStatus: string | null;
  visibilityStatus: string | null;
  moderationStatus: string | null;
  subscriptionTier: string | null;
  subscriptionStatus: string | null;
  verifiedIdentity: boolean;
  verifiedPhone: boolean;
  suspended: boolean;
  banned: boolean;
  updatedAt: string;
  photoCount: number;
};

export async function getAdminProfileDetail(profileId: string): Promise<AdminProfileDetail | null> {
  const db = createServiceClient();
  const [{ data, error }, photoResult] = await Promise.all([
    db
      .from("profiles")
      .select(
        "id,user_id,slug,display_name,full_name,headline,bio,city,state,phone,email,website,profile_status,visibility_status,moderation_status,subscription_tier,subscription_status,is_verified_identity,is_verified_phone,is_suspended,is_banned,updated_at",
      )
      .eq("id", profileId)
      .maybeSingle(),
    db
      .from("profile_photos")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId),
  ]);

  if (error) throw new Error(`Could not load profile: ${error.message}`);
  if (photoResult.error)
    throw new Error(`Could not count profile photos: ${photoResult.error.message}`);
  if (!data) return null;

  return {
    id: data.id,
    userId: data.user_id,
    slug: data.slug,
    displayName: data.display_name,
    fullName: data.full_name,
    headline: data.headline,
    bio: data.bio,
    city: data.city,
    state: data.state,
    phone: data.phone,
    email: data.email,
    website: data.website,
    profileStatus: data.profile_status,
    visibilityStatus: data.visibility_status,
    moderationStatus: data.moderation_status,
    subscriptionTier: data.subscription_tier,
    subscriptionStatus: data.subscription_status,
    verifiedIdentity: data.is_verified_identity ?? false,
    verifiedPhone: data.is_verified_phone ?? false,
    suspended: data.is_suspended ?? false,
    banned: data.is_banned ?? false,
    updatedAt: data.updated_at,
    photoCount: photoResult.count ?? 0,
  };
}
