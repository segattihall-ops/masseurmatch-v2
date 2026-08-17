-- Who to notify about a courtesy tier grant, and by when.
--
-- Read-only. Run after courtesy_tier_grants.sql to produce the mailing list.
--
-- `days_left` is what the email should quote. It is derived from the same
-- column `resolveTier()` reads, so the notice cannot promise a date the site
-- then disagrees with — which is the usual way these announcements go wrong.

select
  p.slug,
  coalesce(nullif(trim(p.display_name), ''), nullif(trim(p.full_name), ''), p.slug) as name,
  p.email,
  p.subscription_tier                                        as tier_atual,
  'free'                                                     as tier_depois,
  p.tier_granted_until                                       as prazo,
  greatest(0, ceil(extract(epoch from (p.tier_granted_until - now())) / 86400))::int as days_left,
  p.profile_status,
  p.visibility_status,
  p.is_featured,
  -- What they actually lose, so the email can be specific rather than vague.
  --
  -- Photo counts MUST match packages/billing/plans.ts (3 / 6 / 9 / 12). They
  -- previously quoted the old 10/15/20 ladder, which would have told an Elite
  -- grantee they were losing twenty slots on an account that has twelve.
  --
  -- Featured placement is deliberately NOT mentioned. The entitlement table
  -- lists it under Pro and Elite, but the directory ranks on the `is_featured`
  -- column and nothing in the codebase writes that column from a tier — it is
  -- a hand-set admin flag, and this wind-down does not touch it. So nobody
  -- loses featured placement here. Saying otherwise would tell 17 people they
  -- are losing something they never had, and the other 9 something they are
  -- in fact keeping.
  case p.subscription_tier
    when 'elite'    then '12 fotos -> 3 fotos'
    when 'pro'      then '9 fotos -> 3 fotos'
    when 'standard' then '6 fotos -> 3 fotos'
    else '-> 3 fotos'
  end as o_que_muda
-- `profiles.email` is used rather than joining auth.users: the column is
-- already there, and the join would require access to the auth schema, which
-- limits who can run this to a service-role connection for no benefit.
from public.profiles p
where p.tier_granted_until is not null
  and p.subscription_status is null
order by
  -- Publicly visible profiles first: they are the ones whose listing changes.
  (p.profile_status = 'approved' and p.visibility_status = 'public') desc,
  p.is_featured desc,
  name;
