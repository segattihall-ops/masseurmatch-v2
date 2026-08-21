# MasseurMatch Admin

Standalone administrative application for MasseurMatch.

## Deployment

- Vercel Root Directory: `apps/admin`
- Local development: `pnpm --filter @masseurmatch/admin dev`
- Local port: `3002`
- The application is intentionally `noindex`.

## Required runtime configuration

Use the same Supabase project as the MasseurMatch platform and configure the Admin Vercel project with the environment variables required by `@masseurmatch/db` and the optional Cloudflare Turnstile variables used by the sign-in flow. Never copy secret values into this repository.

## Routing

Canonical standalone routes are flat, for example `/`, `/people`, `/moderation`, `/photos`, `/verifications`, `/profile-reports`, `/reports`, `/tickets`, `/audit-log`, and `/demand-radar`.

The validated Admin pages remain internally mounted below `/admin/*` during the extraction and are exposed through Next.js rewrites. Legacy `/admin/*` requests redirect to the flat canonical paths.
