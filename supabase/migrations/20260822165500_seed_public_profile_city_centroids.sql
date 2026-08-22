-- Approximate city centers used by public service-area maps and nearby search.
-- These are city-level coordinates only; they do not represent provider addresses.
-- Keep this table populated whenever a newly supported public city is introduced.

insert into public.cities (name, slug, state, state_code, latitude, longitude, updated_at)
values
  ('Humble', 'humble', 'Texas', 'TX', 29.998830, -95.262160, timezone('utc', now())),
  ('Aventura', 'aventura', 'Florida', 'FL', 25.956480, -80.139210, timezone('utc', now())),
  ('New York', 'new-york', 'New York', 'NY', 40.712800, -74.006000, timezone('utc', now())),
  ('Fort Lauderdale', 'fort-lauderdale', 'Florida', 'FL', 26.122400, -80.137300, timezone('utc', now())),
  ('Indianapolis', 'indianapolis', 'Indiana', 'IN', 39.768330, -86.158060, timezone('utc', now())),
  ('San Francisco', 'san-francisco', 'California', 'CA', 37.774900, -122.419400, timezone('utc', now())),
  ('West Springfield', 'west-springfield', 'Massachusetts', 'MA', 42.105200, -72.621400, timezone('utc', now())),
  ('Hines', 'hines', 'Oregon', 'OR', 43.561530, -119.082700, timezone('utc', now())),
  ('Napa', 'napa', 'California', 'CA', 38.297100, -122.285500, timezone('utc', now()))
on conflict (slug) do update set
  name = excluded.name,
  state = excluded.state,
  state_code = excluded.state_code,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  updated_at = excluded.updated_at;
