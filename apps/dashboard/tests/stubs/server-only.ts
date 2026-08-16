/**
 * Test stub for the `server-only` package.
 *
 * The real module throws on import unless the bundler applies React's
 * `react-server` export condition. Next.js applies it on the server, which is
 * what makes the guard work in the actual build; vitest does not, so importing
 * a `server-only` module in a unit test would fail for the wrong reason.
 *
 * This mirrors the package's own `empty.js` — an intentional no-op, not a
 * weakening of the guard.
 */
export {};
