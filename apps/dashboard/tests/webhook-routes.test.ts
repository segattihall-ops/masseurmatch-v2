import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * The two webhook paths must stay one handler with one configuration.
 *
 * `/api/webhooks/paypal` exists because PayPal's live webhook is registered
 * against that path while this app names the handler `/api/webhooks/billing`.
 * The alias re-exports `POST`, so the logic cannot drift.
 *
 * Route segment config is the part that *can* drift, and did. Next.js reads
 * `runtime` and `dynamic` **statically**, so re-exporting them from the billing
 * route left them invisible: the build printed "can't recognize the exported
 * `runtime` field ... the default runtime will be used instead" and carried on.
 * That put the aliased path on a different runtime from the handler it shares,
 * while signature verification needs `node:crypto`.
 *
 * A build warning is not a guard — it scrolls past. These assertions read the
 * files as text on purpose, because static analysis is exactly what Next.js is
 * doing and importing the modules would not reproduce it.
 */

function routeSource(relative: string): string {
  return readFileSync(
    fileURLToPath(new URL(`../src/app/api/webhooks/${relative}`, import.meta.url)),
    "utf8",
  );
}

const billing = routeSource("billing/route.ts");
const paypal = routeSource("paypal/route.ts");

describe("the PayPal alias route", () => {
  it("shares the billing handler rather than copying it", () => {
    expect(paypal).toMatch(/export\s*\{\s*POST\s*\}\s*from\s*"\.\.\/billing\/route"/);
    // A second POST implementation here is the failure this alias prevents.
    expect(paypal).not.toMatch(/export\s+async\s+function\s+POST/);
  });

  it("declares runtime and dynamic as literals Next.js can see", () => {
    for (const [name, source] of [
      ["billing", billing],
      ["paypal", paypal],
    ] as const) {
      expect(source, `${name}: runtime must be a string literal`).toMatch(
        /export const runtime = "nodejs"/,
      );
      expect(source, `${name}: dynamic must be a string literal`).toMatch(
        /export const dynamic = "force-dynamic"/,
      );
    }
  });

  it("does not re-export route config, which Next.js cannot resolve", () => {
    expect(paypal).not.toMatch(/export\s*\{[^}]*\b(runtime|dynamic)\b[^}]*\}\s*from/);
  });
});
