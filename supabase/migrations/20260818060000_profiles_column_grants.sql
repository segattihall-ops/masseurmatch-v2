-- Stop `authenticated` writing the columns that decide publication, money and
-- trust on `profiles`.
--
-- ---------------------------------------------------------------------------
-- What is wrong today
-- ---------------------------------------------------------------------------
-- `profiles_update_canonical` pins ownership and says nothing about which
-- columns changed, and `authenticated` holds UPDATE on all 182 columns. Since
-- `profiles_select_canonical` publishes a row on
--
--   profile_status = 'approved' AND visibility_status = 'public'
--
-- any signed-in therapist can publish their own listing with one PATCH to the
-- REST API, skipping the FOSTA-SESTA review entirely. Self-granting Elite,
-- featured placement and the verification badges follow from the same hole.
-- Full write-up and the measurements behind it: docs/SELF-GRANT.md.
--
-- ---------------------------------------------------------------------------
-- Why a column grant rather than a policy predicate
-- ---------------------------------------------------------------------------
-- Column grants are checked *before* RLS, so this holds even if a future policy
-- is written too loosely — which is the failure this schema has already had
-- once. A `WITH CHECK` comparing each column to its old value would need a
-- subquery per column and would silently stop protecting anything the day
-- someone adds a column and forgets to list it. A grant fails closed on a new
-- column instead: it is simply not grantable until someone says so.
--
-- ---------------------------------------------------------------------------
-- Blast radius, measured rather than assumed
-- ---------------------------------------------------------------------------
-- Both applications sharing this database were checked before writing this:
--
--   * v2 (this repo) writes `profiles` as the authenticated user in exactly one
--     place, `updateMyProfile`, and the privileged columns moved to
--     `updateModerationState` (service client) in the same change as this file.
--   * The old site (X-RANKFLOW-MEDIA-GROUP/masseurmatch, live) writes
--     `profiles` in 46 places and **every one of them uses the service-role
--     client**. Its only browser-side write path, `useProfile().updateProfile`,
--     is never called — the single component consuming that hook destructures
--     `{ profile, loading }` only. The three other `updateProfile` call sites in
--     that repo belong to `useSignup()`, a local form-state context.
--
-- So no live code loses a write it is making today.

begin;

revoke update on table public.profiles from authenticated;

-- What a therapist edits about themselves, and nothing else. Every column here
-- is content; none of it decides visibility, entitlement or verification.
grant update (
  display_name,
  full_name,
  headline,
  bio,
  city,
  state,
  phone,
  email,
  service_categories,
  additional_services,
  incall_price,
  outcall_price,
  starting_price,
  avatar_url,
  photo_url,
  travel_schedule,
  available_now,
  available_now_expires,
  updated_at
) on table public.profiles to authenticated;

commit;

-- Verification, as the therapist's own JWT against their own row:
--
--   update public.profiles set is_verified_identity = true where id = auth.uid();
--   -- expected: ERROR: permission denied for table profiles
--
--   update public.profiles set headline = 'still works' where id = auth.uid();
--   -- expected: UPDATE 1
