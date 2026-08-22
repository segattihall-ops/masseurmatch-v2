# MasseurMatch Admin

Standalone administrative application for MasseurMatch.

## Deployment

- Vercel Root Directory: `apps/admin`
- Local development: `pnpm --filter @masseurmatch/admin dev`
- Local port: `3002`
- Production host: `admin.masseurmatch.com`
- The application is intentionally `noindex`.
- Keep the legacy Dashboard Admin route until the standalone production deployment has passed the operational smoke test.

## Runtime configuration

Use the same Supabase project as the rest of MasseurMatch. The standalone Admin needs:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional feature-gated configuration:

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` for sign-in bot protection.
- `STRIPE_IDENTITY_RESTRICTED_KEY` (preferred) or `STRIPE_SECRET_KEY` to refresh the status of legacy Stripe Identity VerificationSessions created by the OLD application. The Stripe key is server-only and must never use a `NEXT_PUBLIC_` prefix.

Never copy secret values into this repository.

## Routing

Canonical standalone routes are flat, for example `/`, `/people`, `/moderation`, `/photos`, `/verifications`, `/profile-reports`, `/reports`, `/tickets`, `/audit-log`, and `/demand-radar`.

The validated Admin pages remain internally mounted below `/admin/*` during the extraction and are exposed through Next.js rewrites. Legacy `/admin/*` requests redirect to the flat canonical paths.
