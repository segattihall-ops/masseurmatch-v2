# MasseurMatch

Monorepo for the MasseurMatch platform: a premium directory of verified male
massage therapists.

## Layout

```
apps/
  web/          Public site — directory, profiles, marketing        (port 3000)
  dashboard/    Therapist + admin dashboard                         (port 3001)
packages/
  ui/           Design system: tokens, base components, motion wrappers
  db/           Generated Supabase types and typed helpers
```

Built with pnpm workspaces + Turborepo, Next.js 14 (App Router), TypeScript in
`strict` mode, Tailwind CSS, ESLint and Prettier.

## Getting started

Requires Node 20+ and pnpm 10 (`corepack enable`).

```bash
pnpm install
cp .env.example apps/web/.env.local        # then fill in real values
cp .env.example apps/dashboard/.env.local
pnpm dev
```

| Command          | What it does                                 |
| ---------------- | -------------------------------------------- |
| `pnpm dev`       | Runs both apps in watch mode                 |
| `pnpm build`     | Production build of both apps                |
| `pnpm lint`      | ESLint across every workspace, zero warnings |
| `pnpm typecheck` | `tsc --noEmit` across every workspace        |
| `pnpm format`    | Rewrites files with Prettier                 |

To run a single workspace: `pnpm --filter @masseurmatch/web dev`.

## Design system — `packages/ui`

The visual identity is carried over from the previous site (an adaptation of
the Agencee template) and is **not** to be redesigned. Everything derives from
one set of tokens:

> **Source of the identity.** Values were read from
> [`X-RANKFLOW-MEDIA-GROUP/masseurmatch`](https://github.com/X-RANKFLOW-MEDIA-GROUP/masseurmatch)
> — `tailwind.config.ts` for structure and `src/index.css` for the literal
> values, since that config resolves every colour through CSS variables. That
> repository is read-only reference: no file was copied from it except the
> Satoshi binary.

- **`src/tokens.ts`** — the source of truth: palette, spacing, type scale,
  radii, shadows, easing curves.
- **`src/styles/tokens.css`** — the same values as CSS custom properties, plus
  the `premium-surface` / `premium-shimmer` / `motion-premium` treatments.
- **`src/tailwind/preset.ts`** — the Tailwind preset each app extends; colours
  resolve through the CSS variables so one change propagates everywhere.

Identity at a glance: Satoshi (variable, 300–900) on white, near-black
`#111111` text, deep wine `#8B1E2D` for every primary action, `0.16, 1, 0.3, 1`
as the house easing curve.

Base components: `Button`, `Card`, `Input`, `Avatar` — all server-safe, no
client boundary.

### Consuming it

The package is consumed as TypeScript source (`transpilePackages`), so there is
no build step. In an app's root layout:

```tsx
import { MotionProvider } from "@masseurmatch/ui";
import "@masseurmatch/ui/styles.css"; // tokens first…
import "./globals.css"; // …then Tailwind, so utilities win
```

And in `tailwind.config.ts`:

```ts
import preset from "@masseurmatch/ui/tailwind-preset";

export default {
  presets: [preset],
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
};
```

### Fonts

Satoshi lives once at `packages/ui/fonts/Satoshi-Variable.woff2` and is loaded
by each app through `next/font/local` (`apps/*/src/app/fonts.ts`), exposing
`--font-satoshi` — which every font token references.

## Motion

`framer-motion` is a dependency of `packages/ui` only. Variants live in one
place, `packages/ui/src/motion.ts`, which imports **types only** and therefore
stays importable from server components. The runtime is confined to wrappers
that each declare their own `"use client"`:

| Wrapper                       | Use                                       |
| ----------------------------- | ----------------------------------------- |
| `MotionProvider`              | Mount once per app in the root layout     |
| `FadeIn`                      | Entrance fade, optionally on scroll       |
| `StaggerList` / `StaggerItem` | Sequenced list reveals                    |
| `PageTransition`              | Route-level transition                    |
| `Presence` / `PresenceItem`   | `AnimatePresence` helpers with exit anims |
| `AnimatePresence`             | Re-exported behind the client boundary    |

`MotionProvider` configures `LazyMotion` with `domAnimation` and `strict`, so
wrappers use the lightweight `m.*` components and only the DOM animation
feature set ships. Because the boundaries live inside the wrappers, a server
component can render `<FadeIn>` directly without becoming a client component —
see `apps/web/src/app/page.tsx`.

**Reduced motion** is honoured twice over: `MotionConfig reducedMotion="user"`
drops transforms globally, each wrapper additionally zeroes its offsets and
durations via `useReducedMotion()`, and the CSS treatments are neutralised
under a `prefers-reduced-motion: reduce` media query.

## Database types — `packages/db`

Types only, no runtime dependency on `@supabase/supabase-js`, so each app
creates its own client:

```ts
import { createClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@masseurmatch/db";

const supabase = createClient<Database>(url, anonKey);
```

`types.ts` is `supabase gen types typescript` output for the `public` schema —
118 tables, 6 views and 55 RPC functions, regenerated against production on
2026-08-16. It is committed verbatim and excluded from Prettier, so regenerating
never fails the format check. Regenerate with:

```bash
SUPABASE_PROJECT_ID=<project-ref> pnpm db:types
# or, against a local stack:
pnpm --filter @masseurmatch/db db:types:local
```

`index.ts` re-exports the generated `Tables` / `TablesInsert` /
`TablesUpdate` / `Enums` helpers (which understand the `{ schema: … }` option
form) and adds `TableName`, `ViewName`, `FunctionName`, `FunctionArgs` and
`FunctionReturns` on top.

## Environment and secrets

- `.env.example` documents every variable **by name only** and is the one env
  file that is tracked. All other `.env*` files are gitignored.
- Real values go in `apps/*/.env.local`, never in the repo.
- Anything prefixed `NEXT_PUBLIC_` is inlined into the browser bundle — never
  put a secret behind that prefix.

## CI

`.github/workflows/ci.yml` runs on every pull request:

- `lint`, `typecheck` and `build` as a parallel matrix
- `format` — Prettier check
- `secret-scan` — fails on a tracked `.env` file, on `.env.example` gaining
  values, or on credential-shaped strings in tracked files
  (`scripts/scan-secrets.sh`, runnable locally)

They roll up into a single `ci` job. **Point branch protection on `main` at the
`ci` check and enable "Require status checks to pass before merging"** — that
is a repository setting, not something the workflow file can enforce on its
own.

## Deploying

This is a monorepo with two Next.js apps. Vercel's framework detection looks
for `next` in the `package.json` of whatever directory it builds from, so a
project pointed at the repo root fails before it builds:

```
Error: No Next.js version detected.
```

**The preferred fix is a project setting**, not a repo change: set each Vercel
project's **Root Directory** to the app it deploys.

| Vercel project | Root Directory   |
| -------------- | ---------------- |
| public site    | `apps/web`       |
| dashboard      | `apps/dashboard` |

Root Directory can only be set in the dashboard (Settings → General) or at
project-creation time — `vercel.json` has no field for it.

### There is deliberately no `vercel.json`

With the Root Directory set correctly, everything auto-detects and no config
file is needed: Vercel finds `next` in the app's own `package.json`, installs
the workspace from the repo-root `pnpm-lock.yaml`, runs `next build`, and picks
up `.next` from the app directory.

Do **not** try to solve a Root Directory problem with a `vercel.json` at the
repo root. Vercel resolves `vercel.json` _relative to the Root Directory_, so a
root file is ignored once the setting is correct — and while the setting is
wrong, a root file written for the repo-root layout (an `outputDirectory` of
`apps/web/.next`, say) resolves to `apps/web/apps/web/.next` the moment the
setting is fixed, turning one broken build into another. This was tried and
reverted; configure the deployment through project settings instead.

Leave **"Include files outside the Root Directory"** enabled — the apps consume
`packages/*` as source via `transpilePackages`, and neither package has a build
step of its own. Without it the build fails resolving `@masseurmatch/ui` and
`@masseurmatch/db`.

Each app needs its own Vercel project: the dashboard requires a second one with
Root Directory `apps/dashboard`.

### Environment variables to set on the project

| Variable                            | Where      | If unset                                                                   |
| ----------------------------------- | ---------- | -------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`          | all envs   | Directory renders empty — no cities, no profiles, no sitemap entries       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`     | all envs   | Same as above                                                              |
| `NEXT_PUBLIC_SITE_URL`              | production | Falls back to `VERCEL_PROJECT_PRODUCTION_URL`, then `VERCEL_URL`           |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | all envs   | Images bypass Cloudinary — originals served, no `f_auto` / `q_auto` / `w_` |

Both Supabase values are safe in every environment: the anon key is public by
design and ships in the browser bundle regardless. A build without them still
succeeds — `packages/db` logs a warning and the site renders as a shell.

`NEXT_PUBLIC_SITE_URL` is the one worth being deliberate about. It drives every
canonical, OpenGraph URL and sitemap entry, and **Lighthouse does not validate
the canonical host** — so a wrong value scores SEO 100 while publishing a
sitemap search engines cannot use. `apps/web/src/lib/site.ts` falls back to
Vercel's own variables so a missing setting degrades to the deployment origin
rather than `localhost`, but set it explicitly for the real domain.
