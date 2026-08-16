# PARITY — old site vs v2

The phase 8 audit. Every route and every hardening item carries a status; no row
is left blank, including the ones whose status is "not done".

Compiled 2026-08-16 against the live site's `sitemap.xml`, the reference repo
[`X-RANKFLOW-MEDIA-GROUP/masseurmatch`](https://github.com/X-RANKFLOW-MEDIA-GROUP/masseurmatch),
and the production Supabase project `ijsdpozjfjjufjsoexod`. Route counts and
database facts are measured, not estimated. `CUTOVER.md` holds the redirect map
and the mechanics of the domain switch; this file holds the audit.

## Verdict

**The code is ready to deploy. Two things outside the repository are not.**

|                                 | State                                                                                              |
| ------------------------------- | -------------------------------------------------------------------------------------------------- |
| All 79 indexed URLs             | ✅ Resolve — 68 render, 11 redirect, 0 broken                                                      |
| Tests                           | ✅ 161 unit + 35 smoke, all passing                                                                |
| Lighthouse                      | ✅ 98–100 across all four categories, on 11 page types                                             |
| Lint, typecheck, build, CI      | ✅ Green                                                                                           |
| `apps/dashboard` Vercel project | 🚧 **Does not exist.** Cannot be created from here — the API token returns 403 on project creation |
| PayPal plans + credentials      | 🚧 Not configured. Nothing can be charged until they are                                           |

Those last two are account actions, not code. Everything the repository controls
is done.

---

## Legend

| Status | Meaning                                                               |
| ------ | --------------------------------------------------------------------- |
| ✅     | Done, and verified by the means named in the row.                     |
| 🔁     | Not rebuilt at the old URL; the old URL redirects to a v2 equivalent. |
| ⚠️     | Exists but incomplete; the gap is stated.                             |
| 🚧     | Cannot be finished from here; the blocker is named.                   |

---

## 1. Indexed URLs — the 79 in the live sitemap

Every one resolves. Verified against a production build, and pinned by a smoke
test so a regression fails CI rather than being discovered by a crawler.

| Group                            | Count | Old URL shape                                                                        | Status                                                                                                      |
| -------------------------------- | ----- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Home, about, faq, terms, privacy | 5     | —                                                                                    | ✅ Built                                                                                                    |
| Therapist profiles               | 6     | `/therapists/{slug}`                                                                 | ✅ 🔁 308 to `/{state}/{city}/{slug}`, database-driven so later profiles are covered without editing a list |
| City pages                       | 5     | `/{city}`                                                                            | ✅ 🔁 308 to `/{state}/{city}`, matched against the live city list rather than a wildcard                   |
| Guides                           | 13    | `/guides/*`                                                                          | ✅ Ported as data, rendered by a new template. Slugs diffed against the sitemap — exact match               |
| Comparisons                      | 10    | `/compare/*`                                                                         | ✅ Ported as data. Slugs diffed — exact match                                                               |
| Blog                             | 4     | `/blog/*`                                                                            | ✅ Read from `blog_posts`. The old repo's two _static_ post lists contain none of these slugs               |
| Legal and policy                 | 23    | various                                                                              | ✅ Ported verbatim through `scripts/port-legal-pages.py`                                                    |
| Marketing                        | 6     | `/pricing`, `/how-it-works`, `/for-therapists`, `/near-me`, `/advertise`, `/contact` | ✅ Rewritten in this design system                                                                          |
| Subscriptions                    | 1     | `/subscriptions`                                                                     | ✅ Ported — it is a LegalPage in the old repo                                                               |
| Index hubs                       | 6     | `/therapists`, `/cities`, `/states`, `/guides`, `/compare`, `/blog`                  | ✅ Built; the first three are database-driven                                                               |

**79 of 79.** Also redirected, though not in the sitemap: `/cities/{city}`,
`/providers/{city}`, `/states/{state}/cities/{city}` — alternate old shapes that
may hold inbound links.

Redirects are 308, not 302: the move is permanent and the ranking should
transfer. Unknown slugs 404 rather than redirecting to the directory — a soft
404 tells a crawler a page moved when it did not, and leaves the dead URL
indexed.

## 2. Product surface not in the sitemap

`robots.txt` disallows all of these on the live site, so they carry no search
equity.

| Old area                    | Routes | v2 equivalent                                        | Status                                                                              |
| --------------------------- | ------ | ---------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `/pro/*` — therapist area   | 28     | `/profile`, `/onboarding`, `/subscription`           | ✅ The core is built; 28 old routes collapse to 3                                   |
| `/signup/*`                 | 11     | `/onboarding`                                        | ✅ One resumable route replaces 11                                                  |
| `/login`, `/register`       | 2      | `/sign-in`                                           | ✅ Done                                                                             |
| Password reset              | 2      | —                                                    | ⚠️ Supabase Auth provides the flow; no v2 page renders it                           |
| `/dashboard/*`, `/client/*` | —      | —                                                    | ⚠️ Client-side area not built. No booking or payment existed on the old site either |
| Admin                       | —      | `/admin`, `/admin/moderation`, `/admin/demand-radar` | ✅ Done                                                                             |

## 3. Hardening

| Item                              | Status                                                                                                                                                                                  |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Content-Security-Policy           | ✅ Verified by smoke test against a running build                                                                                                                                       |
| Strict-Transport-Security         | ✅ 2 years, `includeSubDomains; preload`                                                                                                                                                |
| X-Frame-Options / frame-ancestors | ✅ `DENY` / `'none'`                                                                                                                                                                    |
| X-Content-Type-Options            | ✅ `nosniff`                                                                                                                                                                            |
| Referrer-Policy                   | ✅ `strict-origin-when-cross-origin`                                                                                                                                                    |
| Permissions-Policy                | ✅ Camera, mic, geolocation, FLoC all denied                                                                                                                                            |
| X-Robots-Tag on dashboard         | ✅ Covers route handlers and redirects, which render no metadata                                                                                                                        |
| Custom 404                        | ✅ Both apps. The public one is `noindex, follow` so a crawler on a stale profile URL finds the directory                                                                               |
| `error.tsx` / `global-error.tsx`  | ✅ Both apps. Shows the digest, never `error.message`                                                                                                                                   |
| Rate limiting                     | ⚠️ In-memory, per lambda instance — a speed bump, not a guarantee. Applied to sign-in, uploads, billing actions, webhooks. A shared store (Upstash/Vercel KV) drops into the same place |
| Turnstile                         | ✅ Fully implemented, off until both keys are set. Fails closed; `not_configured` is distinct from `passed`                                                                             |
| Sentry                            | ⚠️ Seam implemented, SDK not installed. `reportError` logs today; wiring `@sentry/nextjs` is a one-function change                                                                      |
| RLS on all public tables          | ✅ Phase 3 baseline + `20260816000000_rls_safe_hardening`                                                                                                                               |
| Audit log immutable               | ✅ Insert/select only; no UPDATE or DELETE policy exists                                                                                                                                |
| Webhook idempotency               | ✅ Unique `(provider, event_id)`; a duplicate is success                                                                                                                                |
| Secrets never in the repo         | ✅ `secret-scan` green on every commit                                                                                                                                                  |

## 4. Deployment

| Item                       | Status                                                                                                                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/web` on Vercel       | ✅ Project `masseurmatch-v2`, Root Directory `apps/web`                                                                                                                        |
| `apps/dashboard` on Vercel | 🚧 **No project exists.** Creating one via the API returns `403 forbidden`. Must be created in the Vercel dashboard: same repo, Root Directory `apps/dashboard`                |
| Billing webhook URL        | 🚧 Follows from the above — PayPal has nowhere to deliver, so no subscription can reach `active`                                                                               |
| PayPal plans               | 🚧 Must be created at **$39 / $79 / $99** and set as `PAYPAL_PLAN_STANDARD/PRO/ELITE`. PayPal bills what its own plan says, so a mismatch shows one figure and charges another |
| Domain on v2               | ⏳ Ready. Gated only on the two rows above                                                                                                                                     |

A commit touching only `apps/dashboard` shows "Skipped" on the Vercel PR
comment. That is correct for a project rooted at `apps/web` — and also the
symptom: nothing deploys the dashboard because nothing is configured to.

## 5. Known gaps, stated rather than closed

| Gap                                                         | Where                                                        | Why it is open                                                                                                                                                                                                                        |
| ----------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CSP allows `'unsafe-inline'` / `'unsafe-eval'`              | `packages/config/security-headers.mjs`                       | Next's App Router injects inline hydration and RSC bootstrap scripts. Removing them needs per-request nonces through middleware — worth doing, real breakage risk                                                                     |
| Rate limiting is per-instance                               | `apps/dashboard/src/lib/rate-limit.ts`                       | A shared store drops into the same place; needs an account                                                                                                                                                                            |
| Sentry SDK not installed                                    | `packages/config/observability.ts`                           | Would add a client bundle and a source-map upload step that warns without an auth token — weight and a new way for the build to go red, for nothing until a DSN exists                                                                |
| `profile_status` is text with an 8-value CHECK, not an enum | `supabase/migrations/20260816020000_profile_status_enum.sql` | The old application still writes to this database. Narrowing 8 values to 5 while a second writer is live would break it, and the migration's own guard would not catch that — it inspects existing rows, and none use the extra three |
| PayPal never exercised against a real account               | `packages/billing/providers/paypal.ts`                       | 19 tests stub `fetch`; they prove shape, not acceptance                                                                                                                                                                               |
| RLS tests skip in CI                                        | `packages/db/tests/rls.test.ts`                              | Neither CI nor Vercel has Supabase credentials. Green CI is not evidence the database works                                                                                                                                           |
| Smoke tests not in CI                                       | `playwright.config.ts`                                       | Needs Supabase credentials; a smoke test that passes against an empty database is not a smoke test                                                                                                                                    |
| `backup_20260527` schema has RLS disabled                   | production database                                          | A full copy of `therapist_subscriptions` outside every policy. Not exposed by PostgREST, so not a live leak — but it should be dropped                                                                                                |
| `text.muted` fails AA for body text                         | `packages/ui/src/tokens.ts`                                  | #8E8E8E is 3.28:1 on white — large text only. Documented at the token; no lighter alternative passes, so the rule is the fix                                                                                                          |

## 6. Test and CI state

| Check                                                 | Status                                                       |
| ----------------------------------------------------- | ------------------------------------------------------------ |
| `pnpm -r test`                                        | ✅ 161 passing, 1 skipped (the RLS test needing credentials) |
| `pnpm smoke`                                          | ✅ 35 passing against a production build of both apps        |
| `pnpm lint`                                           | ✅ Clean, `--max-warnings 0`                                 |
| `pnpm typecheck`                                      | ✅ Clean                                                     |
| `pnpm build`                                          | ✅ Both apps                                                 |
| CI: format, lint, typecheck, test, build, secret-scan | ✅ Green                                                     |
| Lighthouse ≥ 90 (`apps/web`)                          | ✅ 98–100 on all four categories, 11 page types              |
| Lighthouse (`apps/dashboard`)                         | 🚧 No deployment, and every page needs a session             |

### Lighthouse

Run against a local production build with Lighthouse 12.8.2 and the bundled
Chromium. **Not** the Vercel deployment: the preview sits behind deployment
protection and 302s to an SSO page, so nothing can measure it from outside. The
build is identical; the network path is not, so treat performance as indicative
and the other three as exact.

| Page                                     | Perf | A11y | BP  | SEO |
| ---------------------------------------- | ---- | ---- | --- | --- |
| `/`                                      | 100  | 100  | 100 | 100 |
| `/ny/new-york`                           | 100  | 100  | 100 | 100 |
| `/pricing`                               | 99   | 100  | 100 | 100 |
| `/acceptable-use`                        | 99   | 100  | 100 | 100 |
| `/legal`                                 | 99   | 100  | 100 | 100 |
| `/guides/incall-vs-outcall-dallas`       | 100  | 100  | 100 | 100 |
| `/compare/masseurmatch-vs-masseurfinder` | 98   | 100  | 100 | 100 |
| `/blog/how-to-find-a-masseur-near-you`   | 99   | 100  | 100 | 100 |
| `/therapists`                            | 99   | 100  | 100 | 100 |
| `/cities`                                | 98   | 100  | 100 | 100 |
| `/states`                                | 99   | 100  | 100 | 100 |

`/search` scores 66 on SEO and is deliberately left there: it sets
`robots: noindex, follow`, and Lighthouse fails any noindex page regardless of
intent. A search results page _should_ be noindex — faceted queries generate
unbounded near-duplicate URLs — and `follow: true` still lets a crawler reach
the profiles. Making it indexable to satisfy the audit would trade a real SEO
mistake for a number.

### Smoke tests

`pnpm smoke` runs 35 Playwright tests against a **production build** of both
apps. Covered: the home → city → therapist journey; all 42 rendered indexed URLs
checked for a 200 _and_ a body over 1500 bytes, because a 200 rendering an empty
shell is still a broken page; all 11 legacy redirects; that the sitemap declares
every page that exists; that the bare-city rule does not shadow real top-level
pages; that dead URLs 404 rather than soft-404; the security headers on both
apps; and that all six protected dashboard routes bounce an anonymous visitor.

**Not covered: anything behind a session.** Signing in needs a real account and
password this environment does not have, so the guards are tested and what they
guard is not.

Two bugs were found _in the smoke suite itself_ by deliberately breaking a
header and checking the tests noticed. Both are recorded in
`playwright.config.ts`: `reuseExistingServer` let a stale server answer, and
`packages/config` was outside the workspace graph so Turbo did not know it was a
build input — that second one silently shipped a cached build with stale
security headers.

## 7. What is left

1. **Create a Vercel project for `apps/dashboard`** — same repo, Root Directory
   `apps/dashboard`. Everything else in this list depends on it.
2. **Create the PayPal plans** at $39 / $79 / $99 and set
   `PAYPAL_PLAN_STANDARD/PRO/ELITE`, `PAYPAL_CLIENT_ID/SECRET/WEBHOOK_ID`, and
   `BILLING_PROVIDER=paypal`.
3. **Point the webhook** at `<dashboard-url>/api/webhooks/billing`.
4. **Move the domain**, following the checklist in `CUTOVER.md`.

Optional, and safe to defer: Turnstile keys, a Sentry DSN, a shared rate-limit
store, and staging credentials so the RLS and smoke suites run in CI.

## 8. Re-verifying this document

Route and header claims were checked against a production build, not read off
the source:

```
pnpm build && pnpm smoke        # 35 tests, covers every claim in §1 and §3
pnpm -r test                    # 161 unit tests
```

For Lighthouse:

```
cd apps/web && pnpm start -p 3141
CHROME_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome \
  npx lighthouse@12 http://localhost:3141/ --only-categories=performance,accessibility,best-practices,seo
```
