-- Close the remaining direct-client privilege escalation path on profiles.
--
-- RLS already restricts a provider to their own row, but ownership alone is not
-- enough: table/column privileges decide which fields that owner may write.
-- Production already has UPDATE narrowed to the ordinary content allowlist, but
-- authenticated still has INSERT on every profile column. A new auth user could
-- therefore create their own row with profile_status='approved', paid tier or
-- verification flags before the dashboard creates the normal draft row.
--
-- The dashboard now inserts only id/user_id and relies on database defaults for
-- the safe initial lifecycle state. All later content edits use the UPDATE
-- allowlist below. Approval, visibility, billing, verification, moderation,
-- suspension, ranking and analytics fields remain server/service-role only.

begin;

revoke insert on table public.profiles from authenticated;
grant insert (id, user_id) on table public.profiles to authenticated;

-- Re-assert the intended UPDATE contract so production cannot drift back to a
-- table-wide grant. These are the only columns written through updateMyProfile.
revoke update on table public.profiles from authenticated;
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
