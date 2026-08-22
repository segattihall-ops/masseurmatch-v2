-- Restore the INSERT-side trust guard on `profiles`.
--
-- ---------------------------------------------------------------------------
-- Why this exists separately from 20260818030000_protect_trust_state.sql
-- ---------------------------------------------------------------------------
-- That migration created three guards. Only one of them is live today:
--
--   prevent_sensitive_profile_mutation    present
--   guard_new_profile_trust_state         MISSING  <- this file
--   guard_profile_photo_owner_mutation    MISSING  <- still open, see below
--
-- The database was never brought up to date by `supabase db push`; migrations
-- were applied by hand under different version numbers, and these two were
-- missed. The ledger has since been reconciled, so every file up to
-- 20260822072000 is recorded as applied — which means re-running the August
-- file is no longer possible, and would be the wrong fix anyway: it also
-- recreates `prevent_sensitive_profile_mutation` from its August definition,
-- discarding the later `allow_service_role_sensitive_profile_mutation` change,
-- and it belongs to a set whose `rls_baseline` sibling would add four stale
-- policies alongside the current `profiles_*_canonical` ones. Permissive RLS
-- policies are OR'd, so that widens public read access rather than restoring
-- anything.
--
-- So the guard is reintroduced on its own, unchanged in substance from the
-- original, against a schema that has been verified to still carry all 36
-- columns it reads.
--
-- ---------------------------------------------------------------------------
-- What it protects, and how urgent that is
-- ---------------------------------------------------------------------------
-- `prevent_sensitive_profile_mutation` covers UPDATE. Nothing covered INSERT,
-- so a row could in principle be created already carrying a paid tier, a boost,
-- a verification flag or an avatar — arriving pre-elevated rather than being
-- elevated afterwards.
--
-- In practice that path is already closed one layer down: `authenticated` holds
-- only SELECT and DELETE on `public.profiles`, so a provider JWT cannot INSERT
-- at all. This is defence in depth, not an open hole — which is why it is a
-- migration of its own rather than a hotfix.
--
-- Account setup runs as `service_role` and returns early, and the session-client
-- fallback creates exactly draft/hidden defaults, so both existing write paths
-- pass unchanged.
--
-- ---------------------------------------------------------------------------
-- Still open after this
-- ---------------------------------------------------------------------------
-- `guard_profile_photo_owner_mutation` is also absent. It is left out
-- deliberately: `profile_photos` carries eleven triggers today, including
-- `trg_profile_photos_set_user_id` and `trg_sync_profile_photo_moderation_queue`,
-- so the ownership half is covered and the moderation half needs checking
-- against those before a guard is layered on top. That is its own change.

begin;

create or replace function public.guard_new_profile_trust_state()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.role()) = 'service_role'
     or exists (
       select 1
       from public.user_roles ur
       where ur.user_id = (select auth.uid())
         and ur.role = 'admin'
     ) then
    return new;
  end if;

  if coalesce(new.role, 'provider') <> 'provider'
     or coalesce(new.profile_status::text, 'draft') <> 'draft'
     or coalesce(new.visibility_status::text, 'hidden') <> 'hidden'
     or coalesce(new.verification_status, 'unverified') <> 'unverified'
     or coalesce(new.is_verified_identity, false)
     or coalesce(new.is_verified_phone, false)
     or coalesce(new.is_verified_email, false)
     or coalesce(new.is_verified_profile, false)
     or coalesce(new.is_verified_photos, false)
     or coalesce(new.is_featured, false)
     or coalesce(new.is_suspended, false)
     or coalesce(new.is_banned, false)
     or new.identity_verified_at is not null
     or new.stripe_verification_session_id is not null
     or new.featured_until is not null
     or coalesce(new.visibility_level, 0) <> 0
     or coalesce(new.boost_score, 0) <> 0
     or new.spike_until is not null
     or coalesce(new.subscription_tier, 'free') <> 'free'
     or coalesce(new.tier, 'free') <> 'free'
     or new._tier is not null
     or new.subscription_plan is not null
     or new.subscription_status is not null
     or coalesce(new.photo_limit, 1) <> 1
     or new.stripe_customer_id is not null
     or new.stripe_subscription_id is not null
     or new.current_period_end is not null
     or new.subscription_current_period_start is not null
     or new.subscription_current_period_end is not null
     or coalesce(new.subscription_cancel_at_period_end, false)
     or coalesce(new.referral_bonus_months, 0) <> 0
     or new.referral_bonus_expires_at is not null
     or new.referral_bonus_tier is not null
     or new.tier_granted_until is not null
     or new.avatar_url is not null
     or new.photo_url is not null
  then
    raise exception 'new provider profiles must start as an unreviewed free hidden listing'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_new_profile_trust_state on public.profiles;
create trigger guard_new_profile_trust_state
before insert on public.profiles
for each row
execute function public.guard_new_profile_trust_state();

commit;

-- Verify:
--   select tgname from pg_trigger
--   where tgrelid = 'public.profiles'::regclass and not tgisinternal;
