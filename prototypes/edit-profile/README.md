# Edit Profile — provider listing editor

A working build of the MasseurMatch **Edit Profile** page in plain HTML, CSS
and JavaScript. No build step, no dependencies, no framework: open
`index.html` and it runs.

```bash
open prototypes/edit-profile/index.html
# or, to serve it:
npx http-server prototypes/edit-profile
```

## What it is

The field list, option lists and limits follow the editor the provider
actually uses today at `/pro/listing` — 70 headline presets, 51 techniques,
25 products, repeatable session pricing with the 60-minute rule, structured
hour ranges, education records, and the rest.

It deliberately sits outside the Next.js apps: no `@masseurmatch/ui` import,
no Supabase, not routed anywhere. Saving logs the structured PATCH payload to
the console instead of calling the API. The point is to settle the shape of
the editor — and to have somewhere to fix the known defects — before any of it
is ported into `apps/dashboard`. Today `/pro/listing` re-exports
`app/profile/page.tsx`, an eleven-field form; this is the full editor.

| File         | What is in it                                                |
| ------------ | ------------------------------------------------------------ |
| `index.html` | Hero, section nav, six collapsible sections                  |
| `styles.css` | Design-system tokens, then layout and components             |
| `app.js`     | Option lists, validation, repeatable rows, autosave, preview |

## Colours and type come from `packages/ui`

Nothing here is a new visual decision. The first block of `styles.css` is
lifted from the design system — `tokens.css` for the custom properties,
`tailwind/preset.ts` for the radii and shadow names, and the `Button` /
`Input` / `Card` components for the field and surface geometry:

- **Satoshi**, loaded by `@font-face` straight from
  `packages/ui/fonts/Satoshi-Variable.woff2`, weights 300–900. Not copied.
- **Wine `#8B1E2D`** for every primary action, hovering to `#6E1521` and
  `#5A1019`; **`#111111`** ink on **`#F7F7F7`**; `--gradient-brand`
  (ink → wine) for the header.
- Input is 48px tall with `rounded-xl` (20px) and the inset white highlight;
  Button md is 40px with `rounded-lg`; Card is `rounded-3xl` with
  `--shadow-card`. Focus rings are the 3px wine halo.

One alias block maps those tokens onto the names the components use, and that
block is the map a port back into `apps/dashboard` would follow.

`--color-text-muted` (`#8E8E8E`) is deliberately **unused**. `tokens.ts`
documents it as large-text only — 3.28:1 on white — and every hint and caption
here is 12–13px, so all three text roles stop at `--color-text-secondary` and
hierarchy comes from size and weight instead of a third, failing grey.

## Live-editor defects, flagged in place

Your walkthrough of `/pro/listing` turned up five problems. Each field is
built the correct way here, with an amber notice next to it saying what
production does instead:

| Field               | What production does                                                                                     | Here                                                      |
| ------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Street intersection | Renders both fields, never sends them in the PATCH                                                       | Joined into `street_reference`, with a live readout       |
| Available now       | PATCH accepts `availableNow`, never sets `updates.available_now`                                         | Written to `available_now`                                |
| Current status      | Shows labels the `current_status` constraint rejects; reads `visibility_status`, writes `current_status` | Two separate fields, each with its own valid set          |
| Bio                 | Only written when the new value has text, so it cannot be cleared                                        | An emptied bio is an explicit empty string in the payload |
| Studio amenities    | Fills `studio_amenities`; the older `incall_amenities` column is left behind                             | Noted on the field                                        |

`service_categories` and `specialties` have no controls of their own in
either build — they are derived from the techniques (specialties take the
first twelve), and the derived value is shown so it is not a surprise.

## How it works

The form is the single source of truth. Every change takes a flat snapshot,
and **everything else is derived from it in one pass**: progress, per-section
status, the collapsed summaries, tab error counts, the preview and the saved
draft. Repeatable rows are the one exception — they live in a small array so
that adding or removing a row never has to read half-typed values back out of
the DOM — and they are folded into the same snapshot.

- **Three fields block a save**: display name, city and phone, the same three
  the provider API insists on. Everything else is validated for shape —
  email, ZIP, URLs, height in inches, weight in pounds, years of experience —
  and counts towards a section being complete rather than towards saving.
- **The 60-minute rule** is enforced live: once an hour is priced, every other
  length is capped at a third above its proportional share, and the message
  names the ceiling (`In-call tops out at $240 for 90 min, based on your $120
hour`).
- **Progress** counts a section complete when its required fields are valid
  _and_ it has real content, so `6/6` means publishable rather than rendered.
- **Autosave** every 30s when dirty, into `localStorage`, restored next visit.
  Every read and write is inside a `try`/`catch`: private windows and blocked
  site data throw on access and the page has to keep working when they do.
- **Undo/redo** covers repeatable rows too — 60 debounced snapshots.
- **Reset** asks for a second click on the button rather than calling
  `window.confirm`, which a sandboxed frame blocks outright.

## Making it easy to pick up

- Collapsed section headers summarise their contents (`Bruno · Therapeutic
Massage · Athletic`), so a folded section still tells you something.
- The progress hint names the next thing to do, not just a count.
- Height and weight show their conversions live (`6′ 8″ · 203 cm`, `79 kg`)
  so the unit the database wants is never in doubt.
- The headline composition (`Therapeutic Massage by Bruno`) is shown as you
  pick it, because that is the string clients actually read.
- Long lists are filterable — 51 techniques, 25 products — and every checkbox
  group shows `n of m selected` with a clear button.
- Conditional fields say why they appeared (`Shown because out-call is on`).
- ZIP fills city, state and neighbourhood. The table behind it is a local
  stub with eight ZIPs standing in for the real geo lookup.

## Keyboard

`Ctrl+S` save · `Ctrl+Z` / `Ctrl+Shift+Z` undo, redo · `Ctrl+P` preview ·
`?` shortcuts · `Esc` close. Section headers are real buttons, so the whole
page is reachable by `Tab`.

## Theming

The dashboard ships light only, so the light palette is the system's and the
dark one is **derived, not invented**: surfaces are the ink scale behind the
dashboard sidebar (`--sidebar-background` is `0 0% 7%`, its border `0 0% 20%`),
and every other value is mixed from an identity colour towards white until it
clears AA on that ground — wine itself is only 2.6:1 on `#111111`.

Both palettes are defined as tokens in three places: `:root`,
`[data-theme="dark"]`, and a `prefers-color-scheme: dark` block for the viewer
who has made no explicit choice and has nothing stamped on the root. Each
palette also sets `color-scheme`, so scrollbars and `<select>` popups follow
the theme instead of staying light. Components only read tokens, so all three
states resolve from the stylesheet before any JavaScript runs.

`prefers-reduced-motion` neutralises every transition and animation.

## Responsive

Verified with no horizontal overflow at 320, 375, 768, 1024, 1280 and 1440px:
three columns above 1200px, two between 768 and 1199, one below — where the
section tabs scroll horizontally and the actions go full width.

## Verification

Driven in Chromium with Playwright: **99 behaviour checks** covering the
option-list counts against the spec, validation, conditional fields,
counters, unit conversions, the ZIP lookup, all four repeaters, the
60-minute rule, undo/redo across a row add, the autosave round-trip, submit
(both paths), the payload shape, preview, dark mode and overflow — plus **10
theme checks** run with the stylesheet acting alone.

Sample data is illustrative: the rates, schedule and studio details are
invented.
