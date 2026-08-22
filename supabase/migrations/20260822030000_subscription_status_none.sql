-- ============================================================================
-- therapist_subscriptions.status — admit "none"
-- ============================================================================
-- Fixes a total block on the money path: today no therapist can subscribe at
-- all, and the failure is invisible from the outside.
--
-- What happens now
-- ----------------
-- PayPal creates a subscription in APPROVAL_PENDING and charges nothing until
-- the payer approves at PayPal's own domain. The adapter maps that — and
-- APPROVED, its sibling — onto `none`, deliberately, so that nothing marks a
-- therapist paid before money has actually moved:
--
--     APPROVAL_PENDING: "none",
--     APPROVED:         "none",
--
-- `startSubscription` then records the row *before* redirecting, because the
-- webhook is keyed on `provider_subscription_id` and an approval that lands
-- first would otherwise be filed as "No matching subscription".
--
-- That insert carries `status = 'none'`, which this table's CHECK constraint
-- does not allow:
--
--     CHECK (status = ANY (ARRAY['trialing','active','past_due','canceled','expired']))
--
-- So the insert is rejected, `recordNewSubscription` throws, and the action's
-- catch turns it into "Could not start the subscription. Please try again."
-- Every time, for every therapist, on the first step of paying. Retrying does
-- not help. Nothing in the logs names the constraint, because the message the
-- provider sees is deliberately generic.
--
-- Why widen the constraint rather than change what is written
-- -----------------------------------------------------------
-- `SUBSCRIPTION_STATUSES` in packages/billing/plans.ts is the application's
-- vocabulary, and it has six members — the five here plus `none`. The column
-- was built with five. This aligns the database with the vocabulary rather than
-- bending the vocabulary to fit the column.
--
-- The alternative — writing `canceled` or `expired` for a subscription that has
-- merely not been approved yet — would be a lie in the one table support reads
-- when a therapist says they paid and nothing happened. `none` already means
-- exactly "no subscription is in force", which is the truth at that moment, and
-- `entitlesListing` already treats it as not entitling.
--
-- Widening a CHECK admits values; it invalidates no existing row. Every current
-- row carries one of the five, all of which remain legal.
--
-- Applying
-- --------
-- Additive and safe to run on a live database. The table is briefly locked
-- while the constraint is replaced; on a table of this size that is
-- milliseconds. Run against a Supabase branch, then staging, then production.

alter table public.therapist_subscriptions
  drop constraint if exists therapist_subscriptions_status_check;

alter table public.therapist_subscriptions
  add constraint therapist_subscriptions_status_check
  check (
    status = any (
      array['none'::text, 'trialing'::text, 'active'::text, 'past_due'::text, 'canceled'::text, 'expired'::text]
    )
  );

comment on constraint therapist_subscriptions_status_check on public.therapist_subscriptions is
  'Mirrors SUBSCRIPTION_STATUSES in packages/billing/plans.ts. "none" is the state of a subscription created but not yet approved by the payer — it entitles nothing, and the webhook moves it on.';
