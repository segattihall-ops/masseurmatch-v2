# Roadmap — phases 6, 7, 8

Specs as received 2026-08-16, with a dependency check against what is actually
built. **Phases 6–8 cannot start yet**; see "Blocked on" below.

## What exists today

| Area                          | State                                                                      |
| ----------------------------- | -------------------------------------------------------------------------- |
| `packages/ui`                 | ✅ tokens, `Button` / `Card` / `Input` / `Avatar`, motion wrappers         |
| `packages/db`                 | ✅ generated types, anon + service clients, directory layer, RLS tooling   |
| `apps/web`                    | ✅ home, city, profile, search, 4 static pages                             |
| `apps/dashboard`              | ⚠️ **scaffold only** — `layout.tsx`, `page.tsx`, `fonts.ts`, `globals.css` |
| Auth / sessions / role checks | ❌ **none** — no `middleware.ts`, no sign-in, no server-side role guard    |
| `packages/billing`            | ❌ does not exist                                                          |

Verified by inspection: the only occurrence of `is_admin` / `user_roles`
anywhere in the repo is inside `packages/db/types.ts`, i.e. generated type
definitions, not working code.

## Blocked on

**1. The phase 5 spec was not received.** The message delivering phases 6–8
said phase 5 was in the preceding message; it was not. Nothing describing the
therapist dashboard has arrived. Phase 6 depends on it directly — the
"sensitive-fields-changed flag (phase 5)" and phase 7's "subscription page from
phase 5" both refer to work that is neither specified nor built.

**2. Authentication does not exist.** Phase 6 requires "routes protected by
admin role verified on the server (phase 2)". No such phase was executed. The
phase 2 that ran generated Supabase types. There is no sign-in flow, no session
handling, no middleware, and no server-side role guard anywhere in the repo.

Without these, phase 6 has nothing to protect its admin routes with, and phase 7
has no subscription page to connect to.

## Phase numbering, reconciled

The numbering in the phase 6–8 specs does not match what was executed. Worth
settling before more phases reference it.

| Referenced as                                          | What actually ran                   | Match?                          |
| ------------------------------------------------------ | ----------------------------------- | ------------------------------- |
| Phase 1                                                | Monorepo, design system, motion     | ✅                              |
| Phase 2 — "admin role verified on the server"          | Supabase type generation            | ❌ **auth was never built**     |
| Phase 3 — "RLS: admin read"                            | RLS audit, policies, ranking, tests | ✅                              |
| Phase 4                                                | Public site                         | ✅ (not referenced)             |
| Phase 5 — "subscription page", "sensitive-fields flag" | _nothing_                           | ❌ **not specified, not built** |

Two phases of prerequisite work are missing, not one.

## The specs, as received

### Phase 6 — Admin

Context: `../masseurmatch-old` is read-only reference for the existing admin,
including `DemandRadarTab.jsx`. All new code in `apps/dashboard` under `/admin`,
routes protected by admin role verified on the server.

- **Moderation queue** — profiles with `pending` status, plus approved profiles
  whose sensitive fields changed. Actions: approve, reject, suspend, each
  requiring a mandatory reason. FOSTA-SESTA checklist per profile before
  approval: photos, description, services, external links. Exit animation on
  resolve via `AnimatePresence` from `packages/ui/motion`.
- **Audit log** — table `audit_log` (`id`, `admin_id`, `action`, `target_type`,
  `target_id`, `reason`, `created_at`). RLS: insert admin-only, select
  admin-only, **no UPDATE or DELETE policy** — immutable. Every moderation
  action writes to the log in the same transaction as the action.
- **Demand Radar** — port `DemandRadarTab.jsx` to TypeScript, `packages/ui`
  components, `keyword_trends` via server action. Preserve existing
  visualisations and filters.
- **Metrics** — cards for active, pending, rejected profiles, by city, and
  signups in the last 30 days.

Tests: moderation without a reason is rejected server-side; approving changes
status and writes an audit entry; UPDATE/DELETE on `audit_log` fails by RLS;
`therapist` role is redirected from `/admin`; Demand Radar renders with real
`keyword_trends` data.

Acceptance: all tests pass; immutability validated; Demand Radar at visual and
data parity with the old one; clean build; green CI.

### Phase 7 — Billing

Create `packages/billing` with a provider abstraction — **no code outside this
package imports a processor SDK**.

- **`PaymentProvider` interface** — `createSubscription(therapistId, plan)`,
  `cancelSubscription(subscriptionId)`, `updatePlan(subscriptionId, newPlan)`,
  `handleWebhook(payload, signature)`.
- **Plans** — standard $39, pro $79, elite $149 monthly, defined in
  `packages/billing/plans.ts` as the single source of truth.
- **Adapters** — `AuthorizeNetProvider` (primary, ARB for recurring, HMAC
  webhook signature verification); `PayPalProvider` (secondary, Subscriptions
  API, webhook signature verification). Active provider chosen by
  `BILLING_PROVIDER` env — switching is a one-line config change.
- **Webhooks** — single route handler `/api/webhooks/billing` delegating to the
  active provider. Idempotent: processed `event_id` recorded, duplicates ignored
  with no side effect. Events: payment approved, payment failed, cancellation,
  expiry — each updates the profile's `subscription_status`. Payment failure
  starts a 7-day grace period before unpublishing; cancellation unpublishes at
  the end of the paid cycle.
- **Integration** — the phase 5 subscription page wired up: subscribe, change
  plan, cancel. Per-plan limits (photos, featured) read from `plans.ts`.

Tests: simulated webhooks for each event update status correctly; duplicate
events do not change state; invalid signature returns 401 without processing;
changing `BILLING_PROVIDER` requires no change in any other package.

Acceptance: all tests pass; Authorize.Net sandbox completes a real end-to-end
subscription cycle; no SDK import outside `packages/billing`; clean build;
green CI.

### Phase 8 — Parity audit and go-live gate

This phase is a completeness audit: nothing from the old repo may be left out
without an explicit decision.

- **Parity inventory** — walk all of `../masseurmatch-old` and list every route
  and page: public site, therapist dashboard, admin, static pages, API routes.
  Generate `PARITY.md` at the root with three columns: old route/page, new
  equivalent, status (ported / improved / dropped with reason). **No row may be
  left without a status.** Implement anything marked missing before closing the
  phase. Also compare profile fields, search filters, transactional emails, and
  existing SEO redirects and rewrites.
- **Final hardening** — rate limiting on signup and login; Cloudflare Turnstile
  captcha on signup; Sentry in both apps with source maps; security headers
  (CSP, HSTS, X-Frame-Options); custom 404 and `error.tsx` in the house style.
- **Full suite** — all tests from all phases, lint, typecheck, build. Production
  Lighthouse on home, city, profile — all three >90 performance and SEO on
  mobile. End-to-end smoke test: signup → onboarding → moderation → approval →
  live profile → sandbox subscription → cancellation.

**Stop criterion: this phase does not close while any `PARITY.md` row lacks a
resolved status, any test fails, CI is red, or Lighthouse is below 90.** Fix and
re-run until green. Deliver `PARITY.md` and the full suite report.

## Execution order

6 and 7 in sequence, 8 last and mandatory — it is the gate. After phase 8 is
green, go-live is: deploy to Vercel with the new env vars, point the domain, and
keep the old repo archived as reference. First real traffic goes in with Sentry
open in a tab, because that is where the edge cases no suite catches show up.

## Note on phase 8 versus `CUTOVER.md`

`docs/CUTOVER.md` already contains a measured version of part of the phase 8
parity inventory, built from the live sitemap rather than the repo: 161 old
routes, 120 public, 79 indexed URLs, of which v2 covers 11. It also holds the
exact redirect map for the 6 indexed profiles and 5 indexed cities, and the two
traps in the city redirect rules. `PARITY.md` should build on it rather than
restart, and should reconcile the two counts — routes in the repo versus URLs
actually indexed — because they answer different questions.
