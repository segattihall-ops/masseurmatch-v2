-- Courtesy tier grants: wind down the hand-set paid tiers, with notice.
--
-- Measured in production on 2026-08-17, before this ran:
--
--   profiles                                42
--     subscription_tier = 'elite'           25   (10 publicly visible, 9 featured)
--     subscription_tier = 'pro'              1
--   profiles with a subscription_status      0
--   rows in therapist_subscriptions          0
--   rows in billing_events                   0
--
-- Nobody has ever paid: the column default is 'free', so all 26 were set by
-- hand, and none on the day the profile was created. The only PayPal
-- subscription that ever existed (I-EXY5H8HCTVPN, Standard) was never approved
-- and no longer exists at PayPal.
--
-- Rather than revoke outright, each grant gets a deadline. `resolveTier()` in
-- packages/db/tier-grants.ts honours the tier until that moment and returns
-- 'free' afterwards, evaluated on read — so nothing has to run on a schedule
-- and there is no job that can silently fail to fire.
--
-- SAFE TO RE-RUN. Adding the column is idempotent, and the UPDATE only touches
-- rows that still have no deadline, so running it twice does not extend anyone.

-- 1. The deadline column. Nullable and additive: the old app, which still
--    writes to this database, neither knows nor needs to know about it.
alter table public.profiles
  add column if not exists tier_granted_until timestamptz;

comment on column public.profiles.tier_granted_until is
  'When a courtesy (unpaid) tier stops applying. Null means no grant: the tier '
  'is either genuinely paid for, or not entitled at all. Read via '
  'resolveTier() — never branch on subscription_tier alone.';

-- 2. Give every unpaid paid-tier profile 30 days.
--
--    `subscription_status is null` is the test for "no real subscription".
--    Every one of the 26 rows matches it today; if a genuine subscriber
--    appears before this runs, they are correctly skipped rather than handed a
--    deadline they never deserved.
update public.profiles
set tier_granted_until = now() + interval '30 days'
where coalesce(subscription_tier, 'free') <> 'free'
  and subscription_status is null
  and tier_granted_until is null;

-- 3. Index only the rows that carry a grant. Partial, because the query that
--    matters ("whose grant lapses next?") never looks at the other ~16.
create index if not exists profiles_tier_granted_until_idx
  on public.profiles (tier_granted_until)
  where tier_granted_until is not null;
