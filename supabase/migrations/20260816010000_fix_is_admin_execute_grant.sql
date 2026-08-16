-- ============================================================================
-- URGENT: restore EXECUTE on public.is_admin() for anon and authenticated
-- ============================================================================
-- Symptom, observed live on 2026-08-16 ~05:20Z:
--
--   GET /rest/v1/profiles  ->  HTTP 401
--   {"code":"42501","message":"permission denied for function is_admin"}
--
-- Anonymous reads of `profiles` fail completely. `profile_photos` still works,
-- so this is specific to `profiles`.
--
-- Cause
-- -----
-- The live read policy is:
--
--   profiles_public_read_active  USING (
--     (profile_status = 'approved' AND visibility_status = 'public'
--      AND coalesce(is_suspended,false) = false
--      AND coalesce(is_banned,false) = false)
--     OR user_id = auth.uid()
--     OR is_admin()
--   )
--
-- Postgres evaluates `is_admin()` while checking rows that fail the public
-- predicate. If the calling role lacks EXECUTE on the function, the statement
-- ERRORS rather than treating the branch as false — so the entire read fails,
-- including for rows that should have matched the public branch. OR does not
-- reliably short-circuit here; the planner may evaluate either side.
--
-- Something revoked that grant between 04:35Z (anon reads working, test suite
-- green) and 05:20Z. This migration restores it.
--
-- Impact while unfixed
-- --------------------
--   * `pnpm build` for apps/web FAILS: "Failed to collect page data for
--     /[state]/[city]".
--   * A Vercel deploy WITH Supabase credentials set will fail the same way.
--     A deploy without them still succeeds, because the access layer
--     short-circuits to an empty directory — which is why the 05:10Z preview
--     went green and hid this.
--   * Already-rendered ISR pages keep serving stale content; revalidation
--     fails silently in the background.
--
-- Apply this BEFORE setting NEXT_PUBLIC_SUPABASE_* on Vercel.
--
--   psql "$SUPABASE_DB_URL" -f supabase/migrations/20260816010000_fix_is_admin_execute_grant.sql
--
-- Touches grants and function attributes only. No data is read or written.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. Restore the grant
-- ---------------------------------------------------------------------------
-- `anon` needs EXECUTE because the policy above calls the function on the
-- anonymous read path. `authenticated` needs it for the owner/admin branches.
-- This does not make anyone an admin: the function still evaluates the
-- caller's own role and returns false for everyone else.
-- ---------------------------------------------------------------------------
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. Make the function robust against this happening again
-- ---------------------------------------------------------------------------
-- `security definer` lets it read whatever role table it needs without the
-- caller holding permission on that table. `stable` lets Postgres evaluate it
-- once per statement rather than once per row. Both are the standard Supabase
-- pattern for a policy helper, and together they stop a future grant change
-- from taking the public directory offline.
--
-- `search_path` is pinned because a security-definer function without one is
-- a privilege-escalation vector.
-- ---------------------------------------------------------------------------
alter function public.is_admin() security definer;
alter function public.is_admin() stable;
alter function public.is_admin() set search_path = public, pg_catalog;

commit;

-- ============================================================================
-- Verification — run after applying.
-- ============================================================================
-- Should return anon and authenticated:
--   select grantee
--   from information_schema.role_routine_grants
--   where routine_schema = 'public'
--     and routine_name = 'is_admin'
--     and privilege_type = 'EXECUTE';
--
-- Then confirm end to end with the anon key — expect HTTP 200, not 401:
--   curl "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/profiles?select=id&limit=1" \
--     -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY"
-- ============================================================================
