# Cutover inventory — old site → v2

What has to be true before `www.masseurmatch.com` can point at `masseurmatch-v2`.

Compiled 2026-08-16 from the live site (`sitemap.xml`, `robots.txt`) and the
reference repo [`X-RANKFLOW-MEDIA-GROUP/masseurmatch`](https://github.com/X-RANKFLOW-MEDIA-GROUP/masseurmatch).
Everything below is measured, not estimated.

## Where the domain points today

```
www.masseurmatch.com  →  HTTP 200, server: Vercel      ← the OLD site, live
masseurmatch.com      →  HTTP 308 → www.masseurmatch.com
```

The apex redirects to `www`, confirming `www` is canonical — consistent with the
old repo's `src/lib/site.ts`, which forces `https://www.masseurmatch.com`
whenever `VERCEL_ENV === "production"`.

Cutover is a **domain reassignment between two Vercel projects**, not a DNS
change: DNS already points at Vercel, so it takes effect in seconds.

## Scale of the gap

| Measure                                    | Old    | v2  |
| ------------------------------------------ | ------ | --- |
| Route files (`page.tsx`)                   | 161    | 8   |
| Public routes (excluding `/admin`, `/api`) | 120    | 8   |
| **URLs in the live sitemap**               | **79** | 26  |

The 120 vs 8 comparison overstates the SEO problem and understates the product
one. `robots.txt` on the live site disallows `/pro/`, `/signup`, `/login`,
`/register`, `/forgot-password`, `/reset-password`, `/dashboard/` and `/client/`
— so the 28 `/pro/*` and 11 `/signup/*` routes carry **no search equity at all**.
They are product surface to rebuild, not URLs to preserve.

What actually needs preserving is the 79 indexed URLs.

## The indexed corpus, and what v2 covers

| Group                                                                                                            | Count | v2 status                                             |
| ---------------------------------------------------------------------------------------------------------------- | ----- | ----------------------------------------------------- |
| Therapist profiles (`/therapists/{slug}`)                                                                        | 6     | ✅ all 6 exist, need redirects                        |
| City pages (bare `/{city}`)                                                                                      | 5     | ✅ all 5 exist, need redirects                        |
| Guides (`/guides/*`)                                                                                             | 13    | ❌ not built                                          |
| Comparisons (`/compare/*`)                                                                                       | 10    | ❌ not built                                          |
| Blog (`/blog`, `/blog/*`)                                                                                        | 5     | ❌ not built                                          |
| Legal + policy pages                                                                                             | ~26   | ⚠️ 4 of ~26 (`terms`, `privacy`, plus `about`, `faq`) |
| Marketing (`pricing`, `how-it-works`, `for-therapists`, `advertise`, `contact`, `near-me`, `safety`, `trust`, …) | ~14   | ❌ not built                                          |
| Index pages (`/therapists`, `/cities`, `/states`, `/guides`, `/compare`, `/blog`)                                | 6     | ❌ not built                                          |

**v2 covers 11 of 79 indexed URLs (14%).** Those 11 are the directory core —
the highest-value pages — but the remaining 68 are live, indexed, and would
404 on cutover.

## Redirect map — exact

Every indexed directory URL resolves cleanly. Verified against the database:
all six profiles are `approved` + `public`, and all six targets are pages v2
actually builds.

### Profiles — `/therapists/{slug}` → `/{state}/{city}/{slug}`

| Old                                  | v2                                         |
| ------------------------------------ | ------------------------------------------ |
| `/therapists/mati-eb87b62c`          | `/ny/new-york/mati-eb87b62c`               |
| `/therapists/andrey-113174e9`        | `/ny/new-york/andrey-113174e9`             |
| `/therapists/christopher-457ced71`   | `/fl/aventura/christopher-457ced71`        |
| `/therapists/reggie-3ef08824`        | `/tx/humble/reggie-3ef08824`               |
| `/therapists/giovanni-san-francisco` | `/ca/san-francisco/giovanni-san-francisco` |
| `/therapists/vitor-228df922`         | `/in/indianapolis/vitor-228df922`          |

The old route resolves by the same `profiles.slug` column v2 uses, so this
mapping is **derivable from the database** rather than hand-maintained — the
rule is `state.toLowerCase()` + `citySlug(city)` + the unchanged slug. Generate
it at build time so profiles added later are covered automatically.

### Cities — `/{city}` → `/{state}/{city}`

| Old              | v2                  |
| ---------------- | ------------------- |
| `/new-york`      | `/ny/new-york`      |
| `/san-francisco` | `/ca/san-francisco` |
| `/aventura`      | `/fl/aventura`      |
| `/humble`        | `/tx/humble`        |
| `/indianapolis`  | `/in/indianapolis`  |

⚠️ The old site has **four** URL shapes for a city page — `/{city}`,
`/cities/{city}`, `/states/{state}/cities/{city}` and `/providers/{citySlug}`.
Only the bare form appears in the sitemap, but the others may hold inbound
links. Redirect all four onto v2's single `/{state}/{city}`.

⚠️ A bare `/{city}` route is a catch-all at the site root. Any redirect rule for
it must not shadow real top-level paths (`/about`, `/faq`, `/search`, …), so
match on a known-city list rather than a wildcard.

## What is missing, by whether it blocks cutover

**Blocks cutover — indexed pages that would 404 (68 URLs)**

- 13 guides, 10 comparisons, 5 blog — content pages, need a CMS or port
- ~26 legal and policy pages — v2 has 4
- ~14 marketing pages — pricing, how-it-works, for-therapists, contact, near-me
- 6 index/hub pages — `/therapists`, `/cities`, `/states`, and the group indexes

**Does not block cutover — no search equity, but the product needs them**

- `/pro/*` — 28 routes, the entire therapist-facing area (robots-disallowed)
- `/signup/*` — 11 routes, the onboarding flow (robots-disallowed)
- `/dashboard/*`, `/login`, `/register`, password reset (robots-disallowed)

That second group is why `apps/dashboard` exists as a scaffold. It is roughly
39 routes of work and none of it is visible to search engines.

## Suggested sequencing

Cutover needs three things, and they are separable:

1. **Redirects** — small, mechanical, database-driven for the 11 directory URLs.
   Can be built now; nothing blocks it.
2. **The missing indexed surface** — 68 URLs. Mostly content (guides, compare,
   blog) and static legal pages. The legal pages are quick; the content pages
   need a source of truth decided.
3. **The therapist-facing app** — `/pro/*` + `/signup/*`, ~39 routes. Invisible
   to search, but the site is not functionally complete without it: nobody can
   sign up or manage a listing.

Only (1) and (2) gate the domain switch. (3) gates the product being usable by
therapists, and overlaps heavily with what `apps/dashboard` was scoped to be —
worth resolving whether those are the same effort before starting either.

## Cutover checklist

Once the above is closed:

1. Move `www.masseurmatch.com` from the old Vercel project to `masseurmatch-v2`.
2. Set `NEXT_PUBLIC_SITE_URL=https://www.masseurmatch.com` on the v2 project.
3. Redeploy so the sitemap and canonicals regenerate against the real host.
4. Verify: `/therapists/{slug}` 301s to the v2 path; `sitemap.xml` lists the v2
   URLs; canonical tags carry `www.masseurmatch.com`.
5. Submit the new sitemap in Search Console and watch for 404 spikes.

Order matters in 1–3: set the env var **after** the domain moves, or v2 will
briefly serve the domain while still emitting the old canonical values.

**Do not set `NEXT_PUBLIC_SITE_URL` before cutover.** Until the domain moves,
that value would make v2 publish canonicals and a sitemap pointing at the old
site — every v2 page declaring a different site as authoritative. Leave it
unset; the fallback in `apps/web/src/lib/site.ts` resolves to
`VERCEL_PROJECT_PRODUCTION_URL`, which is self-consistent and harmless.
