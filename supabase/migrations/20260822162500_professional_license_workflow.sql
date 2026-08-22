begin;

alter table public.profile_documents
  add column if not exists holder_name text,
  add column if not exists license_type text,
  add column if not exists license_number text,
  add column if not exists issuing_authority text,
  add column if not exists jurisdiction text,
  add column if not exists issued_on date,
  add column if not exists expires_on date,
  add column if not exists verified_at timestamptz,
  add column if not exists reviewed_by uuid,
  add column if not exists rejection_reason text,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists profile_documents_professional_license_idx
  on public.profile_documents (profile_id, status, verified_at desc, created_at desc)
  where coalesce(document_type, type) = 'professional_license';

create or replace function public.guard_profile_document_review_state()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.role()) = 'service_role'
     or exists (
       select 1
       from public.user_roles ur
       where ur.user_id = (select auth.uid())
         and ur.role = 'admin'
     ) then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.status := 'pending';
    new.reviewed_by := null;
    new.verified_at := null;
    new.rejection_reason := null;
    return new;
  end if;

  if new.profile_id is distinct from old.profile_id
     or new.status is distinct from old.status
     or new.reviewed_by is distinct from old.reviewed_by
     or new.verified_at is distinct from old.verified_at
     or new.rejection_reason is distinct from old.rejection_reason
  then
    raise exception 'credential review state may only be changed by an administrator or trusted backend'
      using errcode = '42501';
  end if;

  if old.status is distinct from 'pending' then
    raise exception 'reviewed credential records cannot be edited by the provider'
      using errcode = '42501';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists guard_profile_document_review_state on public.profile_documents;
create trigger guard_profile_document_review_state
before insert or update on public.profile_documents
for each row
execute function public.guard_profile_document_review_state();

create or replace function public.guard_masseurmatch_verified_certification_marker()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  old_marker text;
  new_marker text;
begin
  if (select auth.role()) = 'service_role'
     or exists (
       select 1
       from public.user_roles ur
       where ur.user_id = (select auth.uid())
         and ur.role = 'admin'
     ) then
    return new;
  end if;

  new_marker := substring(coalesce(new.certifications, '') from '(MasseurMatch Verified License[^\n]*)');

  if tg_op = 'INSERT' then
    if new_marker is not null then
      raise exception 'MasseurMatch verified credential markers are platform-controlled'
        using errcode = '42501';
    end if;
    return new;
  end if;

  old_marker := substring(coalesce(old.certifications, '') from '(MasseurMatch Verified License[^\n]*)');

  if old_marker is null and new_marker is not null then
    raise exception 'MasseurMatch verified credential markers are platform-controlled'
      using errcode = '42501';
  end if;

  if old_marker is not null and (new_marker is null or position(old_marker in coalesce(new.certifications, '')) = 0) then
    raise exception 'MasseurMatch verified credential markers may only be changed by an administrator or trusted backend'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_masseurmatch_verified_certification_marker on public.profiles;
create trigger guard_masseurmatch_verified_certification_marker
before insert or update of certifications on public.profiles
for each row
execute function public.guard_masseurmatch_verified_certification_marker();

commit;
