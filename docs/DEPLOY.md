# Deploy runbook

> ## ⚠️ URGENT — the live PayPal webhook has never worked
>
> The webhook on the OLD site is registered as
> `https://masseurmatch.com/api/webhooks/paypal` — the **apex** domain. Vercel
> 308-redirects apex to `www`, and **PayPal does not follow redirects**:
>
> ```
> http_status: 308
> reason_phrase: "Redirects are not allowed"
> Location: https://www.masseurmatch.com/api/webhooks/paypal
> ```
>
> **Fix: add `www.` to the webhook URL in the PayPal dashboard.** One field.
> Then use the `resend` link on the failed events to replay them.
>
> Scope, measured in the production database on 2026-08-16:
>
> |                                          |                      |
> | ---------------------------------------- | -------------------- |
> | Rows in `therapist_subscriptions`        | **0**                |
> | Profiles with a `subscription_status`    | **0**                |
> | Profiles with a paid `subscription_tier` | 26 (25 elite, 1 pro) |
>
> No PayPal event has ever been recorded. A confirmed example: subscription
> `I-EXY5H8HCTVPN` created 2026-08-11 for `custom_id`
> `3ef08824-4862-4066-8fff-47f5e5f31ccb` — profile `reggie-3ef08824`, whose
> `subscription_status` is still null. That event was `APPROVAL_PENDING`, so
> nothing was charged for it, but any `PAYMENT.SALE.COMPLETED` would have failed
> delivery in exactly the same way.
>
> Two things follow, both needing a decision:
>
> 1. **The 26 paid tiers have nothing behind them.** 25 profiles marked `elite`
>    with no subscription record looks seeded rather than earned. v2 grants photo
>    limits and featured placement from `profiles.subscription_tier`, so this
>    decides what those therapists get.
> 2. **Existing PayPal subscribers have no row in `therapist_subscriptions`.**
>    The webhook matches on `provider_subscription_id`; with the table empty,
>    every event for an existing subscription is filed as "No matching
>    subscription" and ignored. They need backfilling from PayPal's subscription
>    list before v2 takes over billing.

Everything that has to be done in the Vercel and PayPal dashboards, in order.
None of it can be done from the repository.

Do the steps in order — step 2 cannot be verified until step 1 is done, and
step 4 needs the URL that step 2 produces.

---

## Step 1 — Fix both Root Directories

Two Vercel projects are connected to this repository and **both are currently
pointing at the wrong folder.**

| Project                | Currently builds         | Must build           |
| ---------------------- | ------------------------ | -------------------- |
| `masseurmatch-v2`      | `apps/dashboard` ← wrong | **`apps/web`**       |
| `masseurmatch-v2-kftd` | repository root ← wrong  | **`apps/dashboard`** |

For **each** project:

1. Go to <https://vercel.com/mm-website> and open the project.
2. **Settings** → **Build and Deployment**. (On older accounts this is
   **Settings** → **General**.) Find **Root Directory**.
3. Click **Edit**, type the path from the table above — `apps/web` or
   `apps/dashboard`, with no leading `./` and no trailing slash — and **Save**.
4. **Deployments** tab → the newest deployment → **⋯** menu → **Redeploy**.

### How to know it worked

- `masseurmatch-v2` build log should show `@masseurmatch/web:build`.
- `masseurmatch-v2-kftd` build log should show `@masseurmatch/dashboard:build`.

If a build still says `No Next.js version detected`, the Root Directory did not
save — the repository root has no `next` dependency because it is a workspace
manifest, which is correct.

> **Do not merge the PR until step 1 is done.** Merging deploys `main` to
> production, and with the current Root Directory `masseurmatch-v2` would
> publish the dashboard on the public site's URL.

---

## Step 2 — Environment variables

Set these under **Settings** → **Environment Variables** on each project, for
**Production** and **Preview**.

The two apps need _different_ variables. This matters: nothing in `apps/web`
reads any PayPal variable, so PayPal credentials set on `masseurmatch-v2` do
nothing at all.

### `masseurmatch-v2` (the public site)

| Variable                            | Required   | Notes                                                                                                                           |
| ----------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`          | yes        |                                                                                                                                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`     | yes        |                                                                                                                                 |
| `NEXT_PUBLIC_SITE_URL`              | at cutover | Leave unset until the domain moves; it falls back to the Vercel URL. Set it to `https://www.masseurmatch.com` when cutting over |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | for images | Without it, profile photos do not render                                                                                        |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`    | optional   |                                                                                                                                 |
| `NEXT_PUBLIC_SENTRY_DSN`            | optional   |                                                                                                                                 |

### `masseurmatch-v2-kftd` (the dashboard)

| Variable                            | Required     | Notes                                                                |
| ----------------------------------- | ------------ | -------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`          | yes          |                                                                      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`     | yes          |                                                                      |
| `SUPABASE_SERVICE_ROLE_KEY`         | yes          | Server only. Bypasses RLS — never prefix with `NEXT_PUBLIC_`         |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | yes          | Photo uploads fail without it                                        |
| `CLOUDINARY_API_KEY`                | yes          | Server only                                                          |
| `CLOUDINARY_API_SECRET`             | yes          | Server only                                                          |
| `BILLING_PROVIDER`                  | yes          | Set to `paypal`. Defaults to `authorizenet`, which is not configured |
| `PAYPAL_CLIENT_ID`                  | yes          |                                                                      |
| `PAYPAL_CLIENT_SECRET`              | yes          | Server only                                                          |
| `PAYPAL_WEBHOOK_ID`                 | yes          | From step 4                                                          |
| `PAYPAL_PLAN_STANDARD`              | yes          | From step 3                                                          |
| `PAYPAL_PLAN_PRO`                   | yes          | From step 3                                                          |
| `PAYPAL_PLAN_ELITE`                 | yes          | From step 3                                                          |
| `PAYPAL_API_BASE`                   | sandbox only | `https://api-m.sandbox.paypal.com`. Omit for live                    |
| `PAYPAL_RETURN_URL`                 | recommended  | `https://<dashboard-url>/subscription?paypal=return`                 |
| `PAYPAL_CANCEL_URL`                 | recommended  | `https://<dashboard-url>/subscription?paypal=cancel`                 |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`    | optional     | Both Turnstile keys, or neither — one alone leaves the check off     |
| `TURNSTILE_SECRET_KEY`              | optional     | Server only                                                          |
| `NEXT_PUBLIC_SENTRY_DSN`            | optional     |                                                                      |

---

## Step 3 — Map the PayPal plans

**Plans already exist.** PayPal is live on the old site: subscription
`I-EXY5H8HCTVPN` was created against plan `P-0LK9851678808213YNJ5TSKQ`. So this
step is usually _mapping_ rather than creating — open the plan list, check each
plan's price, and put its id in the variable for the tier whose price matches.

Create a plan only where a price has none.

The ids are opaque strings PayPal mints (`P-5ML4271244454362`) and cannot be
derived from our names, which is why they are environment variables.

1. PayPal dashboard → **Pay & Get Paid** → **Subscriptions** → **Plans**.
2. Each of these prices needs a live monthly plan in **USD**:

   | Plan     | Price              | Goes in                |
   | -------- | ------------------ | ---------------------- |
   | Standard | **$39.00 / month** | `PAYPAL_PLAN_STANDARD` |
   | Pro      | **$79.00 / month** | `PAYPAL_PLAN_PRO`      |
   | Elite    | **$99.00 / month** | `PAYPAL_PLAN_ELITE`    |

3. Copy each plan id into the matching variable on the dashboard project.

**The prices must match `packages/billing/plans.ts`.** PayPal charges whatever
its own plan says; the site displays what `plans.ts` says. A mismatch shows a
therapist one figure and bills another.

To change a price later, create a **new** PayPal plan and repoint the variable.
Editing a live plan's price re-prices existing subscribers.

A tier with no id configured cannot be bought — `createSubscription` throws
naming the missing variable rather than silently falling back to another tier.

---

## Step 4 — Point the webhook at the dashboard

**The path changed.** The old site listens at `/api/webhooks/paypal`; v2 listens
at `/api/webhooks/billing`, on the dashboard app. Until cutover both can exist —
point the old one at `https://www.masseurmatch.com/api/webhooks/paypal` (with
`www`, per the warning at the top) and add a second webhook for v2.

1. PayPal dashboard → **Apps & Credentials** → your app → **Webhooks** → **Add**.
2. URL: `https://<dashboard-url>/api/webhooks/billing`
   (the dashboard's URL from step 1, e.g.
   `https://masseurmatch-v2-kftd-mm-website.vercel.app`).
3. Subscribe to these events:
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.EXPIRED`
   - `BILLING.SUBSCRIPTION.SUSPENDED`
   - `BILLING.SUBSCRIPTION.PAYMENT.FAILED`
   - `PAYMENT.SALE.COMPLETED`
   - `PAYMENT.SALE.DENIED`
4. Copy the **Webhook ID** into `PAYPAL_WEBHOOK_ID` and redeploy the dashboard.

**Nothing marks a therapist as paid except this webhook.** `createSubscription`
returns status `none` on purpose — a subscription is only `active` once PayPal
confirms money moved. If the webhook is not configured, subscriptions will be
created and approved and never activate.

### Verifying it

```
curl -i -X POST https://<dashboard-url>/api/webhooks/billing -d '{}'
```

Expect **401** (signature rejected) or **503** (provider unconfigured). A
**200** would mean an unsigned request was accepted as a real payment event —
that is a bug, report it.

Then subscribe with a PayPal sandbox account and check the row:

```sql
select provider, kind, event_id, processed_at, error from billing_events
order by processed_at desc limit 5;
```

---

## Step 5 — Cut over the domain

Only after steps 1–4 verify. Follow `CUTOVER.md`; the short version:

1. Move `www.masseurmatch.com` from the old Vercel project to `masseurmatch-v2`.
2. Set `NEXT_PUBLIC_SITE_URL=https://www.masseurmatch.com` on it.
3. Redeploy so the sitemap and canonicals regenerate against the real host.
4. Verify: `/therapists/mati-eb87b62c` returns 308 to `/ny/new-york/mati-eb87b62c`,
   `sitemap.xml` lists the v2 URLs, and canonical tags carry `www.masseurmatch.com`.

---

## Optional, safe to defer

- **Turnstile** — a Cloudflare site key and secret. Both or neither.
- **Sentry** — a DSN. `reportError` logs until one exists.
- **Shared rate-limit store** — Upstash or Vercel KV. The current limiter is
  per-lambda-instance, so it is a speed bump rather than a guarantee.
- **Staging Supabase credentials in CI** — the RLS and smoke suites skip
  without them, so green CI is not evidence the database works.
- **Drop the `backup_20260527` schema** — a copy of `therapist_subscriptions`
  with RLS disabled. Not exposed by PostgREST, so not a live leak.
- **Rotate the Supabase personal access token** that was pasted into chat.
