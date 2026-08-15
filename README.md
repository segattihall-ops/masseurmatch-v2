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

`src/types.generated.ts` is generated output. Regenerate with:

```bash
SUPABASE_PROJECT_ID=<project-ref> pnpm --filter @masseurmatch/db generate
# or, against a local stack:
pnpm --filter @masseurmatch/db generate:local
```

The committed version is the empty scaffold produced before any schema exists
in this repository; regenerating overwrites it cleanly.

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
