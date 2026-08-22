begin;

create or replace function public.admin_review_profile_migration(
  p_migration_id uuid,
  p_admin_user_id uuid,
  p_decisions jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_pending integer;
  v_submitted integer;
  v_unique integer;
  v_approved integer;
  v_rejected integer;
  v_reviewed_at timestamptz := now();
begin
  if p_migration_id is null or p_admin_user_id is null then
    raise exception 'Migration id and admin user id are required';
  end if;

  if jsonb_typeof(p_decisions) <> 'array' then
    raise exception 'Decisions must be a JSON array';
  end if;

  if not exists (select 1 from public.profile_migrations where id = p_migration_id) then
    raise exception 'Migration not found';
  end if;

  select count(*) into v_pending
  from public.imported_reviews
  where migration_id = p_migration_id
    and reviewed_at is null;

  select count(*), count(distinct decision.review_id)
  into v_submitted, v_unique
  from jsonb_to_recordset(p_decisions) as decision(review_id uuid, approved boolean, notes text);

  if v_pending = 0 then
    raise exception 'This import has no pending reviews';
  end if;

  if v_submitted <> v_pending or v_unique <> v_pending then
    raise exception 'Include exactly one decision for every pending review';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_decisions) as decision(review_id uuid, approved boolean, notes text)
    left join public.imported_reviews review
      on review.id = decision.review_id
     and review.migration_id = p_migration_id
     and review.reviewed_at is null
    where review.id is null
  ) then
    raise exception 'A decision references a review that is not pending in this import';
  end if;

  with decisions as (
    select review_id, approved, nullif(trim(coalesce(notes, '')), '') as notes
    from jsonb_to_recordset(p_decisions) as decision(review_id uuid, approved boolean, notes text)
  ), updated as (
    update public.imported_reviews review
    set
      is_public = decisions.approved,
      public_label = 'Imported review',
      reviewed_at = v_reviewed_at,
      reviewed_by = p_admin_user_id,
      review_notes = left(decisions.notes, 1000),
      updated_at = v_reviewed_at
    from decisions
    where review.id = decisions.review_id
      and review.migration_id = p_migration_id
      and review.reviewed_at is null
    returning decisions.approved
  )
  select
    count(*) filter (where approved),
    count(*) filter (where not approved)
  into v_approved, v_rejected
  from updated;

  if coalesce(v_approved, 0) + coalesce(v_rejected, 0) <> v_pending then
    raise exception 'Import review changed while it was being finalized';
  end if;

  update public.profile_migrations
  set
    is_verified = true,
    verified_at = v_reviewed_at,
    verified_by = p_admin_user_id,
    updated_at = v_reviewed_at
  where id = p_migration_id;

  return jsonb_build_object(
    'approved', coalesce(v_approved, 0),
    'rejected', coalesce(v_rejected, 0),
    'reviewedAt', v_reviewed_at
  );
end;
$function$;

revoke all on function public.admin_review_profile_migration(uuid, uuid, jsonb) from public;
revoke all on function public.admin_review_profile_migration(uuid, uuid, jsonb) from anon;
revoke all on function public.admin_review_profile_migration(uuid, uuid, jsonb) from authenticated;
grant execute on function public.admin_review_profile_migration(uuid, uuid, jsonb) to service_role;

commit;
