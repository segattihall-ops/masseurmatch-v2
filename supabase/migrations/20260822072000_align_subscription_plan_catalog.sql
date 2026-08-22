-- `subscription_plans` is the FK catalogue for therapist_subscriptions. Billing
-- still validates and charges through the application catalogue + PayPal, but
-- keeping these metadata rows aligned prevents Admin/reporting code from
-- presenting stale historical prices.

update public.subscription_plans
set price_cents = 0,
    currency = 'USD',
    billing_interval = 'free',
    updated_at = now()
where code = 'free';

update public.subscription_plans
set price_cents = 3900,
    currency = 'USD',
    billing_interval = 'month',
    updated_at = now()
where code = 'standard';

update public.subscription_plans
set price_cents = 7900,
    currency = 'USD',
    billing_interval = 'month',
    updated_at = now()
where code = 'pro';

update public.subscription_plans
set price_cents = 12900,
    currency = 'USD',
    billing_interval = 'month',
    updated_at = now()
where code = 'elite';
