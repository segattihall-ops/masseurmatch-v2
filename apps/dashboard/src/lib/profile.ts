import "server-only";

import { createSessionClient } from "@masseurmatch/db/auth";
import { createServiceClient } from "@masseurmatch/db/client";
import { toProfileStatus, type ProfileStatus } from "@masseurmatch/db/profile-status";

import type { OnboardingSnapshot } from "./onboarding";

/**
 * The signed-in therapist's own profile.
 *
 * Owner-scoped reads, initial creation and ordinary content writes use the
 * session client so RLS remains part of the real path. Privileged lifecycle
 * fields such as approval, moderation and visibility are written only through
 * the narrowly typed service-role helper at the bottom of this file after the
 * caller has already been authorized by a server action or route.
 *
 * Convention, verified against production: `profiles.id` has no default and is
 * required on insert, and every existing row has `id = user_id`. The profile's
 * primary key *is* the auth user id. That is also why the legacy policies
 * keyed on `id` and the current ones keyed on `user_id` agree today.
 */

/**
 * Every column the dashboard reads about the caller.
 *
 * The availability block — `available_now`, `available_now_expires`,
 * `travel_schedule`, `offers_outcall`, `outcall` — is here because leaving it
 * out did not fail loudly. `isAvailableNow()` takes an object with optional
 * fields, so an unselected `available_now` is `undefined`, and `undefined` is
 * falsy: the badge read OFF for everyone, the "you are already available"
 * guard in `setAvailableNow` never fired, and the dashboard's travel card was
 * permanently empty. A missing column in a select list is a silent `false`
 * everywhere it is read, which is why the list has to match what the callers
 * actually ask for.
 *
 * `tier_granted_until` is deliberately absent: it is in
 * `migrations/courtesy_tier_grants.sql` but not in the generated types, and
 * naming a column that does not exist fails the whole select rather than that
 * one field. `resolveTier` treats it as absent and falls back to `free`.
 */
const PROFILE_COLUMNS =
  "id,user_id,display_name,full_name,headline,bio,city,state,phone,email,slug," +
  "service_categories,additional_services,incall_price,outcall_price,starting_price," +
  "avatar_url,photo_url,profile_status,visibility_status,subscription_tier," +
  "moderation_status,moderation_notes," +
  "is_verified_phone,is_verified_identity,identity_verified_at," +
  "subscription_status,photo_limit,updated_at," +
  "available_now,available_now_expires,travel_schedule,traveling,offers_outcall,outcall," +
  "profile_completeness,completion_percentage,profile_views,contact_clicks,spike_until";

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

  /** Availability, as stored. Read through `@masseurmatch/db/available-now`. */
  available_now: boolean | null;
  available_now_expires: string | null;
  /** Raw `jsonb`. Parse with `parseTravelSchedule` rather than trusting the shape. */
  travel_schedule: unknown;
  traveling: boolean | null;
  offers_outcall: boolean | null;
  outcall: boolean | null;
  /**
   * Two of production's four rival completeness columns. Neither is computed by
   * anything in this repo — `scoreProfile` derives the number the dashboard
   * shows — so these are only read to display what the old admin CMS wrote.
   */
  profile_completeness: number | null;
  completion_percentage: number | null;
  profile_views: number | null;
  /** All-time contact clicks, counted by the public site. */
  contact_clicks: number | null;
  /**
   * When the running visibility Spike ends.
   *
   * Same class of bug as `available_now`: `startSpike` reads it through a cast,
   * so leaving it unselected meant `spikeAllowance` never saw a Spike already
   * running and the "one at a time" guard could not fire.
   */
  spike_until: string | null;
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
        // Never send lifecycle, billing or trust fields from the authenticated
        // client. PostgreSQL owns the safe initial state (`draft`, `hidden`,
        // free/unverified defaults), which lets INSERT grants stay fail-closed.
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

/**
 * Write the columns a therapist must never be able to write for themselves.
 *
 * `profile_status`, `visibility_status` and the `moderation_*` fields decide
 * whether a listing is public and whether a human has looked at it. They are
 * changed here — through the service client, from inside a server action that
 * has already authorised the caller — rather than through `updateMyProfile`,
 * so that the therapist's own permission on `profiles` never has to include
 * them.
 *
 * That distinction is the application half of the fix in `docs/SELF-GRANT.md`.
 * Until the column grant lands, this changes nothing an attacker cannot already
 * do directly; after it lands, it is what keeps "submit for review" working
 * when `authenticated` can no longer write those columns.
 *
 * Deliberately takes no arbitrary patch from a caller's form data — every call
 * site below passes literals.
 */
export async function updateModerationState(
  userId: string,
  patch: {
    profile_status?: string;
    visibility_status?: string;
    moderation_status?: string;
    moderation_notes?: string;
    reviewed_at?: string | null;
  },
): Promise<number> {
  const { data, error } = await createServiceClient()
    .from("profiles")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select("id");

  if (error) throw new Error(`Could not save: ${error.message}`);
  return (data ?? []).length;
}
