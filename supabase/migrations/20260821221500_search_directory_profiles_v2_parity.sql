-- Full-parity public directory search for the v2 web app.
--
-- This is deliberately a NEW function instead of replacing the existing
-- search_directory_profiles function. The current site and any already
-- deployed v2 build keep their existing contract while the parity branch is
-- reviewed and deployed.

create or replace function public.search_directory_profiles_v2(
  p_city_slug text default null,
  p_state_slug text default null,
  p_service text default null,
  p_query text default null,
  p_goal_search text default null,
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
  years_experience integer,
  height_inches integer,
  weight_lb integer,
  body_type text,
  start_year integer,
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
      coalesce(
        p.years_experience,
        case
          when p.start_year between 1900 and extract(year from current_date)::integer
            then extract(year from current_date)::integer - p.start_year
          else null
        end
      ) as effective_years_experience,
      p.height_inches,
      p.weight_lb,
      p.body_type,
      p.start_year,
      p.updated_at
    from public.profiles p
    where p.profile_status = 'approved'
      and p.visibility_status = 'public'
      and coalesce(p.is_suspended, false) = false
      and coalesce(p.is_banned, false) = false
      and p.slug is not null
      and btrim(p.slug) <> ''
  ),
  enriched as (
    select
      b.*,
      trim(
        both '-' from regexp_replace(
          translate(
            lower(coalesce(b.city, '')),
            'áàâãäåéèêëíìîïóòôõöúùûüçñ',
            'aaaaaaeeeeiiiiooooouuuucn'
          ),
          '[^a-z0-9]+',
          '-',
          'g'
        )
      ) as home_city_slug,
      case
        when lower(coalesce(b.subscription_tier, 'free')) = 'free' then 'free'
        when lower(coalesce(b.subscription_status, '')) in ('active', 'trialing')
          then lower(b.subscription_tier)
        when b.tier_granted_until is not null and b.tier_granted_until > now()
          then lower(b.subscription_tier)
        else 'free'
      end as effective_tier,
      case
        when b.offers_incall is true and b.incall_price is not null
         and b.offers_outcall is true and b.outcall_price is not null
          then least(b.incall_price, b.outcall_price)
        when b.offers_incall is true and b.incall_price is not null then b.incall_price
        when b.offers_outcall is true and b.outcall_price is not null then b.outcall_price
        else null
      end as starting_price,
      lower(concat_ws(
        ' ',
        b.display_name,
        b.full_name,
        b.headline,
        b.bio,
        b.city,
        b.neighborhood,
        array_to_string(b.specialties, ' '),
        array_to_string(b.massage_techniques, ' '),
        array_to_string(b.service_categories, ' '),
        b.body_type,
        case lower(coalesce(b.body_type, ''))
          when 'slim' then 'lean slender thin magro'
          when 'athletic' then 'fit toned atletico'
          when 'average' then 'regular build medium build medio normal'
          when 'muscular' then 'muscle buff built jacked musculoso forte'
          when 'stocky' then 'solid thick encorpado'
          when 'large' then 'big heavier heavyset bigger grande grandao maior'
          else null
        end,
        case when b.height_inches is not null then b.height_inches::text || ' in' end,
        case
          when b.height_inches is not null and b.height_inches > 0
            then floor(b.height_inches / 12.0)::integer::text || '''' || (b.height_inches % 12)::text || '"'
        end,
        case when b.weight_lb is not null then b.weight_lb::text || ' lb' end
      )) as search_text
    from base b
  ),
  filtered as (
    select
      e.*,
      case e.effective_tier
        when 'elite' then 3
        when 'pro' then 2
        when 'standard' then 1
        else 0
      end as tier_weight
    from enriched e
    where
      (
        nullif(btrim(p_city_slug), '') is null
        or (
          e.home_city_slug = lower(btrim(p_city_slug))
          and (
            nullif(btrim(p_state_slug), '') is null
            or lower(coalesce(e.state, '')) = lower(btrim(p_state_slug))
          )
        )
        or exists (
          select 1
          from jsonb_array_elements(
            case
              when jsonb_typeof(e.travel_schedule) = 'array' then e.travel_schedule
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
          from unnest(coalesce(e.service_categories, '{}'::text[])) as service(value)
          where lower(service.value) = lower(btrim(p_service))
        )
        or exists (
          select 1
          from unnest(coalesce(e.massage_techniques, '{}'::text[])) as technique(value)
          where lower(technique.value) = lower(btrim(p_service))
        )
      )
      and (
        nullif(btrim(p_query), '') is null
        or e.search_text ilike '%' || lower(btrim(p_query)) || '%'
      )
      and (
        nullif(btrim(p_goal_search), '') is null
        or e.search_text ilike '%' || lower(btrim(p_goal_search)) || '%'
      )
      and (
        nullif(btrim(p_session), '') is null
        or (lower(p_session) = 'incall' and e.offers_incall is true)
        or (lower(p_session) = 'outcall' and e.offers_outcall is true)
      )
      and (
        not p_available_now
        or (
          e.available_now is true
          and (e.available_now_expires is null or e.available_now_expires > now())
        )
      )
      and (
        not p_verified
        or e.is_verified_identity is true
        or e.is_verified_profile is true
      )
      and (not p_lgbtq or e.lgbtq_affirming is true)
      and (p_min_price is null or e.starting_price >= greatest(p_min_price, 0))
      and (p_max_price is null or e.starting_price <= greatest(p_max_price, 0))
      and (
        nullif(btrim(p_tier), '') is null
        or e.effective_tier = lower(btrim(p_tier))
      )
      and (
        p_min_experience is null
        or coalesce(e.effective_years_experience, 0) >= greatest(p_min_experience, 0)
      )
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
    c.effective_years_experience,
    c.height_inches,
    c.weight_lb,
    c.body_type,
    c.start_year,
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

revoke all on function public.search_directory_profiles_v2(
  text, text, text, text, text, text, boolean, boolean, boolean,
  integer, integer, text, integer, text, integer, integer
) from public;

grant execute on function public.search_directory_profiles_v2(
  text, text, text, text, text, text, boolean, boolean, boolean,
  integer, integer, text, integer, text, integer, integer
) to anon, authenticated, service_role;

comment on function public.search_directory_profiles_v2(
  text, text, text, text, text, text, boolean, boolean, boolean,
  integer, integer, text, integer, text, integer, integer
) is 'RLS-aware v2 public directory search with current-site filter parity, physical keyword matching, visiting-city support, effective-tier ranking, and pagination.';
