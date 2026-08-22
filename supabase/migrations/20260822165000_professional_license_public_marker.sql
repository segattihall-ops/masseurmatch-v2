begin;

create or replace function public.refresh_professional_license_public_marker(target_profile_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_license record;
  base_text text;
  marker text;
begin
  select
    pd.license_type,
    pd.license_number,
    pd.issuing_authority,
    pd.jurisdiction,
    pd.expires_on,
    pd.verified_at
  into current_license
  from public.profile_documents pd
  where pd.profile_id = target_profile_id
    and coalesce(pd.document_type, pd.type) = 'professional_license'
    and pd.status = 'approved'
    and (pd.expires_on is null or pd.expires_on >= current_date)
  order by pd.verified_at desc nulls last, pd.created_at desc
  limit 1;

  select btrim(
    regexp_replace(
      coalesce(p.certifications, ''),
      '(^|\n)MasseurMatch Verified License[^\n]*(\n|$)',
      E'\n',
      'g'
    ),
    E' \n\t'
  )
  into base_text
  from public.profiles p
  where p.id = target_profile_id;

  if current_license is null then
    marker := null;
  else
    marker := 'MasseurMatch Verified License — '
      || coalesce(nullif(current_license.license_type, ''), 'Professional License')
      || case when nullif(current_license.jurisdiction, '') is not null then ' · ' || current_license.jurisdiction else '' end
      || case
           when nullif(regexp_replace(coalesce(current_license.license_number, ''), '\s+', '', 'g'), '') is not null
           then ' · License ••••' || right(regexp_replace(current_license.license_number, '\s+', '', 'g'), 4)
           else ''
         end
      || case when current_license.expires_on is not null then ' · Expires ' || to_char(current_license.expires_on, 'Mon YYYY') else '' end;
  end if;

  update public.profiles
  set certifications = case
    when marker is null then nullif(base_text, '')
    when nullif(base_text, '') is null then marker
    else base_text || E'\n' || marker
  end,
  updated_at = now()
  where id = target_profile_id;
end;
$$;

create or replace function public.sync_professional_license_public_marker()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    if coalesce(old.document_type, old.type) = 'professional_license' then
      perform public.refresh_professional_license_public_marker(old.profile_id);
    end if;
    return old;
  end if;

  if coalesce(new.document_type, new.type) = 'professional_license'
     and (
       new.status = 'approved'
       or (tg_op = 'UPDATE' and old.status = 'approved')
       or new.expires_on is distinct from case when tg_op = 'UPDATE' then old.expires_on else null end
     ) then
    perform public.refresh_professional_license_public_marker(new.profile_id);
  end if;

  return new;
end;
$$;

drop trigger if exists sync_professional_license_public_marker on public.profile_documents;
create trigger sync_professional_license_public_marker
after insert or update or delete on public.profile_documents
for each row
execute function public.sync_professional_license_public_marker();

commit;
