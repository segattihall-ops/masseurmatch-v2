-- ============================================================================
-- billing_events — the webhook idempotency ledger
-- ============================================================================
-- NOT APPLIED. Review, run against a Supabase branch, then staging, then
-- production.
--
-- Why a new table, when several billing tables already exist
-- ---------------------------------------------------------
-- Checked before proposing this, as with `audit_log`:
--
--   therapist_subscriptions  ALREADY FITS. It has `provider`,
--                            `provider_subscription_id`, `plan_id`, `status`,
--                            `current_period_end` and `cancel_at_period_end`.
--                            The schema was already built provider-agnostic, so
--                            phase 7 needs no changes to it at all.
--
--   stripe_events            Right *shape* — event id, payload, processed_at,
--                            processing_status — but the key column is
--                            `stripe_event_id`. Recording an Authorize.Net or
--                            PayPal notification in a column named for Stripe
--                            would be a lie that outlives everyone who knew it
--                            was deliberate. Not reused.
--
--   subscriptions,           Stripe-specific columns throughout. Left alone.
--   checkout_sessions
--
-- So the only genuinely missing piece is somewhere to record which webhook
-- events have already been handled.
--
-- Touches one new table and its policies. No existing row is read or written.
-- ============================================================================

begin;

create table if not exists public.billing_events (
  id           uuid primary key default gen_random_uuid(),
  provider     text        not null check (provider in ('authorizenet', 'paypal')),
  -- The provider's own event id. Uniqueness *per provider*, because two
  -- processors can legitimately mint the same id string.
  event_id     text        not null,
  kind         text        not null check (kind in (
                 'payment_succeeded', 'payment_failed',
                 'subscription_canceled', 'subscription_expired')),
  subscription_id text     not null,
  payload      jsonb       not null default '{}'::jsonb,
  occurred_at  timestamptz,
  processed_at timestamptz not null default now(),
  -- Set when handling failed, so a retry can be told from a first delivery.
  error        text,

  constraint billing_events_provider_event_id_key unique (provider, event_id)
);

-- The idempotency check is `select ... where provider = $1 and event_id = $2`,
-- which the unique constraint's index already serves. The second index is for
-- reconciling a single subscription's history.
create index if not exists billing_events_subscription_idx
  on public.billing_events (subscription_id, processed_at desc);

-- ---------------------------------------------------------------------------
-- Access
-- ---------------------------------------------------------------------------
-- Written only by the webhook route, which runs as `service_role` and bypasses
-- RLS. No client role needs to write here, so none may.
--
-- Admins may read: reconciling "the therapist says they paid" against what the
-- processor actually sent is a support task, and without read access that
-- happens in the provider's dashboard instead, with no audit trail.
--
-- Deliberately no UPDATE or DELETE policy — same reasoning as `audit_log`. A
-- ledger that can be edited cannot settle an argument about what happened.
-- ---------------------------------------------------------------------------
alter table public.billing_events enable row level security;

drop policy if exists "billing_events_admin_read" on public.billing_events;
create policy "billing_events_admin_read"
  on public.billing_events for select
  using (public.is_admin());

revoke all on public.billing_events from anon;
grant select on public.billing_events to authenticated;

commit;

-- ============================================================================
-- Verification
-- ============================================================================
-- The unique constraint is what makes replay safe — inserting the same event
-- twice must fail:
--   insert into public.billing_events (provider, event_id, kind, subscription_id)
--   values ('authorizenet', 'test-1', 'payment_succeeded', 'sub_1');
--   insert into public.billing_events (provider, event_id, kind, subscription_id)
--   values ('authorizenet', 'test-1', 'payment_succeeded', 'sub_1');
--   -- expect: duplicate key value violates unique constraint
--   delete from public.billing_events where event_id = 'test-1';
--
-- The same id under a different provider must be allowed:
--   insert into public.billing_events (provider, event_id, kind, subscription_id)
--   values ('paypal', 'test-1', 'payment_succeeded', 'sub_1');  -- expect: ok
--   delete from public.billing_events where event_id = 'test-1';
--
-- anon must be refused entirely:
--   curl -o /dev/null -w '%{http_code}\n' \
--     "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/billing_events?select=id&limit=1" \
--     -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY"
--   # expect 401
-- ============================================================================
