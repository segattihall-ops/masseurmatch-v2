# Roadmap

Where each phase stands, and what the remaining specs say. Updated 2026-08-16.

## Status

| Phase                               | State                                              |
| ----------------------------------- | -------------------------------------------------- |
| 1 — Monorepo, design system, motion | ✅ done                                            |
| 2 — Generated Supabase types        | ✅ done, regenerated against production            |
| 3 — RLS, access layer, ranking      | ✅ done; migrations written, **not applied**       |
| 4 — Public site                     | ✅ done; Lighthouse 99/99/94 perf, 100 SEO         |
| Auth                                | ✅ done — was never specced, see below             |
| 5 — Therapist dashboard             | ✅ built; two acceptance items need credentials    |
| 6 — Admin                           | ✅ built; four acceptance tests need the migration |
| 7 — Billing                         | ⬜ not started                                     |
| 8 — Parity audit and go-live gate   | ⬜ not started                                     |

### What exists

| Area               | State                                                                         |
| ------------------ | ----------------------------------------------------------------------------- |
| `packages/ui`      | Tokens, `Button` / `Card` / `Input` / `Avatar`, motion wrappers               |
| `packages/db`      | Types, clients, auth + middleware, directory layer, profile status, RLS tools |
| `apps/web`         | Home, city, profile, search, 4 static pages                                   |
| `apps/dashboard`   | Sign-in, onboarding, profile, subscription, `/admin` × 3, upload API          |
| `packages/billing` | Does not exist — phase 7                                                      |

### Auth was never specced

Phases 5 and 6 both referred to "the auth from phase 2". No such phase ran —
phase 2 generated Supabase types. Auth was built as part of phase 5 rather than
blocking on a spec, using Supabase Auth, which the schema already assumed:
`user_roles`, `is_admin()` and `profiles.user_id → auth.uid()` all pre-existed.

Sessions are cookie-based via `@supabase/ssr`. Authorisation lives in
`apps/dashboard/src/lib/guards.ts`, called inside each protected layout — not in
middleware, whose matcher is a denylist by shape and fails open when a path is
missed.

## Acceptance items still open

These need credentials or an applied migration, not code.

**Phase 5**

- End-to-end Cloudinary upload — needs `CLOUDINARY_API_KEY` / `_SECRET`. The
  signing algorithm is tested against an independently recomputed SHA-1, and the
  folder-scoping guards are covered; a real round trip is not.
- "Edited profile reflects on the public site after revalidation" — needs a real
  therapist login. `revalidatePath` is wired but unobserved.

**Phase 6**

- Moderation without a reason is rejected — enforced server-side, not executed
  against the database.
- Approving writes an audit entry — same.
- `UPDATE` / `DELETE` on `audit_log` fails by RLS — needs
  `20260816030000_audit_log_and_moderation.sql` applied.
- A `therapist` is redirected from `/admin` — needs two real accounts.

## Migrations written, none applied

| File                                        | Contents                                                                                             | Recommendation                                |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `20260816010000_fix_is_admin_execute_grant` | Restores `EXECUTE` on `is_admin()`, hardens it                                                       | Apply — prevents a repeat outage              |
| `20260816000000_rls_safe_hardening`         | Drops `keyword_trends` `USING (true)`, sets `security_invoker`, revokes `moderation_queue` from anon | Apply — closes real gaps                      |
| `20260816030000_audit_log_and_moderation`   | `audit_log` policies, atomic `moderate_profile()` RPC                                                | Apply — phase 6 depends on it                 |
| `20260816020000_profile_status_enum`        | `profile_status` text → enum                                                                         | Consider the `CHECK` alternative inside it    |
| `20260815000000_rls_baseline`               | Deny-all backstop, legacy policy cleanup                                                             | Defer — enforces rules against untested flows |

Run each against a Supabase branch first. `POLICIES.md` has the reasoning.

---

## Phase 7 — Billing (spec as received)

Create `packages/billing` with a provider abstraction — **no code outside this
package imports a processor SDK**.

- **`PaymentProvider`** — `createSubscription(therapistId, plan)`,
  `cancelSubscription(subscriptionId)`, `updatePlan(subscriptionId, newPlan)`,
  `handleWebhook(payload, signature)`.
- **Plans** — standard $39, pro $79, elite $149 monthly, in
  `packages/billing/plans.ts` as the single source of truth.
- **Adapters** — `AuthorizeNetProvider` (primary, ARB, HMAC webhook signature);
  `PayPalProvider` (secondary, Subscriptions API). Active provider chosen by
  `BILLING_PROVIDER`.
- **Webhooks** — one handler at `/api/webhooks/billing` delegating to the active
  provider. Idempotent by `event_id`. Events: payment approved, payment failed,
  cancellation, expiry. Payment failure starts a 7-day grace period before
  unpublishing; cancellation unpublishes at the end of the paid cycle.
- **Integration** — wire the phase 5 subscription page: subscribe, change plan,
  cancel. Per-plan limits read from `plans.ts`.

Tests: each webhook event updates status; duplicates do not; an invalid
signature returns 401 without processing; changing `BILLING_PROVIDER` needs no
change elsewhere.

Acceptance: Authorize.Net sandbox completes a real subscription cycle; no SDK
import outside `packages/billing`; clean build; green CI.

> **Note for this phase.** `photoLimitFor()` in
> `apps/dashboard/src/lib/cloudinary.ts` currently holds the per-tier photo
> limits. Phase 7 should move those into `plans.ts` and have that function read
> from it, so there is one source of truth rather than two.

## Phase 8 — Parity audit and go-live gate (spec as received)

A completeness audit: nothing from the old repo may be dropped without an
explicit decision.

- **`PARITY.md`** at the root — every old route and page, its new equivalent,
  and a status (ported / improved / dropped with reason). No row without a
  status. Implement anything missing before closing the phase. Compare profile
  fields, search filters, transactional emails, and existing SEO redirects.
- **Hardening** — rate limiting on signup and login; Turnstile captcha on
  signup; Sentry in both apps with source maps; CSP, HSTS, X-Frame-Options;
  custom 404 and `error.tsx` in the house style.
- **Full suite** — every test, lint, typecheck, build. Production Lighthouse on
  home, city and profile, all >90 performance and SEO on mobile. End-to-end
  smoke test: signup → onboarding → moderation → approval → live profile →
  sandbox subscription → cancellation.

**Stop criterion:** does not close while any `PARITY.md` row lacks a status, any
test fails, CI is red, or Lighthouse is below 90.

> **`docs/CUTOVER.md` already contains a measured slice of this**, built from
> the live sitemap rather than the repo: 161 old routes, 120 public, 79 indexed
> URLs, of which v2 covers 11. It holds the exact redirect map for the 6 indexed
> profiles and 5 indexed cities, and the two traps in the city redirect rules.
> `PARITY.md` should extend it rather than restart, and should reconcile the two
> counts — routes in the repo versus URLs actually indexed — since they answer
> different questions.

## Execution order

7, then 8. Phase 8 is the gate and must be last. After it is green: deploy with
the new env vars, point the domain (see `CUTOVER.md`), keep the old repo
archived as reference, and watch Sentry as the first real traffic arrives.
