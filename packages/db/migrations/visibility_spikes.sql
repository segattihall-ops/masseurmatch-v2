-- Visibility Spikes.
--
-- A Spike is distribution: a therapist spends one of their monthly credits and
-- their listing is lifted in the directory for 24 hours. Standard gets 2 a
-- month, Pro 6, Elite 12; Free gets none.
--
-- Not to be confused with `demand_radar_spike_alert_deliveries`, which already
-- exists in this database and is about demand *intelligence* — "is this city
-- heating up?". Different product, same word. Nothing here touches it.
--
-- SAFE TO RE-RUN. Every statement is guarded.

-- 1. When the current lift ends. Null means no Spike running.
--
--    Denormalised onto `profiles` on purpose: the public directory query reads
--    profiles and nothing else, and it is the hot path behind every statically
--    generated city page. A join there to answer "is this listing lifted?"
--    would cost more than the column does. `profile_spikes` below stays the
--    record of what was spent.
alter table public.profiles
  add column if not exists spike_until timestamptz;

comment on column public.profiles.spike_until is
  'End of the current visibility Spike, or null. Read via spikeIsActive() — a '
  'past timestamp means no lift, and nothing expires it on a schedule.';

-- 2. What was spent, and when. This is what the monthly quota counts.
create table if not exists public.profile_spikes (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  started_at  timestamptz not null default now(),
  ends_at     timestamptz not null,
  -- 'quota' came out of the plan's monthly allowance; 'purchased' was bought
  -- separately and must NOT count against it.
  source      text not null default 'quota' check (source in ('quota', 'purchased')),
  created_at  timestamptz not null default now()
);

comment on table public.profile_spikes is
  'One row per visibility Spike started. The monthly allowance counts rows '
  'with source = quota since the 1st; purchased ones are extra.';

-- The only query that runs against this: "how many quota spikes has this
-- profile started since the 1st?".
create index if not exists profile_spikes_profile_started_idx
  on public.profile_spikes (profile_id, started_at desc);

-- 3. RLS. A therapist may read their own history; nothing else may.
--
--    No insert policy on purpose. Spending a Spike goes through the dashboard's
--    service-role path, which checks the quota first. A client-side insert
--    would let anyone with the anon key mint themselves unlimited lifts.
alter table public.profile_spikes enable row level security;

drop policy if exists "own spikes are readable" on public.profile_spikes;
create policy "own spikes are readable"
  on public.profile_spikes for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = profile_spikes.profile_id
        and p.user_id = auth.uid()
    )
  );

-- 4. The public site reads `spike_until` off `profiles` through the anon role,
--    which already has select on that table. Nothing further is granted here.
