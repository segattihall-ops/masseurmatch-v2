-- ============================================================================
-- Audit log immutability + atomic moderation
-- ============================================================================
-- NOT APPLIED. Review, run against a Supabase branch, then staging, then
-- production.
--
-- `audit_log` **already exists** with the columns phase 6 specifies — id,
-- admin_id, action, target_type, target_id, reason, created_at — plus details,
-- metadata and several target_* variants. Verified 2026-08-16 against the
-- generated types. So there is no CREATE TABLE here; what is missing is the
-- policies that make it trustworthy.
--
-- This migration touches policies, grants and one function. It reads and writes
-- no rows.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. audit_log — append-only, admin-visible
-- ---------------------------------------------------------------------------
-- The security property is the *absence* of UPDATE and DELETE policies. RLS
-- denies by default, so with none defined, no client role can alter or remove
-- an entry — including an admin, deliberately. An audit log an administrator
-- can edit is not an audit log.
--
-- `service_role` still bypasses RLS entirely, which is how retention jobs or a
-- migration would ever prune this table. That is a back-end key, not something
-- a compromised session can reach.
-- ---------------------------------------------------------------------------
alter table public.audit_log enable row level security;

drop policy if exists "audit_log_admin_read" on public.audit_log;
create policy "audit_log_admin_read"
  on public.audit_log for select
  using (public.is_admin());

drop policy if exists "audit_log_admin_insert" on public.audit_log;
create policy "audit_log_admin_insert"
  on public.audit_log for insert
  with check (
    public.is_admin()
    -- An admin may only write entries attributed to themselves, so the log
    -- cannot be used to pin an action on a colleague.
    and admin_id = (select auth.uid())
  );

-- Intentionally no UPDATE policy.
-- Intentionally no DELETE policy.

-- Grants have to allow what the policies then narrow; without these the
-- policies are unreachable and PostgREST answers 42501 regardless of role.
grant select, insert on public.audit_log to authenticated;
revoke update, delete on public.audit_log from authenticated;
revoke all on public.audit_log from anon;

-- ---------------------------------------------------------------------------
-- 2. moderation_queue — close the grant gap
-- ---------------------------------------------------------------------------
-- Measured: anon gets HTTP 200 here (RLS returns zero rows) where audit_log,
-- moderation_actions and keyword_trends all return 401. Nothing leaks, but it
-- is the only one of the four resting on RLS alone. See POLICIES.md.
-- ---------------------------------------------------------------------------
revoke select on public.moderation_queue from anon;

-- ---------------------------------------------------------------------------
-- 3. moderate_profile() — one transaction for the decision and its record
-- ---------------------------------------------------------------------------
-- Supabase's JS client cannot open a transaction, so the application currently
-- writes the audit entry first and then applies the change. That ordering fails
-- safe (a logged decision that did not take effect is visible and
-- reconcilable; an unlogged decision is not) but it is still two statements.
--
-- This makes it one. Once applied, `moderateProfile` should call this RPC
-- instead, and the two-statement path can be deleted.
--
-- `security definer` so the function can write `audit_log` under the policy
-- above while still verifying the caller is an admin itself. `search_path` is
-- pinned — a security-definer function without one is a privilege-escalation
-- vector.
-- ---------------------------------------------------------------------------
create or replace function public.moderate_profile(
  p_profile_id uuid,
  p_action text,
  p_reason text,
  p_details jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_admin uuid := auth.uid();
  v_profile_status text;
  v_visibility text;
begin
  if not public.is_admin() then
    raise exception 'Only an admin may moderate a profile.' using errcode = '42501';
  end if;

  if p_reason is null or length(btrim(p_reason)) < 10 then
    raise exception 'A reason of at least 10 characters is required.' using errcode = '22023';
  end if;

  case p_action
    when 'approve' then v_profile_status := 'approved'; v_visibility := 'public';
    when 'reject'  then v_profile_status := 'rejected'; v_visibility := 'private';
    when 'suspend' then v_profile_status := 'suspended'; v_visibility := 'private';
    else raise exception 'Unknown moderation action: %', p_action using errcode = '22023';
  end case;

  insert into public.audit_log (admin_id, admin_user_id, action, target_type,
                                target_id, target_profile_id, reason, details)
  values (v_admin, v_admin, 'profile.' || p_action, 'profile',
          p_profile_id, p_profile_id, p_reason, p_details);

  update public.profiles
     set profile_status    = v_profile_status,
         visibility_status = v_visibility,
         moderation_status = v_profile_status,
         moderation_notes  = p_reason,
         reviewed_at       = now(),
         reviewed_by       = v_admin,
         updated_at        = now()
   where id = p_profile_id;

  if not found then
    -- Rolls back the audit insert too, which is the point of doing both here.
    raise exception 'No profile with id %', p_profile_id using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.moderate_profile(uuid, text, text, jsonb) from public;
grant execute on function public.moderate_profile(uuid, text, text, jsonb) to authenticated;

commit;

-- ============================================================================
-- Verification
-- ============================================================================
-- audit_log has read and insert policies and NO update/delete policy:
--   select polname,
--          case polcmd when 'r' then 'select' when 'a' then 'insert'
--                      when 'w' then 'update' when 'd' then 'delete'
--                      when '*' then 'all' end as cmd
--   from pg_policy p join pg_class c on c.oid = p.polrelid
--   where c.relname = 'audit_log';
--   -- expect exactly: audit_log_admin_read/select, audit_log_admin_insert/insert
--
-- Immutability, as an authenticated admin — both must fail:
--   update public.audit_log set reason = 'tampered' where id = <any>;
--   delete from public.audit_log where id = <any>;
--
-- moderation_queue now refuses anon:
--   curl -o /dev/null -w '%{http_code}\n' \
--     "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/moderation_queue?select=id&limit=1" \
--     -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY"
--   # expect 401
-- ============================================================================
