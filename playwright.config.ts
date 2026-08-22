import { defineConfig, devices } from "@playwright/test";

/**
 * Smoke tests.
 *
 * These run against a **production build** of both apps, started by Playwright
 * itself. Not `next dev`: dev mode has different error handling, no route
 * caching and no `headers()` output, so a dev-mode pass would not tell us
 * anything about what ships.
 *
 * Both servers need real Supabase credentials. Without them the directory is
 * empty and the therapist and city assertions fail — which is correct: a smoke
 * test that passes against an empty database is not a smoke test. `pnpm smoke`
 * loads `apps/web/.env.local`; CI has no credentials, so this suite is
 * deliberately not part of `pnpm test` and does not run there. `PARITY.md`
 * records that gap rather than hiding it behind a skip.
 */

const WEB = 3210;
const DASHBOARD = 3211;

export default defineConfig({
  testDir: "./tests/smoke",
  // Serial: both projects share two servers and one database.
  workers: 1,
  fullyParallel: false,
  // A failing smoke test is a real failure, not a flake to paper over.
  retries: 0,
  reporter: [["list"]],
  timeout: 30_000,
  expect: { timeout: 10_000 },

  use: {
    ...devices["Desktop Chrome"],
    baseURL: `http://localhost:${WEB}`,
    trace: "retain-on-failure",
    // The pre-installed browser. Never download one — the environment sets
    // PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD for the same reason.
    launchOptions: { executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" },
  },

  projects: [
    { name: "public", testMatch: /public\.spec\.ts/ },
    {
      name: "dashboard",
      testMatch: /dashboard\.spec\.ts/,
      use: { baseURL: `http://localhost:${DASHBOARD}` },
    },
    {
      name: "launch-critical",
      testMatch: /launch-critical\.spec\.ts/,
      use: { baseURL: `http://localhost:${WEB}` },
    },
  ],

  webServer: [
    {
      command: `pnpm --filter @masseurmatch/web start -p ${WEB}`,
      url: `http://localhost:${WEB}`,
      // Never reuse. A leftover server from an earlier run serves the build it
      // started with, so the suite silently tests stale code — which is exactly
      // what happened the first time this was verified: a deliberately broken
      // CSP passed all 32 tests because the old process was still answering.
      // A smoke test that can pass against code you are not running is worse
      // than no smoke test, because it is trusted.
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: `pnpm --filter @masseurmatch/dashboard start -p ${DASHBOARD}`,
      url: `http://localhost:${DASHBOARD}/sign-in`,
      // Never reuse. A leftover server from an earlier run serves the build it
      // started with, so the suite silently tests stale code — which is exactly
      // what happened the first time this was verified: a deliberately broken
      // CSP passed all 32 tests because the old process was still answering.
      // A smoke test that can pass against code you are not running is worse
      // than no smoke test, because it is trusted.
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});