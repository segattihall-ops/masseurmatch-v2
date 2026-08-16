-- ============================================================================
-- RLS safe hardening
-- ============================================================================
-- The subset of the baseline that closes real holes without changing any
-- access path that currently works. Safe to apply before the dashboard exists.
--
-- Everything here was verified against production on 2026-08-16 with
-- `execute_sql` before being written. This migration touches policies and one
-- view definition only — it never reads, writes or deletes a row of data.
--
-- Apply to a Supabase branch or staging first, then production:
--   psql "$SUPABASE_DB_URL" -f supabase/migrations/20260816000000_rls_safe_hardening.sql
--
-- Deliberately NOT included — see 20260815000000_rls_baseline.sql:
--   * the deny-all backstop across all 118 tables. It enforces rules against
--     flows nobody has exercised yet; wait until apps/dashboard exists and its
--     access patterns are testable.
--   * dropping the legacy duplicate `profiles` policies. Safe in principle,
--     but the auth flows that would prove it are not built.
--   * rewriting `profiles` policies. The live `profiles_public_read_active`
--     already carries the correct predicate, so there is nothing to fix.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. keyword_trends — remove the unrestricted read policy
-- ---------------------------------------------------------------------------
-- Verified live: two overlapping read policies exist.
--
--   "Public read keyword_trends"   using (true)
--   "allow_read_keyword_trends"    using (auth.role() = 'authenticated')
--
-- Neither is reachable today because neither `anon` nor `authenticated` holds
-- a SELECT grant, so PostgREST returns 42501 first. That is the only thing
-- standing between `using (true)` and a fully public keyword table — a single
-- future GRANT would expose it. Drop it.
--
-- Writes are unaffected: the Python collector authenticates as `service_role`,
-- which bypasses RLS entirely and never consults a policy.
-- ---------------------------------------------------------------------------
drop policy if exists "Public read keyword_trends" on public.keyword_trends;

-- Keep `allow_read_keyword_trends` (authenticated-only) as the read path, so
-- an admin UI can be granted SELECT later without also opening it to anon.

-- ---------------------------------------------------------------------------
-- 2. public_therapists — run the view as invoker, not definer
-- ---------------------------------------------------------------------------
-- Verified live: `security_invoker` is not set, so the view executes with its
-- owner's privileges and does NOT inherit RLS from `profiles`. It is not a
-- live leak — `anon` has no grant on the view, confirmed empirically — but it
-- is one GRANT away from bypassing every policy on `profiles`.
--
-- Setting security_invoker makes the view obey the caller's RLS, so it can
-- never return more than the caller could read directly.
-- ---------------------------------------------------------------------------
alter view public.public_therapists set (security_invoker = on);

-- ---------------------------------------------------------------------------
-- 3. moderation_queue — remove the anon SELECT grant
-- ---------------------------------------------------------------------------
-- Measured 2026-08-16 with the anon key:
--
--   audit_log           -> 401  (no grant)
--   moderation_actions  -> 401  (no grant)
--   keyword_trends      -> 401  (no grant)
--   moderation_queue    -> 200, content-range */0, []
--
-- **Nothing leaks.** The queue returns zero rows because RLS filters them all.
-- But it is the only one of the four defended by RLS *alone*: the others are
-- also grant-denied, so they fail closed twice over. `moderation_queue` holds
-- `payload`, `notes`, `admin_reason`, `moderation_reason` and `ai_response` —
-- internal review material — and one future permissive policy would expose all
-- of it with nothing behind to catch the mistake.
--
-- Revoking costs nothing today (anon already reads no rows) and restores the
-- same two-layer defence its siblings have. Phase 6 reads this table as an
-- admin, which is unaffected.
-- ---------------------------------------------------------------------------
revoke select on public.moderation_queue from anon;

commit;

-- ============================================================================
-- Verification — run after applying; both should return zero rows.
-- ============================================================================
-- -- No unrestricted read policy remains on keyword_trends:
-- select polname
-- from pg_policy p
-- join pg_class c on c.oid = p.polrelid
-- join pg_namespace n on n.oid = c.relnamespace
-- where n.nspname = 'public'
--   and c.relname = 'keyword_trends'
--   and pg_get_expr(p.polqual, p.polrelid) = 'true';
--
-- -- The view now runs as invoker:
-- select c.relname
-- from pg_class c
-- join pg_namespace n on n.oid = c.relnamespace
-- where n.nspname = 'public'
--   and c.relname = 'public_therapists'
--   and coalesce((select option_value
--                 from pg_options_to_table(c.reloptions)
--                 where option_name = 'security_invoker'), 'off') <> 'on';
-- ============================================================================
