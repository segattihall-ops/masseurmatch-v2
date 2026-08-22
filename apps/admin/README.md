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

Identity verification is manual only. Therapists submit their government ID and selfie through the provider dashboard into `identity_verifications` with `provider = manual`; an authorized Admin approves or rejects the submission. Historical records from retired providers remain in Supabase only for audit/history and are never used as an active verification workflow.

Legacy professional credentials in `profile_documents` are a separate trust signal and can never grant or remove the identity badge.

Never copy secret values into this repository.

## Routing

Canonical standalone routes are flat, for example `/`, `/people`, `/moderation`, `/photos`, `/verifications`, `/profile-reports`, `/reports`, `/tickets`, `/audit-log`, and `/demand-radar`.

The validated Admin pages remain internally mounted below `/admin/*` during the extraction and are exposed through Next.js rewrites. Legacy `/admin/*` requests redirect to the flat canonical paths.
