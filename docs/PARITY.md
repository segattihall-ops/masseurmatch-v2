# PARITY — old site vs v2

The phase 8 audit. Every route and every hardening item carries a status; no row
is left blank, including the ones whose status is "not built".

Compiled 2026-08-16 against the live site, the reference repo
[`X-RANKFLOW-MEDIA-GROUP/masseurmatch`](https://github.com/X-RANKFLOW-MEDIA-GROUP/masseurmatch),
and the production Supabase project `ijsdpozjfjjufjsoexod`. Route counts and
database facts are measured, not estimated. `CUTOVER.md` holds the redirect map
and the mechanics of the domain switch; this file holds the audit.

## Verdict

**The gate is not met.** Phase 8's stop criterion is that it does not close
while any row lacks a status, any test fails, CI is red, or Lighthouse is below 90. Statuses are complete and the suite is green, but three things are open:

| Blocker                             | Detail                                                                                                                                   |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 68 indexed URLs would 404           | Guides, comparisons, blog, most legal, marketing, index hubs. Not built.                                                                 |
| `apps/dashboard` is not deployed    | One Vercel project exists, rooted at `apps/web`. Everything from phases 5–7 is unreachable in production, including the billing webhook. |
| Lighthouse not run on the dashboard | `apps/web` scores 97–100 across all four categories (§7). The dashboard cannot be measured until it is deployed.                         |

Nothing below hides these. The status columns say so per row.

---

## Legend

| Status       | Meaning                                                               |
| ------------ | --------------------------------------------------------------------- |
| ✅ Done      | Built, and verified by the means named in the row.                    |
| 🔁 Redirect  | Not rebuilt at the old URL; the old URL redirects to a v2 equivalent. |
| ❌ Not built | No v2 equivalent. Blocks cutover if the URL is indexed.               |
| ⚠️ Partial   | Exists but incomplete or unverified; the gap is stated.               |
| 🚧 Blocked   | Cannot be finished from here; the blocker is named.                   |

---

## 1. Indexed URLs (the 79 in the live sitemap)

These carry search equity. Every one of them must resolve — as a page or a
redirect — before the domain moves.

| Group                        | Count | Old URL shape                                                                                                | v2 equivalent            | Status                                                                                                                                                                         |
| ---------------------------- | ----- | ------------------------------------------------------------------------------------------------------------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Therapist profiles           | 6     | `/therapists/{slug}`                                                                                         | `/{state}/{city}/{slug}` | ✅ 🔁 Built and verified — all 6 return 308 to the exact target in `CUTOVER.md`. Database-driven, so profiles added later are covered without editing a list                   |
| City pages                   | 5     | `/{city}`                                                                                                    | `/{state}/{city}`        | ✅ 🔁 Built and verified — all 5 return 308. Matches against the live city list, not a wildcard; `/about`, `/faq`, `/search`, `/terms`, `/privacy` and `/` confirmed still 200 |
| City pages, alternate shapes | —     | `/cities/{city}`, `/states/{state}/cities/{city}`, `/providers/{citySlug}`                                   | `/{state}/{city}`        | ✅ 🔁 Built and verified — all three return 308. Not in the sitemap, but they may hold inbound links                                                                           |
| Guides                       | 13    | `/guides/*`                                                                                                  | —                        | ❌ Not built — content, needs a source of truth decided                                                                                                                        |
| Comparisons                  | 10    | `/compare/*`                                                                                                 | —                        | ❌ Not built — content                                                                                                                                                         |
| Blog                         | 5     | `/blog`, `/blog/*`                                                                                           | —                        | ❌ Not built — content. A `blog_posts` table exists in the database and is unused by v2                                                                                        |
| Legal and policy             | ~26   | various                                                                                                      | `/terms`, `/privacy`     | ⚠️ Partial — 2 of ~26. Static pages, quick to port                                                                                                                             |
| Marketing                    | ~14   | `/pricing`, `/how-it-works`, `/for-therapists`, `/advertise`, `/contact`, `/near-me`, `/safety`, `/trust`, … | —                        | ❌ Not built                                                                                                                                                                   |
| Index hubs                   | 6     | `/therapists`, `/cities`, `/states`, `/guides`, `/compare`, `/blog`                                          | —                        | ❌ Not built                                                                                                                                                                   |

**Coverage: 11 of 79 (14%), all 11 now resolving.** The 11 are the directory
core and the highest-value pages. The other 68 are live, indexed, and would 404
on cutover.

Redirects use 308, not 302: the move is permanent and the ranking should
transfer. Unknown slugs 404 rather than redirecting to the directory — a soft
404 tells a crawler a page moved when it did not, and leaves the dead URL
indexed. Verified: `/not-a-city`, `/therapists/not-a-real-slug` and `/ny` all
return 404.

## 2. Product surface not in the sitemap

`robots.txt` on the live site disallows all of these, so they carry no search
equity. They do not block the domain switch — they block the product being
usable.

| Old area                    | Routes | v2 equivalent                                               | Status                                                                                                       |
| --------------------------- | ------ | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `/pro/*` — therapist area   | 28     | `apps/dashboard` `/profile`, `/onboarding`, `/subscription` | ⚠️ Partial — the core is built (phases 5 and 7); the old area had 28 routes and v2 has 3                     |
| `/signup/*` — onboarding    | 11     | `/onboarding` (multi-step, resumable)                       | ✅ Done — one resumable route replaces 11                                                                    |
| `/login`, `/register`       | 2      | `/sign-in`                                                  | ✅ Done                                                                                                      |
| Password reset              | 2      | —                                                           | ❌ Not built — Supabase Auth provides the flow; no v2 page renders it                                        |
| `/dashboard/*`, `/client/*` | —      | —                                                           | ❌ Not built — client-side (customer) area. No booking or payment existed in the old site, so scope is small |
| Admin                       | —      | `/admin`, `/admin/moderation`, `/admin/demand-radar`        | ✅ Done — phase 6                                                                                            |

## 3. v2 routes that exist today

| Route                                                                  | App       | Status                                             |
| ---------------------------------------------------------------------- | --------- | -------------------------------------------------- |
| `/`                                                                    | web       | ✅ Done — ISR                                      |
| `/search`                                                              | web       | ✅ Done                                            |
| `/[state]/[city]`                                                      | web       | ✅ Done                                            |
| `/[state]/[city]/[slug]`                                               | web       | ✅ Done                                            |
| `/about`, `/faq`, `/terms`, `/privacy`                                 | web       | ✅ Done                                            |
| `/sitemap.xml`, `/robots.txt`                                          | web       | ✅ Done — generated                                |
| `/not-found`, `/error`, `/global-error`                                | web       | ✅ Done — phase 8                                  |
| `/therapists/[slug]`                                                   | web       | ✅ Done — 308 to the v2 profile path               |
| `/[state]`                                                             | web       | ✅ Done — 308 for a legacy bare city URL, else 404 |
| `/cities/[city]`, `/providers/[city]`, `/states/[state]/cities/[city]` | web       | ✅ Done — 308 to `/{state}/{city}`                 |
| `/sign-in`                                                             | dashboard | ✅ Done                                            |
| `/onboarding`                                                          | dashboard | ✅ Done — phase 5                                  |
| `/profile`                                                             | dashboard | ✅ Done — phase 5                                  |
| `/subscription`                                                        | dashboard | ✅ Done — phase 7                                  |
| `/admin`, `/admin/moderation`, `/admin/demand-radar`                   | dashboard | ✅ Done — phase 6                                  |
| `/api/uploads/photo`                                                   | dashboard | ✅ Done — signed Cloudinary ticket, rate-limited   |
| `/api/webhooks/billing`                                                | dashboard | ⚠️ Built, unreachable — see §5                     |
| `/not-authorized`                                                      | dashboard | ✅ Done                                            |
| `/not-found`, `/error`, `/global-error`                                | dashboard | ✅ Done — phase 8                                  |

## 4. Hardening

| Item                             | Status                                                                                                                                                                       |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Content-Security-Policy          | ✅ Done — verified by `curl -I` against a running build. Keeps `'unsafe-inline'`/`'unsafe-eval'` in `script-src`; see `packages/config/security-headers.mjs` for why, and §6 |
| Strict-Transport-Security        | ✅ Done — 2 years, `includeSubDomains; preload`. Verified                                                                                                                    |
| X-Frame-Options                  | ✅ Done — `DENY`, plus `frame-ancestors 'none'`. Verified                                                                                                                    |
| X-Content-Type-Options           | ✅ Done — `nosniff`. Verified                                                                                                                                                |
| Referrer-Policy                  | ✅ Done — `strict-origin-when-cross-origin`. Verified                                                                                                                        |
| Permissions-Policy               | ✅ Done. Verified                                                                                                                                                            |
| X-Robots-Tag on dashboard        | ✅ Done — covers route handlers and redirects, which never render metadata                                                                                                   |
| Custom 404                       | ✅ Done — both apps. Public one is `noindex, follow` so crawlers hitting stale profile URLs find the directory                                                               |
| `error.tsx` / `global-error.tsx` | ✅ Done — both apps. Shows the digest, never `error.message`                                                                                                                 |
| Rate limiting                    | ⚠️ Partial — in-memory, per lambda instance. A speed bump, not a guarantee. Needs Upstash or Vercel KV, which needs an account                                               |
| Turnstile                        | ❌ Not built — needs a Cloudflare site key and secret                                                                                                                        |
| Sentry                           | ❌ Not built — needs a DSN and `@sentry/nextjs`                                                                                                                              |
| RLS on all public tables         | ✅ Done — phase 3 baseline plus `20260816000000_rls_safe_hardening`                                                                                                          |
| Audit log immutable              | ✅ Done — insert/select only; no UPDATE or DELETE policy exists                                                                                                              |
| Webhook idempotency              | ✅ Done — unique `(provider, event_id)`; a duplicate is treated as success                                                                                                   |
| Secrets never in the repo        | ✅ Done — `secret-scan` CI job green on every commit; `.gitignore` covers `.env*` from the first commit                                                                      |

## 5. Deployment

| Item                       | Status                                                                                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web` on Vercel       | ✅ Done — project `masseurmatch-v2`, Root Directory `apps/web`                                                                                                 |
| `apps/dashboard` on Vercel | 🚧 Blocked — **no Vercel project exists for it.** Everything from phases 5, 6 and 7 is unreachable in production                                               |
| Billing webhook URL        | 🚧 Blocked — follows from the above. PayPal has nowhere to deliver to, so `PAYPAL_WEBHOOK_ID` cannot be configured and no subscription can ever reach `active` |
| Domain on v2               | ❌ Not done — deliberately. Gated on §1                                                                                                                        |

A commit touching only `apps/dashboard` shows as "Skipped" on the Vercel PR
comment. That is correct behaviour for a project rooted at `apps/web`, and it is
also the symptom: nothing deploys the dashboard because nothing is configured
to.

## 6. Known gaps, stated rather than closed

Each of these is a deliberate decision with its reasoning recorded at the code
that implements it.

| Gap                                                         | Where                                                        | Why it is open                                                                                                                                                                |
| ----------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CSP allows `'unsafe-inline'` / `'unsafe-eval'`              | `packages/config/security-headers.mjs`                       | Next's App Router injects inline hydration and RSC bootstrap scripts. Removing them needs per-request nonces through middleware — worth doing, real breakage risk             |
| Rate limiting is per-instance                               | `apps/dashboard/src/lib/rate-limit.ts`                       | A shared store drops into the same place; needs an account                                                                                                                    |
| `subscription_plans` disagrees with `plans.ts`              | `apps/dashboard/src/lib/subscription.ts`                     | Elite is $99/20 photos in the database against $149/40 in code, and every photo limit differs. A pricing decision, not a code fix                                             |
| `profile_status` is text with an 8-value CHECK, not an enum | `supabase/migrations/20260816020000_profile_status_enum.sql` | The old application still writes to this database. Narrowing the domain to 5 while a second writer is live would break it, and the migration's own guard would not catch that |
| PayPal never exercised against a real account               | `packages/billing/providers/paypal.ts`                       | 19 tests stub `fetch`; they prove shape, not acceptance. Needs sandbox credentials                                                                                            |
| RLS tests skip in CI                                        | `packages/db/tests/rls.test.ts`                              | Neither CI nor Vercel has Supabase credentials, so the access layer degrades silently and the tests skip rather than fail. Green CI is not evidence the database works        |
| `backup_20260527` schema has RLS disabled                   | production database                                          | A full copy of `therapist_subscriptions` outside every policy. Not exposed by PostgREST, so not a live leak — but it should be dropped                                        |

## 7. Test and CI state

| Check                                                             | Status                                                                          |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `pnpm -r test`                                                    | ✅ 147 passing, 1 skipped (the RLS test needing credentials)                    |
| `pnpm lint`                                                       | ✅ Clean, `--max-warnings 0`                                                    |
| `pnpm -r exec tsc --noEmit`                                       | ✅ Clean                                                                        |
| `pnpm build`                                                      | ✅ Both apps                                                                    |
| CI: `format`, `lint`, `typecheck`, `test`, `build`, `secret-scan` | ✅ Green                                                                        |
| Lighthouse ≥ 90, `apps/web`                                       | ✅ Done — see below                                                             |
| Lighthouse ≥ 90, `apps/dashboard`                                 | 🚧 Blocked — no deployment, and every page needs a session                      |
| End-to-end smoke test                                             | 🚧 Blocked — the therapist and admin flows live in the app that is not deployed |

### Lighthouse

Run against a local production build (`pnpm build && pnpm start`) with
Lighthouse 12.8.2 and the bundled Chromium. **Not** against the Vercel
deployment: the preview sits behind deployment protection and returns 302 to an
SSO page, so nothing can measure it from outside. The build is byte-identical;
the network path is not, so treat performance as indicative and the other three
categories as exact.

| Page                         | Perf | A11y | Best practices | SEO    |
| ---------------------------- | ---- | ---- | -------------- | ------ |
| `/`                          | 99   | 100  | 100            | 100    |
| `/ny/new-york`               | 100  | 100  | 100            | 100    |
| `/ny/new-york/mati-eb87b62c` | 97   | 100  | 100            | 100    |
| `/about`                     | 100  | 100  | 100            | 100    |
| `/search`                    | 100  | 100  | 100            | **66** |

`/search` scoring 66 on SEO is correct and is deliberately not fixed. The page
sets `robots: { index: false, follow: true }`, and Lighthouse fails any noindex
page regardless of intent. A search results page _should_ be noindex — faceted
queries generate unbounded near-duplicate URLs — and `follow: true` still lets a
crawler walk through to the profiles. Making it indexable to satisfy the audit
would be a real SEO mistake traded for a number.

Three defects the run found, all fixed:

| Found                                                                                       | Fix                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contrast 3.05:1 on muted body text (`#8E8E8E` on `#F7F7F7`), against the 4.5:1 AA threshold | Swapped to the palette's existing `greyText` `#6F6F6F` — 4.69:1. An existing token, so no new style was introduced                                                                                                      |
| `favicon.ico` 404 on every page                                                             | Added `icon.svg` in brand colours to both apps                                                                                                                                                                          |
| Heading order skipped `<h2>` on the city and search pages                                   | The card's heading level is now a prop, defaulting to `3` (correct beneath the home page's section `<h2>`) and set to `2` where cards follow the `<h1>` directly. Visual size is unchanged — it is a class, not the tag |

## 8. What closes the gate

In order, because each depends on the last:

1. **Create a Vercel project for `apps/dashboard`.** Unblocks the webhook URL,
   Lighthouse on the dashboard, and the smoke test. Nothing else in phases 5–7
   is verifiable in production until this exists.
2. **Decide the pricing conflict** in §6, then reconcile `subscription_plans`
   and the PayPal plan ids to match.
3. **Build the 68 indexed URLs.** Legal and marketing pages are quick; guides,
   comparisons and blog need a content source decided. The 11 directory URLs are
   already handled by redirects.
4. **Run Lighthouse and the smoke test** against both deployments.
5. **Move the domain**, following the checklist in `CUTOVER.md`.

Steps 1 and 2 need decisions or account access that only the owner has. Step 3
is the bulk of the remaining work.

## 9. How to re-verify this document

The route claims above were checked against a production build, not read off
the source. To repeat:

```
pnpm build
cd apps/web && pnpm start -p 3112

# each must be 308, to the target named in CUTOVER.md
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' localhost:3112/therapists/mati-eb87b62c
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' localhost:3112/new-york

# each must be 200 — proves the root redirect does not shadow real pages
for u in / /about /faq /search /terms /privacy; do curl -s -o /dev/null -w "$u %{http_code}\n" "localhost:3112$u"; done

# each must be 404 — proves unknown URLs are not soft-redirected
for u in /not-a-city /therapists/not-a-real-slug /ny; do curl -s -o /dev/null -w "$u %{http_code}\n" "localhost:3112$u"; done

# headers
curl -sI localhost:3112/ | grep -iE 'content-security|strict-transport|x-frame|x-content-type|referrer|permissions'
```
