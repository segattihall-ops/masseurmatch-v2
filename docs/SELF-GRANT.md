# A therapist can publish their own listing, and grant themselves anything

**Status: confirmed against production on 2026-08-18. Live now. Not introduced
by this repository — the policy is part of the baseline the old application
brought with it.**

This was written down as "someone should check" while verifying it needed a
therapist login. It has now been checked directly against the database, and the
answer is worse than the question assumed.

## What was measured

Three facts, each read from the production project:

**1. The update policy pins ownership and nothing else.**

```sql
select policyname, cmd, with_check from pg_policies
where schemaname='public' and tablename='profiles' and cmd='UPDATE';
```

```
profiles_update_canonical | UPDATE |
  ((id = auth.uid()) OR (user_id = auth.uid()) OR is_admin()
   OR ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'))
```

The `WITH CHECK` is the same expression as the `USING` clause. It answers "is
this your row" and asks nothing about _which columns_ changed.

**2. `authenticated` holds UPDATE on every column.**

```sql
select grantee, privilege_type, count(*) from information_schema.column_privileges
where table_schema='public' and table_name='profiles'
  and grantee in ('anon','authenticated') group by 1,2;
```

```
anon          | SELECT | 182
authenticated | INSERT | 182
authenticated | SELECT | 182
authenticated | UPDATE | 182   <-- all of them
```

Column grants are the check that would otherwise save this — they are consulted
_before_ RLS, which is why an over-broad policy elsewhere in this schema is
harmless. Here there is no such backstop.

**3. Public visibility is decided by two of those columns.**

```
profiles_select_canonical | SELECT |
  ((profile_status = 'approved' AND visibility_status = 'public'
    AND COALESCE(is_suspended,false) = false
    AND COALESCE(is_banned,false) = false) OR ...)
```

## What that adds up to

Any signed-in therapist, with one request to the REST API and no bug in any
application code:

| `PATCH /rest/v1/profiles?id=eq.<self>`                         | Effect                                                                                                                                              |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{"profile_status":"approved","visibility_status":"public"}`   | **Listing goes live with no moderation.** This is the serious one — the FOSTA-SESTA review the moderation queue exists to perform is simply skipped |
| `{"is_verified_identity":true,"is_verified_phone":true}`       | Verification badges, with no document and no phone                                                                                                  |
| `{"subscription_tier":"elite","subscription_status":"active"}` | Elite entitlements without paying — `resolveTier()` reads exactly these                                                                             |
| `{"is_featured":true}`                                         | Featured placement in the directory                                                                                                                 |
| `{"photo_limit":99}`                                           | Past the tier's photo allowance                                                                                                                     |

The dashboard never offers any of this, and that is not the point: the dashboard
is not what stands between a user and their own row. `curl` is enough.

## Why no application change fixes it

Everything in `apps/dashboard` that writes a badge already goes through the
service client precisely so the honest path runs after the proof. That is still
right, and it is still worth nothing here — the attacker does not use the
application. The fix has to be in the database.

## The fix, and the reason it is not applied here

Two changes, and they must go together:

1. **Stop `authenticated` writing the columns that decide money, publication and
   trust.** Revoke UPDATE on `profiles` and re-grant it only on the content
   columns a therapist edits:

   `display_name, full_name, headline, bio, city, state, phone, email,
service_categories, additional_services, incall_price, outcall_price,
starting_price, avatar_url, photo_url, travel_schedule, available_now,
available_now_expires, updated_at`

2. **Move this app's two remaining privileged writes to the service client.**
   `submitForReview` sets `profile_status='pending'` and `visibility_status`
   hidden, and the re-review path in `profile/actions.ts` sets
   `moderation_status`, `moderation_notes` and `reviewed_at`. Both are
   legitimate, both are inside a server action that has already authorised the
   caller, and neither needs the therapist's own permission to happen. Without
   this step, change 1 breaks submitting for review.

### Blast radius — measured, not assumed

The first version of this document said the fix could not be applied because the
old site is live against the same database and might write these columns as
`authenticated`. That was the right worry and the wrong conclusion: the old
repository is readable, so it was read.

`X-RANKFLOW-MEDIA-GROUP/masseurmatch` writes `profiles` in **46 places, and
every one of them uses the service-role client** — the whole API surface goes
through `createSupabaseAdminClient()`. There is exactly one browser-side write
path, `useProfile().updateProfile`, and **nothing calls it**: the single
component that imports that hook destructures `{ profile, loading }` and stops
there. (The three other `updateProfile` call sites in that repo belong to
`useSignup()`, a local form-state context, not to this hook.)

So revoking `authenticated`'s UPDATE takes nothing away from any write either
application actually makes. Change 2 has landed in this repo already —
`updateModerationState` in `apps/dashboard/src/lib/profile.ts` — and change 1 is
`supabase/migrations/20260818060000_profiles_column_grants.sql`, ready to apply.

**It is still not applied**, for one reason only: applying it is a production
change to a database serving two live applications, and that is the operator's
call to make with their eyes open, not a side effect of a code review. The
migration is written, reviewed and verifiable; running it is one command.

## Verifying it yourself

```sql
-- as a therapist's own JWT, against their own row
update public.profiles set is_verified_identity = true where id = auth.uid();
```

A row count of 1 means it is still open.
