import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  HIDDEN,
  isVisibilityStatus,
  PAUSED,
  PUBLIC,
  SUSPENDED,
  toVisibilityStatus,
  VISIBILITY_STATUSES,
} from "@masseurmatch/db/visibility";

/**
 * `visibility_status` is constrained in the database:
 *
 *   CHECK (visibility_status = ANY (ARRAY['hidden','public','paused','suspended']))
 *
 * read from `pg_constraint` on the production project, 2026-08-16.
 *
 * The code wrote `"private"` from five call sites — a word that appears nowhere
 * in the schema. Every one of those writes fails with `23514`, including the
 * one that runs the first time a therapist signs in. 97 tests passed while that
 * was true, because none of them wrote to the database.
 *
 * The second test below is the one that would have caught it: it reads the
 * source and fails on any `visibility_status` literal outside the allowed set.
 * It needs no database, so it runs in CI, where no credentials exist.
 */

describe("the allowed set", () => {
  it("matches the CHECK constraint exactly", () => {
    expect([...VISIBILITY_STATUSES]).toEqual(["hidden", "public", "paused", "suspended"]);
  });

  it("has no 'private'", () => {
    expect(isVisibilityStatus("private")).toBe(false);
  });

  it("names each state through a constant", () => {
    expect([HIDDEN, PUBLIC, PAUSED, SUSPENDED]).toEqual([
      "hidden",
      "public",
      "paused",
      "suspended",
    ]);
  });

  it("narrows anything unrecognised to hidden, never to public", () => {
    for (const value of [null, undefined, "", "private", "live"]) {
      expect(toVisibilityStatus(value)).toBe(HIDDEN);
    }
  });
});

/* -------------------------------------------------------------------------- */

const ROOTS = [
  join(__dirname, "../src"),
  join(__dirname, "../../web/src"),
  join(__dirname, "../../../packages/db"),
];

function sourceFiles(dir: string): string[] {
  let out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "types.ts") continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out = out.concat(sourceFiles(path));
    else if (/\.tsx?$/.test(entry)) out.push(path);
  }
  return out;
}

describe("no source writes a value the database would reject", () => {
  it("uses only allowed visibility_status literals", () => {
    // Matches `visibility_status: "x"` and `.eq("visibility_status", "x")`.
    const patterns = [
      /visibility_status"?\s*:\s*"([a-z_]+)"/g,
      /"visibility_status"\s*,\s*"([a-z_]+)"/g,
    ];

    const offenders: string[] = [];
    for (const root of ROOTS) {
      for (const file of sourceFiles(root)) {
        const text = readFileSync(file, "utf8");
        for (const pattern of patterns) {
          for (const match of text.matchAll(pattern)) {
            if (!isVisibilityStatus(match[1])) {
              offenders.push(`${file.split("/").slice(-3).join("/")}: "${match[1]}"`);
            }
          }
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
