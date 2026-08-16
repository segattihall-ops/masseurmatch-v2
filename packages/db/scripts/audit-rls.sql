-- RLS coverage audit for the `public` schema.
--
-- Emits one JSON document describing every base table: whether RLS is on, and
-- which of select/insert/update/delete are covered by at least one policy.
-- A `FOR ALL` policy counts as covering all four.
--
-- Read-only: this script never writes. Run it with:
--   pnpm db:audit-rls          (needs SUPABASE_DB_URL)

with base_tables as (
  select c.oid as reloid,
         c.relname as table_name,
         c.relrowsecurity as rls_enabled,
         c.relforcerowsecurity as rls_forced
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind = 'r'
),
policies as (
  select p.polrelid as reloid,
         p.polname as policy_name,
         case p.polcmd
           when 'r' then 'select'
           when 'a' then 'insert'
           when 'w' then 'update'
           when 'd' then 'delete'
           when '*' then 'all'
         end as command,
         coalesce(
           (select array_agg(r.rolname order by r.rolname)
            from pg_roles r
            where r.oid = any (p.polroles)),
           array['public']::name[]
         ) as roles,
         p.polpermissive as permissive,
         pg_get_expr(p.polqual, p.polrelid) as using_expr,
         pg_get_expr(p.polwithcheck, p.polrelid) as check_expr
  from pg_policy p
),
covered as (
  select t.reloid,
         bool_or(p.command in ('select', 'all')) as has_select,
         bool_or(p.command in ('insert', 'all')) as has_insert,
         bool_or(p.command in ('update', 'all')) as has_update,
         bool_or(p.command in ('delete', 'all')) as has_delete
  from base_tables t
  left join policies p on p.reloid = t.reloid
  group by t.reloid
)
select json_build_object(
  'generated_at', now(),
  'tables', coalesce(json_agg(row_to_json(report) order by report.table_name), '[]'::json)
)
from (
  select t.table_name,
         t.rls_enabled,
         t.rls_forced,
         coalesce(c.has_select, false) as has_select,
         coalesce(c.has_insert, false) as has_insert,
         coalesce(c.has_update, false) as has_update,
         coalesce(c.has_delete, false) as has_delete,
         coalesce(
           (select json_agg(json_build_object(
                     'name', p.policy_name,
                     'command', p.command,
                     'roles', p.roles,
                     'permissive', p.permissive,
                     'using', p.using_expr,
                     'check', p.check_expr
                   ) order by p.command, p.policy_name)
            from policies p
            where p.reloid = t.reloid),
           '[]'::json
         ) as policies
  from base_tables t
  left join covered c on c.reloid = t.reloid
) report;
