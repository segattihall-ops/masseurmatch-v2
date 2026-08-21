# Edit Profile — standalone prototype

A working recreation of the MasseurMatch **Edit Profile** page in plain
HTML, CSS and JavaScript. No build step, no dependencies, no framework:
open `index.html` in a browser and it runs.

```bash
open prototypes/edit-profile/index.html
# or, to serve it:
npx http-server prototypes/edit-profile
```

This is a **design and interaction prototype**, deliberately outside the
Next.js apps. It does not import `@masseurmatch/ui`, does not talk to
Supabase and is not routed anywhere — saving logs a structured JSON payload
to the console instead of calling an API. It exists to settle the shape of
the editor before any of it is ported into `apps/dashboard`.

| File         | What is in it                                                    |
| ------------ | ---------------------------------------------------------------- |
| `index.html` | Page structure: hero, section nav, six collapsible sections      |
| `styles.css` | One token block driving light and dark, then layout + components |
| `app.js`     | Reference data, validation, autosave, undo/redo, preview         |

## The six sections

1. **About you** — display name, headline, tagline, bio, height, weight, body type
2. **Location & contact** — ZIP, city, state, neighbourhood, intersection, in/out-call
   toggles, out-call radius, phone, WhatsApp, email + visibility, links
3. **Services** — 24 techniques, setup, out-call extras, 12 studio amenities,
   products, additional services
4. **Rates & payments** — 6 × 2 session pricing table, discounts, payment methods
5. **Schedule** — per-day studio hours, availability toggles, booking lead time
6. **Credentials** — years of experience, training, school, languages

## How it works

The form is the single source of truth. Every change takes a flat snapshot of
it, and **everything else is derived from that snapshot** in one pass:
progress, per-section status, the collapsed one-line summaries, tab error
counts, the preview and the saved draft. There is no second copy of the state
to drift out of sync.

- **Validation** — nine required fields plus format rules for email, phone,
  ZIP, URLs, years of experience and session rates. A field's error only
  appears once you have touched it or tried to save, so the page is not red
  before you have typed anything. Submitting with errors lists them at the
  top, each one a link that expands the right section and focuses the field.
- **Progress** — a section counts as complete when its required fields are
  valid; for the three sections that have no required fields, when it has
  real content (a technique, a rate, a day's hours). So `6/6` means the
  profile is genuinely publishable, not that the page rendered.
- **Autosave** — every 30 seconds when the form is dirty, into
  `localStorage`, restored on the next visit. Every read and write is inside
  a `try`/`catch`: private windows and blocked site data throw on access, and
  the page has to keep working when they do.
- **Undo/redo** — debounced snapshots, `Ctrl+Z` / `Ctrl+Shift+Z`, 60 deep.
- **Preview** — assembles the client-facing listing from the current form so
  you can see the effect of a change without leaving the editor.

## Learnability

The brief asked for the editing experience to be easy to pick up, so the page
leans on a few things beyond the field list:

- Section headers carry a **one-line summary** of what is inside them
  (`Bruno · Therapeutic Massage · Athletic`), so collapsed sections still
  tell you something.
- The progress hint always names **the next thing to do**, not just a count.
- The 24-technique list has a **filter box**; every checkbox group shows
  `n of m selected` and a clear button.
- Repetitive work has one-click helpers: copy the in-call column to out-call,
  apply Monday's hours to every day, close the weekend, mark a day closed.
- Conditional fields say **why** they appeared (`Shown because out-call is on`)
  rather than silently materialising.
- Hints under fields explain the consequence of the setting, not the mechanics
  of the input.

## Keyboard

`Ctrl+S` save · `Ctrl+Z` / `Ctrl+Shift+Z` undo, redo · `Ctrl+P` preview ·
`?` shortcuts · `Esc` close. Section headers are real buttons, so the whole
page is reachable by `Tab`.

## Responsive

Three breakpoints, verified with no horizontal overflow at 320, 375, 768,
1024, 1280 and 1440 px:

| Width       | Layout                                                        |
| ----------- | ------------------------------------------------------------- |
| 1200 px+    | 3-column field grid, 3-column checkbox grid, all six tabs fit |
| 768–1199 px | 2 columns                                                     |
| < 768 px    | Single column, tabs scroll horizontally, full-width actions   |

Dark mode follows `prefers-color-scheme` on first visit and is togglable.
`prefers-reduced-motion` neutralises every transition and animation.

## Two deliberate deviations from the brief

- **51 entries in the state dropdown.** The brief says 50 states; DC is a
  real market for this directory, so it is in the list.
- **Fields are prefilled from `SAMPLE` in `app.js`, not from the HTML.**
  One copy of the demo data, which "Reset to sample data" also restores.
  It does mean the form needs JavaScript to populate — fine for a prototype,
  and something to revisit if any of this is ported to a server-rendered page.

Sample data is illustrative. The rates, schedule and studio details are
invented; the email is the account this prototype was built under.
