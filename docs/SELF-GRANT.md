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

**Why it has not been applied:** the old application is still live against this
same database and writes to `profiles` as `authenticated` too. Revoking a column
this repository does not use may be revoking one the old site does, and the
failure would land on real therapists mid-edit rather than in CI. Nothing here
can tell which columns those are — that needs either the old codebase or a
window where breaking it is acceptable.

So it is written down, in full, with the exact commands to verify and to fix,
rather than applied at a moment when it cannot be tested.

## Verifying it yourself

```sql
-- as a therapist's own JWT, against their own row
update public.profiles set is_verified_identity = true where id = auth.uid();
```

A row count of 1 means it is still open.
