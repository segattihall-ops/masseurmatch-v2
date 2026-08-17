# Courtesy grant wind-down — runbook

26 profiles carry a paid tier nobody paid for. This winds them down on a
30-day deadline instead of revoking them outright.

**Run steps 1–3 on the same day the email goes out.** The migration stamps
`now() + interval '30 days'`, so the clock starts when it runs, not when the
email is sent. Applying a week early quietly turns a 30-day notice into 23.

State measured in production on 2026-08-17, before any of this ran:

|                                       |                               |
| ------------------------------------- | ----------------------------- |
| Profiles                              | 42                            |
| Affected (paid tier, no subscription) | **26** — 25 Elite, 1 Pro      |
| Publicly visible among them           | 11                            |
| Featured among them                   | 9                             |
| With a real subscription              | **0**                         |
| Rows in `therapist_subscriptions`     | 0                             |
| Profiles missing an email address     | **0** — everyone is reachable |

---

## Step 1 — Apply the migration

```sh
psql "$SUPABASE_DB_URL" -f packages/db/migrations/courtesy_tier_grants.sql
```

Safe to re-run: the column add is `if not exists`, and the `UPDATE` only
touches rows where `tier_granted_until is null`, so a second run does not
extend anyone's deadline.

## Step 2 — Verify before sending anything

```sh
psql "$SUPABASE_DB_URL" -c "
select count(*) filter (where tier_granted_until is not null) as com_prazo,
       count(*) filter (where coalesce(subscription_tier,'free') <> 'free'
                          and subscription_status is null
                          and tier_granted_until is null)      as sem_prazo_erro,
       min(tier_granted_until)::date                           as prazo
from public.profiles;"
```

Expect `com_prazo = 26`, `sem_prazo_erro = 0`, and `prazo` exactly 30 days
out. **If `sem_prazo_erro` is not 0, stop and do not send** — someone would
receive a notice with no deadline behind it.

## Step 3 — Pull the mailing list

```sh
psql "$SUPABASE_DB_URL" -f packages/db/queries/courtesy-grant-notice.sql
```

Read-only. Gives one row per recipient with `name`, `email`, `days_left`,
`prazo`, and `o_que_muda` — the last one derived from `plans.ts`, so the
email cannot promise a limit the site then contradicts.

Send to the `email` column. Publicly visible and featured profiles sort
first: they are the ones whose listing visibly changes.

---

## Step 4 — The email

Draft below. Substitute per recipient from the query output. Nothing sends
automatically, and nothing in the codebase sends it — this is a manual send.

> **Subject:** Your MasseurMatch plan changes on {prazo}
>
> Hi {name},
>
> Your profile is currently on our **{tier_atual}** plan. That plan was
> applied to your account by us — you have never been charged for it, and
> there is no subscription attached.
>
> We are tidying this up. On **{prazo}** ({days_left} days from today), your
> profile moves to the Free plan unless you choose to subscribe.
>
> **What changes for you:** {o_que_muda}
>
> Nothing changes before that date, and nothing you have uploaded is
> deleted — photos above the Free limit are simply not shown until you are
> back over the limit.
>
> If you want to keep what you have, the plans are Standard $39, Pro $79 and
> Elite $129 per month. You can subscribe from your dashboard.
>
> If you would rather stay on Free, you do not need to do anything.
>
> Sorry for the confusion this may have caused — the plan on your account
> was our doing, not a mistake on your side.

Two things to check before sending, because both are easy to get wrong and
both damage trust in the one message where trust matters most:

- **The photo numbers must match `plans.ts`** (3 / 6 / 9 / 12). `o_que_muda`
  already does this; do not retype the numbers by hand.
- **`prazo` must be the value from the query**, not a date typed from
  memory. `resolveTier()` reads that exact column, so a mismatch means the
  site disagrees with the email you sent.

---

## What happens after the deadline

Nothing runs. `resolveTier()` in `packages/db/tier-grants.ts` compares the
deadline to the current time **on every read**, so a lapsed grant becomes
`free` the moment it lapses. There is no cron to fail, and no backfill to
forget.

Where that resolved tier is already honoured: photo upload limits, the
dashboard Plan card, the subscription page, Visibility Spike allowance, and
directory ranking.

`is_featured` is **not** touched. It is an independent admin flag, and 9 of
the 26 have it. Decide separately whether those stay featured — winding down
a tier is not the same decision as removing a hand-picked placement.
