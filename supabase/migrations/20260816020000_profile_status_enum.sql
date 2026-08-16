-- ============================================================================
-- profiles.profile_status : text  ->  enum
-- ============================================================================
-- NOT APPLIED. Read the risk section before running this anywhere.
--
-- Requested so the phase 6 moderation queue consumes a real enum rather than
-- free text. The application-level equivalent already exists and is safe:
-- `packages/db/profile-status.ts` defines the same five states and narrows the
-- generated `string | null` at the boundary. Phase 5 and 6 can be written
-- against that today, with or without this migration.
--
-- HISTORY: the first version of this migration declared four states and was
-- refused by its own guard in step 1, which found `draft` in production. That
-- was the guard working — and it exposed a real application bug, since new
-- profiles were being created as `pending` and so landed in the moderation
-- queue before their owner had submitted anything. Both are fixed.
--
-- ---------------------------------------------------------------------------
-- Why this one is riskier than it looks
-- ---------------------------------------------------------------------------
-- 1. `profile_status` is read by the live RLS policy `profiles_public_read_active`.
--    Postgres will not alter the type of a column a policy depends on, so the
--    policy must be dropped and recreated around the change. That policy is the
--    only thing gating the public directory — and on 2026-08-16 a *different*
--    change to its dependencies took the whole directory offline for ~2 hours
--    (see POLICIES.md). This is the same blast radius.
--
-- 2. The column is nullable and the current values were never enumerable from
--    here: the anon key only sees `approved` + `public` rows, and no service
--    role key is available in this environment. Step 1 below therefore *checks*
--    rather than assumes, and aborts if it finds a value the enum lacks.
--
-- 3. Postgres enums are hard to change later. Adding a value needs
--    `ALTER TYPE … ADD VALUE` (not transactional before PG12, awkward after);
--    removing one is effectively impossible without recreating the type. A
--    `CHECK (profile_status IN (...))` constraint on the existing text column
--    gives phase 6 exactly the same guarantee, is a single transactional
--    statement, and can be changed with one more. **That is the alternative
--    worth considering, and it is included at the bottom, commented out.**
--
-- Run against a Supabase branch first. Never straight at production.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. Abort if any existing value falls outside the five states
-- ---------------------------------------------------------------------------
-- Nulls are allowed through and become 'draft' in step 3.
do $$
declare
  offending text;
begin
  select string_agg(distinct profile_status, ', ')
    into offending
  from public.profiles
  where profile_status is not null
    and profile_status not in ('draft', 'pending', 'approved', 'rejected', 'suspended');

  if offending is not null then
    raise exception
      'profile_status holds values outside the enum: %. Reconcile these before migrating.',
      offending;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 2. Create the type
-- ---------------------------------------------------------------------------
-- `draft` is first: it is the initial state, and enum ordering is also the
-- sort order, so lifecycle order costs nothing to get right now and cannot be
-- changed later without recreating the type.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'profile_status') then
    create type public.profile_status as enum
      ('draft', 'pending', 'approved', 'rejected', 'suspended');
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 3. Backfill nulls before the column becomes typed
-- ---------------------------------------------------------------------------
-- 'draft' is the right default, not 'pending'. A null-status row was never
-- submitted for review, and backfilling it as 'pending' would sweep every one
-- of them into the moderation queue as though its owner had asked. Draft is
-- equally unpublishable and creates no work for a human.
--
-- NOTE: this is the one statement here that writes data. Check the blast
-- radius first:
--   select count(*) from public.profiles where profile_status is null;
update public.profiles set profile_status = 'draft' where profile_status is null;

-- ---------------------------------------------------------------------------
-- 4. Swap the type, dropping and restoring the dependent policy
-- ---------------------------------------------------------------------------
-- The policy is recreated with the identical predicate it carries today, read
-- back from pg_policy on 2026-08-16. `auth.uid()` is wrapped in a scalar
-- subselect here, which is a strict improvement: it is evaluated once per
-- statement instead of once per row.
drop policy if exists "profiles_public_read_active" on public.profiles;

alter table public.profiles
  alter column profile_status drop default,
  alter column profile_status type public.profile_status
    using profile_status::public.profile_status,
  alter column profile_status set default 'draft'::public.profile_status,
  alter column profile_status set not null;

create policy "profiles_public_read_active"
  on public.profiles for select
  using (
    (
      profile_status = 'approved'::public.profile_status
      and visibility_status = 'public'
      and coalesce(is_suspended, false) = false
      and coalesce(is_banned, false) = false
    )
    or user_id = (select auth.uid())
    or public.is_admin()
  );

commit;

-- ============================================================================
-- Verification — run immediately after, before letting traffic through.
-- ============================================================================
-- Column is now the enum:
--   select data_type, udt_name, is_nullable
--   from information_schema.columns
--   where table_schema='public' and table_name='profiles'
--     and column_name='profile_status';
--
-- The policy is back:
--   select polname from pg_policy p
--   join pg_class c on c.oid=p.polrelid
--   where c.relname='profiles' and polname='profiles_public_read_active';
--
-- And end to end, the part that actually matters — expect 200 and rows:
--   curl "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/profiles?select=id&limit=1" \
--     -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY"

-- ============================================================================
-- Alternative: keep text, add a CHECK constraint
-- ============================================================================
-- Same guarantee for phase 6, one transactional statement, no policy drop, and
-- trivially changed later. Recommended unless a real enum is specifically
-- wanted for the type generator's benefit.
--
-- begin;
-- update public.profiles set profile_status = 'draft' where profile_status is null;
-- alter table public.profiles
--   add constraint profiles_profile_status_check
--   check (profile_status in ('draft','pending','approved','rejected','suspended'));
-- commit;
-- ============================================================================
