import "server-only";

import { createSessionClient } from "@masseurmatch/db/auth";
import { toProfileStatus, type ProfileStatus } from "@masseurmatch/db/profile-status";
import { HIDDEN } from "@masseurmatch/db/visibility";

import type { OnboardingSnapshot } from "./onboarding";

/**
 * The signed-in therapist's own profile.
 *
 * Every read and write here goes through the *session* client, so RLS applies
 * on the real path — a therapist cannot reach another therapist's row even if
 * a bug passed the wrong id. The service-role client is deliberately not used.
 *
 * Convention, verified against production: `profiles.id` has no default and is
 * required on insert, and every existing row has `id = user_id`. The profile's
 * primary key *is* the auth user id. That is also why the legacy policies
 * keyed on `id` and the current ones keyed on `user_id` agree today.
 */

const PROFILE_COLUMNS =
  "id,user_id,display_name,full_name,headline,bio,city,state,phone,email,slug," +
  "service_categories,additional_services,incall_price,outcall_price,starting_price," +
  "avatar_url,photo_url,profile_status,visibility_status,subscription_tier," +
  "moderation_status,moderation_notes," +
  "is_verified_phone,is_verified_identity,identity_verified_at," +
  "subscription_status,photo_limit,updated_at";

export type MyProfile = {
  id: string;
  user_id: string | null;
  display_name: string | null;
  full_name: string | null;
  headline: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  email: string | null;
  slug: string | null;
  service_categories: string[] | null;
  additional_services: string[] | null;
  incall_price: number | null;
  outcall_price: number | null;
  starting_price: number | null;
  avatar_url: string | null;
  photo_url: string | null;
  profile_status: string | null;
  visibility_status: string | null;
  moderation_status: string | null;
  moderation_notes: string | null;
  is_verified_phone: boolean | null;
  is_verified_identity: boolean | null;
  identity_verified_at: string | null;
  subscription_tier: string | null;
  subscription_status: string | null;
  photo_limit: number | null;
  updated_at: string;
};

export type MyProfileView = {
  profile: MyProfile;
  photoCount: number;
  status: ProfileStatus;
  snapshot: OnboardingSnapshot;
};

/**
 * Load the caller's profile, creating an empty one on first visit.
 *
 * A therapist who has signed up but never onboarded has no row yet, and every
 * onboarding step needs somewhere to write. Creating it here keeps the steps
 * themselves free of "does it exist" branching.
 */
export async function getOrCreateMyProfile(userId: string): Promise<MyProfileView> {
  const supabase = createSessionClient();

  const existing = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", userId)
    .maybeSingle();

  if (existing.error) {
    throw new Error(`Could not load your profile: ${existing.error.message}`);
  }

  let profile = existing.data as unknown as MyProfile | null;

  if (!profile) {
    const created = await supabase
      .from("profiles")
      .insert({
        id: userId,
        user_id: userId,
        // `draft`, not `pending`. A profile exists from the first sign-in, long
        // before anyone asks for it to be reviewed. Creating it as `pending`
        // put empty profiles straight into the admin moderation queue — the
        // production database already distinguished these, which is how the bug
        // surfaced.
        profile_status: "draft",
        visibility_status: HIDDEN,
      })
      .select(PROFILE_COLUMNS)
      .single();

    if (created.error) {
      throw new Error(`Could not start your profile: ${created.error.message}`);
    }
    profile = created.data as unknown as MyProfile;
  }

  const { count, error: countError } = await supabase
    .from("profile_photos")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profile.id);

  if (countError) {
    throw new Error(`Could not count your photos: ${countError.message}`);
  }

  const photoCount = count ?? 0;

  return {
    profile,
    photoCount,
    status: toProfileStatus(profile.profile_status),
    snapshot: {
      display_name: profile.display_name,
      full_name: profile.full_name,
      headline: profile.headline,
      bio: profile.bio,
      city: profile.city,
      state: profile.state,
      phone: profile.phone,
      email: profile.email,
      service_categories: profile.service_categories,
      incall_price: profile.incall_price,
      outcall_price: profile.outcall_price,
      photoCount,
    },
  };
}

export type MyPhoto = {
  id: string;
  url: string | null;
  moderation_status: string | null;
  is_primary: boolean | null;
  sort_order: number | null;
};

/** The caller's photos, in display order. RLS scopes this to their own rows. */
export async function listMyPhotos(profileId: string): Promise<MyPhoto[]> {
  const { data, error } = await createSessionClient()
    .from("profile_photos")
    .select("id,url,moderation_status,is_primary,sort_order")
    .eq("profile_id", profileId)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(`Could not load your photos: ${error.message}`);
  return (data ?? []) as unknown as MyPhoto[];
}

/**
 * Apply a partial update to the caller's own profile.
 *
 * Scoped by `id = userId` *and* subject to RLS, so it is owner-only twice over.
 * Returns the number of rows written so a caller can tell "no change" from
 * "silently filtered by a policy" — RLS returns zero rows rather than an error
 * when it refuses an update, which is easy to mistake for success.
 */
export async function updateMyProfile(
  userId: string,
  patch: Record<string, unknown>,
): Promise<number> {
  const { data, error } = await createSessionClient()
    .from("profiles")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select("id");

  if (error) throw new Error(`Could not save: ${error.message}`);
  return (data ?? []).length;
}
