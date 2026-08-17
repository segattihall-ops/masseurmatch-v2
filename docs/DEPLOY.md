# Deploy runbook

> ## ⚠️ The live PayPal webhook had never worked — URL now fixed
>
> Webhook `1VH31349P8377213N` was registered on the **apex** domain,
> `https://masseurmatch.com/api/webhooks/paypal`. Vercel 308-redirects apex to
> `www`, and **PayPal does not follow redirects**, so every delivery failed:
>
> ```
> http_status: 308
> reason_phrase: "Redirects are not allowed"
> Location: https://www.masseurmatch.com/api/webhooks/paypal
> ```
>
> **Fixed 2026-08-16 22:31 UTC** to
> `https://www.masseurmatch.com/api/webhooks/paypal`. Verified: a POST to that
> URL now returns **400 with zero redirects** — the handler is reached and
> rejects the unsigned body, which is the correct response. The webhook
> subscribes to `*`, so event coverage was never the problem.
>
> **Still to do: replay the failed deliveries** with `Resend` in the PayPal
> dashboard. Nothing that failed before the fix has been reprocessed.
>
> ### The path differs between the two sites — handled in code, 2026-08-17
>
> PayPal delivers to `/api/webhooks/paypal`. v2 names that handler
> `/api/webhooks/billing`, because it serves whichever provider
> `BILLING_PROVIDER` selects. Measured today:
>
> | URL                                                         | Status                            |
> | ----------------------------------------------------------- | --------------------------------- |
> | `www.masseurmatch.com/api/webhooks/paypal` (old site, live) | 400 — handler reached             |
> | v2 dashboard `/api/webhooks/billing`                        | 401 invalid signature — correct   |
> | v2 dashboard `/api/webhooks/paypal` (before the fix)        | **404** — would have lost billing |
>
> On cutover day that 404 is silent: PayPal retries into nothing and no error
> surfaces on our side. Repointing the webhook is worse than it sounds — PayPal
> rejects a URL already registered on the account, so it means delete-then-create
> against live billing and losing whatever is delivered in between.
>
> `apps/dashboard/src/app/api/webhooks/paypal/route.ts` now re-exports the
> billing handler, so both paths answer and no cutover step is needed. It is an
> alias, not a copy — one handler, one signature check. A smoke test asserts the
> path is not 404, because a rename is exactly how this comes back.
>
> Deployment protection on `masseurmatch-v2-kftd` is **off**, so PayPal can reach
> it. The public project still has SSO on `all_except_custom_domains`, which is
> fine — it serves no webhook, and custom domains are exempt at cutover.
>
> To re-check at any time:
>
> ```sh
> export PAYPAL_CLIENT_ID=... PAYPAL_CLIENT_SECRET=...
> scripts/paypal-admin.sh webhooks   # flags any apex-domain webhook
> ```
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
> Both consequences are now closed:
>
> 1. **The 26 paid tiers had nothing behind them.** Resolved by the courtesy
>    wind-down — each carries a 2026-09-16 deadline and `resolveTier()` returns
>    `free` after it. See `docs/COURTESY-GRANT-WINDDOWN.md`. Note that photo
>    limits come from the tier but **featured placement does not**: the directory
>    ranks on the hand-set `is_featured` column, which no tier writes.
> 2. **No backfill is needed.** `therapist_subscriptions` is empty because nobody
>    has ever paid — confirmed by the account owner. There are no existing
>    subscribers to reconcile, so the webhook's "No matching subscription" branch
>    has nothing to catch up on.

> ## Migrations
>
> **Both are applied.** Nothing here is outstanding.
>
> | Migration                  | State                 | Verified                                                              |
> | -------------------------- | --------------------- | --------------------------------------------------------------------- |
> | `visibility_spikes.sql`    | ✅ Applied 2026-08-17 | `spike_until` present; `profile_spikes` with RLS, 1 policy, 2 indexes |
> | `courtesy_tier_grants.sql` | ✅ Applied 2026-08-17 | 26 rows carry a deadline, 0 missed; all at 2026-09-16                 |
>
> The `UntypedForSpikes` alias is gone and the generated types are current.
>
> `courtesy_tier_grants.sql` stamps `now() + 30 days`, so the deadline is
> **2026-09-16** and the notice email had to go out the same day it ran. The
> wind-down itself is documented in `docs/COURTESY-GRANT-WINDDOWN.md`, including
> why the notice must not mention featured placement.
>
> The per-column fallback in `packages/db/actions/directory.ts` stays regardless.
> **CI cannot catch a missing migration** — it has no database credentials and
> skips those queries — so a future column must be able to be absent without
> taking the build down.

Everything that has to be done in the Vercel and PayPal dashboards, in order.
None of it can be done from the repository.

Do the steps in order — step 2 cannot be verified until step 1 is done, and
step 4 needs the URL that step 2 produces.

---

## Step 1 — Fix both Root Directories ✅ DONE

Verified in the build logs for commit `5801c3b` on 2026-08-16 at 21:24 UTC:

| Project                | Root Directory   | Build log says                     |
| ---------------------- | ---------------- | ---------------------------------- |
| `masseurmatch-v2`      | `apps/web`       | `@masseurmatch/web:build` ✅       |
| `masseurmatch-v2-kftd` | `apps/dashboard` | `@masseurmatch/dashboard:build` ✅ |

Both deployments reached **Ready**. Nothing further to do here.

If a build ever says `No Next.js version detected`, the Root Directory was
cleared — the repository root has no `next` dependency because it is a
workspace manifest, which is correct.

---

## Step 2 — Environment variables

Set these under **Settings** → **Environment Variables** on each project, for
**Production** and **Preview**.

> ### What is actually set today is the OLD site's variable names
>
> The 21:24 build logs name the variables present on each project. On
> `masseurmatch-v2` they are `SITE_URL`, `CLOUDINARY_URL`,
> `SUPABASE_ACCESS_TOKEN`, `PAYPAL_ENVIRONMENT`, and `PAYPAL_PLAN_STANDARD` /
> `_PRO` / `_ELITE`. **v2 reads none of those names.** It wants
> `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`.
>
> Two consequences, both confirmed in the same log:
>
> 1. **The public site renders an empty directory.** The build warned that
>    `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are not
>    set, so the directory renders empty. The preview deploy has no therapists
>    on it. These two are the only variables the site cannot start without.
> 2. **The PayPal plan ids are on the wrong project.** They are set on
>    `masseurmatch-v2` (the public site, which reads no PayPal variable at all)
>    and absent from `masseurmatch-v2-kftd`, which is the app that bills. Move
>    them; do not copy them.
>
> Renaming is not optional and old names are not aliased — a variable under the
> wrong name is the same as an unset one.

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

### Adding a variable Vercel does not already know about

Turborepo runs in strict env mode: a variable that is not declared in
`turbo.json` is **stripped before the build sees it**, even when it is set
correctly in Vercel. The build does not fail — the value simply arrives as
`undefined`. Vercel prints this as
`the following environment variables are set on your Vercel project, but
missing from "turbo.json" … These variables WILL NOT be available`.

So a new variable takes two edits, not one: set it in Vercel **and** add it to
`turbo.json`.

- Build-time (`NEXT_PUBLIC_*`, inlined into the bundle) → the `env` array on
  the `build` task, so changing it busts the Turbo cache. In
  `globalPassThroughEnv` it would not, and a cache hit would re-serve a bundle
  with the previous value compiled in.
- Server-side, read at request time → `globalPassThroughEnv`.

`PAYPAL_PLAN_STANDARD` / `_PRO` / `_ELITE` deserve a specific warning: the code
builds those names at runtime (``process.env[`PAYPAL_PLAN_${tier.toUpperCase()}`]``
in `packages/billing/providers/paypal.ts`), so they appear in no plain search
and are easy to miss. They are declared in `turbo.json` — leave them there.

---

## Step 3 — Map the PayPal plans ✅ IDS CONFIRMED

**All three plans already exist and are ACTIVE**, at exactly the `plans.ts`
prices. Verified against the live account on 2026-08-16:

| Variable               | Plan id                      | Price           |
| ---------------------- | ---------------------------- | --------------- |
| `PAYPAL_PLAN_STANDARD` | `P-0LK9851678808213YNJ5TSKQ` | $39.00 / month  |
| `PAYPAL_PLAN_PRO`      | `P-6DG73865LJ933653NNJ5TU4Q` | $79.00 / month  |
| `PAYPAL_PLAN_ELITE`    | ⚠️ needs a new $129 plan     | $129.00 / month |

> ### ⚠️ Elite moved to $129 — PayPal has not
>
> `plans.ts` now prices Elite at **$129**, but `P-9US760508D1062104NJ5TX7Y` is a
> **$99** plan. Until a new plan exists, the site shows $129 and PayPal charges
> $99.
>
> Create a NEW plan rather than editing that one — editing a live plan re-prices
> its subscribers. Nothing is at risk here (nobody has ever subscribed), but the
> habit is what keeps it safe later.
>
> ```sh
> export PAYPAL_CLIENT_ID=... PAYPAL_CLIENT_SECRET=...
> scripts/paypal-admin.sh plans        # confirm no $129 plan exists yet
> ```
>
> Create it in the PayPal dashboard at $129.00 USD/month, then point
> `PAYPAL_PLAN_ELITE` at the new id and redeploy the dashboard.

Nothing needs creating. Set these three on the **dashboard** project.

Two things about these plans that are not obvious:

- **Every plan opens with a 14-day $0.00 trial cycle.** No code change is
  needed — `BILLING.SUBSCRIPTION.ACTIVATED` already maps to `payment_succeeded`
  and `trialing` already grants entitlement — but it means a new subscriber is
  entitled immediately and the first `PAYMENT.SALE.COMPLETED` arrives two weeks
  later. Do not treat "no payment yet" as "not a subscriber".
- **`Member Badge Renewal` is also $39.00.** Price alone therefore does not
  identify the Standard plan. Match on the plan _name_, not the amount.

To re-derive the mapping at any time:

```sh
export PAYPAL_CLIENT_ID=... PAYPAL_CLIENT_SECRET=...
scripts/paypal-admin.sh plans
```

It prints the `PAYPAL_PLAN_*` lines ready to paste and warns when two plans
share a price. To do it by hand instead:

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

> **Use the new webhook's id, not `1VH31349P8377213N`.** That one is the old
> site's webhook, now pointing at `https://www.masseurmatch.com/...`. Signature
> verification is per-webhook: v2 checking events against a webhook id that
> never delivers to it will reject every event it does receive.

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
