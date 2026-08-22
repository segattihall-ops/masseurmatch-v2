-- Convert `profiles.outcall_radius` from kilometres to miles.
--
-- ---------------------------------------------------------------------------
-- What is wrong today
-- ---------------------------------------------------------------------------
-- `outcall_radius` holds kilometres. Every consumer of a distance in this
-- codebase works in miles: the ranking RPC takes `radius_miles`, and the
-- column sitting next to this one is literally named `outcall_radius_miles`.
-- A radius stored in kilometres and read as miles does not read oddly, it
-- mis-ranks — it makes a therapist look 1.6× closer to reach than they are,
-- and always in the direction of surfacing someone too far away to book.
--
-- The listing editor now writes miles to both columns. This migration brings
-- the rows that predate it into the same unit, so the two eras of data mean
-- the same thing.
--
-- ---------------------------------------------------------------------------
-- Why every non-null row is treated as kilometres
-- ---------------------------------------------------------------------------
-- The mile ladder and the kilometre ladder it replaces overlap at 10 and 20,
-- so a stored `20` is ambiguous in isolation. It is not ambiguous in time:
-- nothing has ever written miles to this column. The editor that does was
-- merged minutes before this migration and is gated behind a therapist opening
-- the page and pressing save. Anything already stored is kilometres.
--
-- If that assumption is wrong for a given deployment, `select distinct
-- outcall_radius from public.profiles order by 1` before applying will say so:
-- kilometre data lands on 10/20/40/80/160/240 and nothing else.
--
-- ---------------------------------------------------------------------------
-- Why the result is snapped to the ladder
-- ---------------------------------------------------------------------------
-- 40 km is 24.85 miles, which is not a value the editor offers. Left as-is it
-- would fail the editor's own validation the next time the therapist opened
-- the page — they would be told to fix a field they never touched. Snapping to
-- the nearest offered rung keeps every row editable:
--
--     10 km →   6.21 mi →   5      80 km →  49.71 mi →  50
--     20 km →  12.43 mi →  10     160 km →  99.42 mi → 100
--     40 km →  24.85 mi →  20     240 km → 149.13 mi → 150
--
-- The ladder was extended to 100 and 150 for this: stopping at 50 would have
-- put 80, 160 and 240 km all on the same rung, erasing the difference between
-- a therapist who crosses a city and one who crosses a state.
--
-- Rows outside the kilometre ladder are converted and snapped the same way,
-- which is the best that can be done without knowing what they meant.
--
-- ---------------------------------------------------------------------------
-- Blast radius
-- ---------------------------------------------------------------------------
-- Touches two columns on rows where `outcall_radius` is not null. No column is
-- added or dropped, no policy changes, and the write is idempotent in the
-- sense that matters: re-running it would convert already-converted values a
-- second time, so it is written to run once and guarded by the audit note
-- below. Apply to staging first and compare the before/after counts.

begin;

-- A snapshot of what is about to change, so the conversion can be checked and,
-- if necessary, reversed. Dropping this table is safe once the numbers on the
-- public site have been eyeballed.
create table if not exists public._outcall_radius_km_backup (
  profile_id uuid primary key,
  outcall_radius_km numeric,
  outcall_radius_miles_before numeric,
  captured_at timestamptz not null default now()
);

insert into public._outcall_radius_km_backup (
  profile_id,
  outcall_radius_km,
  outcall_radius_miles_before
)
select id, outcall_radius, outcall_radius_miles
from public.profiles
where outcall_radius is not null
on conflict (profile_id) do nothing;

-- Nearest rung on the ladder the editor offers, measured in miles.
with converted as (
  select
    p.id,
    (
      select rung
      from unnest(array[5, 10, 15, 20, 30, 50, 100, 150]) as rung
      order by abs(rung - (p.outcall_radius * 0.621371)), rung
      limit 1
    ) as miles
  from public.profiles p
  where p.outcall_radius is not null
)
update public.profiles p
set
  outcall_radius = c.miles,
  outcall_radius_miles = c.miles
from converted c
where p.id = c.id;

commit;
