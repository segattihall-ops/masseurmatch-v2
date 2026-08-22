create index if not exists idx_profile_reports_ip_hash_created_at
  on public.profile_reports (ip_hash, created_at desc)
  where ip_hash is not null;

create index if not exists idx_profile_reports_status_created_at
  on public.profile_reports (status, created_at desc);
