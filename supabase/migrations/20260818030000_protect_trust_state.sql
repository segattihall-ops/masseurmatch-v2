-- ==========================================================================
-- Protect platform trust state from owner mutation
-- ==========================================================================
--
-- Production audit on 2026-08-18 found that the row-level owner policies are
-- intentionally broad, while the existing BEFORE UPDATE trigger protects only
-- a subset of system-controlled columns. In particular, an authenticated owner
-- still holds UPDATE on identity-verification, featured/ranking, billing-limit
-- and photo-moderation state.
--
-- RLS answers "which row may this user write?". These guards answer the
-- separate question "which state on that row may the owner claim?".
--
-- This migration does not change any profile data. Apply to staging first.
-- ==========================================================================

begin;

-- --------------------------------------------------------------------------
-- 1. Extend the existing profile update guard.
-- --------------------------------------------------------------------------
-- Admins and service_role remain the only writers for platform assertions and
-- entitlements. Ordinary profile content is intentionally untouched.
create or replace function public.prevent_sensitive_profile_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Trusted backend (service role) or an admin acting through their own JWT.
  if (select auth.role()) = 'service_role'
     or exists (
       select 1
       from public.user_roles ur
       where ur.user_id = (select auth.uid())
         and ur.role = 'admin'
     ) then
    return new;
  end if;

  if new.id is distinct from old.id
     or new.user_id is distinct from old.user_id
     or new.role is distinct from old.role
     or new.status is distinct from old.status
     or new.profile_status is distinct from old.profile_status
     or new.visibility_status is distinct from old.visibility_status
     or new.is_suspended is distinct from old.is_suspended
     or new.is_banned is distinct from old.is_banned
     or new.moderation_notes is distinct from old.moderation_notes
     or new.admin_notes is distinct from old.admin_notes
     or new.rejection_reason is distinct from old.rejection_reason
     or new.suspension_reason is distinct from old.suspension_reason
     or new.banned_reason is distinct from old.banned_reason

     -- Public trust assertions.
     or new.is_verified_identity is distinct from old.is_verified_identity
     or new.identity_verified_at is distinct from old.identity_verified_at
     or new.is_verified_phone is distinct from old.is_verified_phone
     or new.is_verified_email is distinct from old.is_verified_email
     or new.is_verified_profile is distinct from old.is_verified_profile
     or new.verification_status is distinct from old.verification_status
     or new.stripe_verification_session_id is distinct from old.stripe_verification_session_id

     -- Public image pointers are platform-controlled. Approved gallery photos
     -- are read from profile_photos; an owner must not swap an already reviewed
     -- public image by PATCHing these legacy mirror columns.
     or new.avatar_url is distinct from old.avatar_url
     or new.photo_url is distinct from old.photo_url

     -- Ranking / paid visibility assertions.
     or new.is_featured is distinct from old.is_featured
     or new.featured_until is distinct from old.featured_until
     or new.visibility_level is distinct from old.visibility_level
     or new.boost_score is distinct from old.boost_score
     or new.spike_until is distinct from old.spike_until

     -- Subscription / entitlement state.
     or new.tier is distinct from old.tier
     or new._tier is distinct from old._tier
     or new.subscription_tier is distinct from old.subscription_tier
     or new.subscription_plan is distinct from old.subscription_plan
     or new.subscription_status is distinct from old.subscription_status
     or new.photo_limit is distinct from old.photo_limit
     or new.stripe_customer_id is distinct from old.stripe_customer_id
     or new.stripe_subscription_id is distinct from old.stripe_subscription_id
     or new.current_period_end is distinct from old.current_period_end
     or new.subscription_current_period_start is distinct from old.subscription_current_period_start
     or new.subscription_current_period_end is distinct from old.subscription_current_period_end
     or new.subscription_cancel_at_period_end is distinct from old.subscription_cancel_at_period_end
     or new.referral_bonus_months is distinct from old.referral_bonus_months
     or new.referral_bonus_expires_at is distinct from old.referral_bonus_expires_at
     or new.referral_bonus_tier is distinct from old.referral_bonus_tier
     or new.tier_granted_until is distinct from old.tier_granted_until
  then
    raise exception 'restricted profile fields may only be changed by an administrator or trusted backend'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

-- The production trigger already points at this function. Keep the migration
-- idempotent for fresh environments where it may not exist yet.
drop trigger if exists prevent_sensitive_profile_mutation on public.profiles;
create trigger prevent_sensitive_profile_mutation
before update on public.profiles
for each row
execute function public.prevent_sensitive_profile_mutation();

-- --------------------------------------------------------------------------
-- 2. A newly inserted owner row must start unreviewed and hidden.
-- --------------------------------------------------------------------------
-- The UPDATE guard cannot protect INSERT. Account setup uses service_role and
-- bypasses this check; the session-client fallback creates exactly draft/hidden
-- defaults and therefore also passes.
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

-- --------------------------------------------------------------------------
-- 3. Photo owners may reorder/delete their uploads, but may not approve them
--    or swap the bytes/URL under an already-reviewed row.
-- --------------------------------------------------------------------------
create or replace function public.guard_profile_photo_owner_mutation()
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

  if tg_op = 'INSERT' then
    if coalesce(new.moderation_status, 'pending') <> 'pending'
       or new.moderation_reason is not null then
      raise exception 'new profile photos must enter moderation as pending'
        using errcode = '42501';
    end if;
    return new;
  end if;

  if new.profile_id is distinct from old.profile_id
     or new.user_id is distinct from old.user_id
     or new.url is distinct from old.url
     or new.storage_path is distinct from old.storage_path
     or new.storage_bucket is distinct from old.storage_bucket
     or new.moderation_status is distinct from old.moderation_status
     or new.moderation_reason is distinct from old.moderation_reason
  then
    raise exception 'photo content and moderation state may only be changed by an administrator or trusted backend'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_profile_photo_owner_mutation on public.profile_photos;
create trigger guard_profile_photo_owner_mutation
before insert or update on public.profile_photos
for each row
execute function public.guard_profile_photo_owner_mutation();

commit;

-- --------------------------------------------------------------------------
-- Read-only verification after applying
-- --------------------------------------------------------------------------
-- select pg_get_functiondef('public.prevent_sensitive_profile_mutation()'::regprocedure);
-- select pg_get_functiondef('public.guard_new_profile_trust_state()'::regprocedure);
-- select pg_get_functiondef('public.guard_profile_photo_owner_mutation()'::regprocedure);
