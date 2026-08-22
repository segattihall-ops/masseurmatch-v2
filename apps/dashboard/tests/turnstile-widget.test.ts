import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * The Turnstile widget exists twice — once in the dashboard, once in the admin
 * app — and these tests exist because that is a shape that rots.
 *
 * It is duplicated rather than shared because its only plausible home,
 * `@masseurmatch/ui`, has no `next` dependency, and pushing one into the design
 * system for a captcha widget is the worse trade. The repository already keeps
 * per-app copies of `safe-next.ts` and `form-state.ts` for similar reasons.
 *
 * What makes this copy different from those is that a divergence is not
 * cosmetic: the fixes below are what stand between "Turnstile is on" and "the
 * second login attempt always fails". One app quietly getting the token reset
 * and the other not is exactly the bug nobody would look for.
 *
 * The second test is a tripwire, not a proof. Asserting on source text catches
 * a guard being deleted — the realistic regression, someone simplifying the
 * widget back to its first version — and catches nothing about whether the
 * guard works. A behavioural test needs jsdom and a React testing library,
 * neither of which this repository installs, and adding both to assert three
 * callbacks are registered is not a trade worth making.
 */

const read = (relative: string) =>
  readFileSync(fileURLToPath(new URL(relative, import.meta.url)), "utf8");

const DASHBOARD = "../src/components/turnstile.tsx";
const ADMIN = "../../admin/src/components/turnstile.tsx";

describe("Turnstile widget", () => {
  it("is byte-identical in both apps", () => {
    expect(read(ADMIN)).toBe(read(DASHBOARD));
  });

  it("still carries every guard that makes it safe to switch on", () => {
    const source = read(DASHBOARD);

    // A Turnstile token is single-use. Without a reset when a submission
    // finishes, correcting a mistyped password and trying again submits the
    // spent token, and the person is told they failed a human check.
    expect(source).toMatch(/addEventListener\("submit"/);
    expect(source).toMatch(/reset\(widgetId\.current\)/);

    // Fires when the widget refuses to run — most often because the hostname
    // is missing from the widget's allow-list in the Cloudflare dashboard,
    // which is invisible from the server side.
    expect(source).toContain('"error-callback"');

    // A token that aged out on an idle page is replaced rather than submitted.
    expect(source).toContain('"expired-callback"');

    // Waiting for `api.js` is bounded, so a blocked script surfaces as a
    // message instead of an empty gap and a poll that never ends.
    expect(source).toContain("READY_TIMEOUT_MS");
  });
});
