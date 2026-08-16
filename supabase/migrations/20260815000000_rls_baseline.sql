-- ============================================================================
-- RLS baseline
-- ============================================================================
-- Establishes the rules specified for phase 3:
--
--   * profiles      — public read of active/approved only; owner-only writes;
--                     admin full access.
--   * keyword_trends— admin-only read; service_role-only write, so the Python
--                     collector keeps working unchanged.
--   * every table   — RLS forced on, and no table left without a policy.
--
-- NOT APPLIED AUTOMATICALLY. Review, then run against staging first:
--   psql "$SUPABASE_DB_URL" -f supabase/migrations/20260815000000_rls_baseline.sql
--
-- This migration touches policies only. It never reads, writes, or deletes a
-- single row of data.
--
-- Conventions carried over from the previous repo:
--   * public.is_admin()      — role check, used for every admin override.
--   * auth.uid()             — the authenticated user, used for ownership.
--   * <table>_<op>_<who>     — policy naming.
--   * auth.uid() is wrapped in a scalar subselect, `(select auth.uid())`, so
--     Postgres evaluates it once per statement instead of once per row. This
--     is the `auth_rls_initplan` fix already applied to this database.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. profiles
-- ---------------------------------------------------------------------------
-- Read: a logged-out visitor sees a profile only when it is approved, public,
-- and neither suspended nor banned — matching the policy deployed today.
-- Write: the owner, or an admin. Never another therapist.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

-- NOTE: the gate is profile_status/visibility_status/is_suspended/is_banned.
-- An earlier draft of this migration used `status` / `is_active`, copied from
-- the previous repo's 2026-03 migration. Both columns still exist but are no
-- longer the live gate: against production that predicate matched 14 rows
-- where the real policy matched 27, so applying it would have delisted 13
-- live profiles. Verified against the deployed policy before rewriting.
drop policy if exists "profiles_public_read_active" on public.profiles;
create policy "profiles_public_read_active"
  on public.profiles for select
  using (
    (
      profile_status = 'approved'
      and visibility_status = 'public'
      and coalesce(is_suspended, false) = false
      and coalesce(is_banned, false) = false
    )
    or user_id = (select auth.uid())
    or public.is_admin()
  );

drop policy if exists "profiles_insert_self_or_admin" on public.profiles;
create policy "profiles_insert_self_or_admin"
  on public.profiles for insert
  with check (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin"
  on public.profiles for update
  using (user_id = (select auth.uid()) or public.is_admin())
  with check (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "profiles_delete_admin" on public.profiles;
create policy "profiles_delete_admin"
  on public.profiles for delete
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- 2. keyword_trends
-- ---------------------------------------------------------------------------
-- Competitive SEO data: no public exposure at all.
-- Read: admin only. Write: nobody — service_role bypasses RLS entirely, which
-- is exactly how the Python collector writes, so it needs no policy.
-- Granting write to no role is deliberate, not an omission: it means a leaked
-- anon or user JWT can never mutate the trend history.
-- ---------------------------------------------------------------------------
alter table public.keyword_trends enable row level security;

-- Live state before this migration: a "Public read keyword_trends" policy with
-- USING (true), plus an authenticated-read policy. Neither is currently
-- reachable because anon/authenticated hold no SELECT grant on the table, so
-- this is a latent over-permission rather than an active leak. Dropping both
-- and gating on is_admin() closes it at the policy layer too.
drop policy if exists "Public read keyword_trends" on public.keyword_trends;
drop policy if exists "allow_read_keyword_trends" on public.keyword_trends;
drop policy if exists "keyword_trends_select_admin" on public.keyword_trends;
create policy "keyword_trends_select_admin"
  on public.keyword_trends for select
  using (public.is_admin());

drop policy if exists "keyword_trends_insert_none" on public.keyword_trends;
create policy "keyword_trends_insert_none"
  on public.keyword_trends for insert
  with check (false);

drop policy if exists "keyword_trends_update_none" on public.keyword_trends;
create policy "keyword_trends_update_none"
  on public.keyword_trends for update
  using (false)
  with check (false);

drop policy if exists "keyword_trends_delete_none" on public.keyword_trends;
create policy "keyword_trends_delete_none"
  on public.keyword_trends for delete
  using (false);

-- The collector authenticates as service_role, which bypasses RLS. It still
-- needs the table grant.
grant select, insert, update, delete on public.keyword_trends to service_role;

-- ---------------------------------------------------------------------------
-- 3. Backstop — no table without RLS, no table without a policy
-- ---------------------------------------------------------------------------
-- Enables RLS on anything that somehow lacks it, then adds an explicit
-- deny-all policy for each operation a table does not already cover.
--
-- Deny-all is the safe default: service_role still bypasses RLS, so back-end
-- jobs are unaffected, while anon and authenticated get nothing until somebody
-- writes a deliberate policy. A table appearing in the audit output with
-- `_deny_` policies is a table that still needs a real rule — not a finished
-- one.
-- ---------------------------------------------------------------------------
do $$
declare
  rec record;
  operation text;
  has_policy boolean;
  policy_name text;
begin
  for rec in
    select c.oid as reloid, c.relname as table_name
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'r'
    order by c.relname
  loop
    -- 3a. RLS on.
    execute format('alter table public.%I enable row level security', rec.table_name);

    -- 3b. One policy per operation, or an explicit denial.
    foreach operation in array array['select', 'insert', 'update', 'delete'] loop
      select exists (
        select 1
        from pg_policy p
        where p.polrelid = rec.reloid
          and p.polcmd in (
            case operation
              when 'select' then 'r'
              when 'insert' then 'a'
              when 'update' then 'w'
              when 'delete' then 'd'
            end,
            '*'
          )
      ) into has_policy;

      if not has_policy then
        policy_name := format('%s_%s_deny_default', rec.table_name, operation);

        if operation = 'insert' then
          execute format(
            'create policy %I on public.%I for insert with check (false)',
            policy_name, rec.table_name
          );
        elsif operation = 'update' then
          execute format(
            'create policy %I on public.%I for update using (false) with check (false)',
            policy_name, rec.table_name
          );
        else
          execute format(
            'create policy %I on public.%I for %s using (false)',
            policy_name, rec.table_name, operation
          );
        end if;

        raise notice 'added deny-all % policy on %', operation, rec.table_name;
      end if;
    end loop;
  end loop;
end $$;

commit;

-- ---------------------------------------------------------------------------
-- Verify (read-only) — expect zero rows.
-- ---------------------------------------------------------------------------
-- select c.relname
-- from pg_class c
-- join pg_namespace n on n.oid = c.relnamespace
-- where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity;
