-- Server-side directory search for the public web app.
--
-- SECURITY INVOKER is intentional: the anon/authenticated caller remains
-- subject to profiles RLS. The function only moves filtering, ranking and
-- pagination into Postgres; it does not widen visibility.

create or replace function public.search_directory_profiles(
  p_city_slug text default null,
  p_state_slug text default null,
  p_service text default null,
  p_query text default null,
  p_session text default null,
  p_available_now boolean default false,
  p_verified boolean default false,
  p_lgbtq boolean default false,
  p_min_price integer default null,
  p_max_price integer default null,
  p_tier text default null,
  p_min_experience integer default null,
  p_sort text default 'recommended',
  p_limit integer default 24,
  p_offset integer default 0
)
returns table (
  id uuid,
  slug text,
  display_name text,
  full_name text,
  headline text,
  city text,
  state text,
  neighborhood text,
  avatar_url text,
  photo_url text,
  service_categories text[],
  massage_techniques text[],
  specialties text[],
  subscription_tier text,
  subscription_status text,
  tier_granted_until timestamptz,
  spike_until timestamptz,
  is_featured boolean,
  boost_score integer,
  rating_average numeric,
  review_count integer,
  is_verified_identity boolean,
  is_verified_profile boolean,
  offers_incall boolean,
  offers_outcall boolean,
  incall_price integer,
  outcall_price integer,
  available_now boolean,
  available_now_expires timestamptz,
  lgbtq_affirming boolean,
  travel_schedule jsonb,
  updated_at timestamptz,
  total_count integer
)
language sql
stable
security invoker
set search_path = ''
as $function$
  with base as (
    select
      p.id,
      p.slug,
      p.display_name,
      p.full_name,
      p.headline,
      p.bio,
      p.city,
      p.state,
      p.neighborhood,
      p.avatar_url,
      p.photo_url,
      p.service_categories,
      p.massage_techniques,
      p.specialties,
      p.subscription_tier,
      p.subscription_status,
      p.tier_granted_until,
      p.spike_until,
      p.is_featured,
      p.boost_score,
      p.rating_average,
      p.review_count,
      p.is_verified_identity,
      p.is_verified_profile,
      p.offers_incall,
      p.offers_outcall,
      p.incall_price,
      p.outcall_price,
      p.available_now,
      p.available_now_expires,
      p.lgbtq_affirming,
      p.travel_schedule,
      p.updated_at,
      p.years_experience,
      trim(
        both '-' from regexp_replace(
          translate(
            lower(coalesce(p.city, '')),
            'áàâãäåéèêëíìîïóòôõöúùûüçñ',
            'aaaaaaeeeeiiiiooooouuuucn'
          ),
          '[^a-z0-9]+',
          '-',
          'g'
        )
      ) as home_city_slug,
      case
        when lower(coalesce(p.subscription_tier, 'free')) = 'free' then 'free'
        when lower(coalesce(p.subscription_status, '')) in ('active', 'trialing')
          then lower(p.subscription_tier)
        when p.tier_granted_until is not null and p.tier_granted_until > now()
          then lower(p.subscription_tier)
        else 'free'
      end as effective_tier,
      case
        when p.offers_incall is true and p.incall_price is not null
         and p.offers_outcall is true and p.outcall_price is not null
          then least(p.incall_price, p.outcall_price)
        when p.offers_incall is true and p.incall_price is not null then p.incall_price
        when p.offers_outcall is true and p.outcall_price is not null then p.outcall_price
        else null
      end as starting_price
    from public.profiles p
    where p.profile_status = 'approved'
      and p.visibility_status = 'public'
      and coalesce(p.is_suspended, false) = false
      and coalesce(p.is_banned, false) = false
      and p.slug is not null
      and btrim(p.slug) <> ''
  ),
  filtered as (
    select
      b.*,
      case b.effective_tier
        when 'elite' then 3
        when 'pro' then 2
        when 'standard' then 1
        else 0
      end as tier_weight
    from base b
    where
      (
        nullif(btrim(p_city_slug), '') is null
        or (
          b.home_city_slug = lower(btrim(p_city_slug))
          and (
            nullif(btrim(p_state_slug), '') is null
            or lower(coalesce(b.state, '')) = lower(btrim(p_state_slug))
          )
        )
        or exists (
          select 1
          from jsonb_array_elements(
            case
              when jsonb_typeof(b.travel_schedule) = 'array' then b.travel_schedule
              else '[]'::jsonb
            end
          ) as visit(entry)
          where trim(
              both '-' from regexp_replace(
                translate(
                  lower(coalesce(visit.entry ->> 'city', '')),
                  'áàâãäåéèêëíìîïóòôõöúùûüçñ',
                  'aaaaaaeeeeiiiiooooouuuucn'
                ),
                '[^a-z0-9]+',
                '-',
                'g'
              )
            ) = lower(btrim(p_city_slug))
            and (
              nullif(btrim(p_state_slug), '') is null
              or lower(coalesce(visit.entry ->> 'state', '')) = lower(btrim(p_state_slug))
            )
            and coalesce(visit.entry ->> 'start_date', '') ~ '^\d{4}-\d{2}-\d{2}$'
            and coalesce(visit.entry ->> 'end_date', '') ~ '^\d{4}-\d{2}-\d{2}$'
            and (visit.entry ->> 'end_date') >= to_char(current_date, 'YYYY-MM-DD')
            and (visit.entry ->> 'start_date') <= to_char(current_date + 14, 'YYYY-MM-DD')
        )
      )
      and (
        nullif(btrim(p_service), '') is null
        or exists (
          select 1
          from unnest(coalesce(b.service_categories, '{}'::text[])) as service(value)
          where lower(service.value) = lower(btrim(p_service))
        )
        or exists (
          select 1
          from unnest(coalesce(b.massage_techniques, '{}'::text[])) as technique(value)
          where lower(technique.value) = lower(btrim(p_service))
        )
      )
      and (
        nullif(btrim(p_query), '') is null
        or concat_ws(
          ' ',
          b.display_name,
          b.full_name,
          b.headline,
          b.bio,
          b.city,
          b.neighborhood,
          array_to_string(b.specialties, ' '),
          array_to_string(b.massage_techniques, ' '),
          array_to_string(b.service_categories, ' ')
        ) ilike '%' || btrim(p_query) || '%'
      )
      and (
        nullif(btrim(p_session), '') is null
        or (lower(p_session) = 'incall' and b.offers_incall is true)
        or (lower(p_session) = 'outcall' and b.offers_outcall is true)
      )
      and (
        not p_available_now
        or (
          b.available_now is true
          and (b.available_now_expires is null or b.available_now_expires > now())
        )
      )
      and (
        not p_verified
        or b.is_verified_identity is true
        or b.is_verified_profile is true
      )
      and (not p_lgbtq or b.lgbtq_affirming is true)
      and (p_min_price is null or b.starting_price >= greatest(p_min_price, 0))
      and (p_max_price is null or b.starting_price <= greatest(p_max_price, 0))
      and (
        nullif(btrim(p_tier), '') is null
        or b.effective_tier = lower(btrim(p_tier))
      )
      and (p_min_experience is null or b.years_experience >= greatest(p_min_experience, 0))
  ),
  counted as (
    select f.*, count(*) over ()::integer as matching_count
    from filtered f
  )
  select
    c.id,
    c.slug,
    c.display_name,
    c.full_name,
    c.headline,
    c.city,
    c.state,
    c.neighborhood,
    c.avatar_url,
    c.photo_url,
    c.service_categories,
    c.massage_techniques,
    c.specialties,
    c.subscription_tier,
    c.subscription_status,
    c.tier_granted_until,
    c.spike_until,
    c.is_featured,
    c.boost_score,
    c.rating_average,
    c.review_count,
    c.is_verified_identity,
    c.is_verified_profile,
    c.offers_incall,
    c.offers_outcall,
    c.incall_price,
    c.outcall_price,
    c.available_now,
    c.available_now_expires,
    c.lgbtq_affirming,
    c.travel_schedule,
    c.updated_at,
    c.matching_count as total_count
  from counted c
  order by
    case when lower(coalesce(p_sort, 'recommended')) = 'price' then c.starting_price end asc nulls last,
    case when lower(coalesce(p_sort, 'recommended')) = 'rating' then c.rating_average end desc nulls last,
    case when lower(coalesce(p_sort, 'recommended')) = 'rating' then c.review_count end desc nulls last,
    c.tier_weight desc,
    case when c.spike_until is not null and c.spike_until > now() then 1 else 0 end desc,
    coalesce(c.is_featured, false) desc,
    coalesce(c.boost_score, 0) desc,
    coalesce(c.rating_average, 0) desc,
    coalesce(c.review_count, 0) desc,
    lower(coalesce(nullif(btrim(c.display_name), ''), nullif(btrim(c.full_name), ''), c.slug)),
    c.id
  limit least(greatest(coalesce(p_limit, 24), 1), 100)
  offset greatest(coalesce(p_offset, 0), 0);
$function$;

revoke all on function public.search_directory_profiles(
  text, text, text, text, text, boolean, boolean, boolean,
  integer, integer, text, integer, text, integer, integer
) from public;

grant execute on function public.search_directory_profiles(
  text, text, text, text, text, boolean, boolean, boolean,
  integer, integer, text, integer, text, integer, integer
) to anon, authenticated, service_role;

comment on function public.search_directory_profiles(
  text, text, text, text, text, boolean, boolean, boolean,
  integer, integer, text, integer, text, integer, integer
) is 'RLS-aware public directory search with filtering, visiting-city support, effective-tier ranking, and pagination.';
