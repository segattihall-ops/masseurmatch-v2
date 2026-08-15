import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import type { Database } from "../index";

/**
 * Ranking test.
 *
 * `actions/ranking.ts` is a `"use server"` module and depends on
 * `next/cache`, which needs a Next.js request scope — so this test exercises
 * the same RPC through the same anon client the action uses, asserting the
 * contract the action depends on: rows come back ordered by `priority_rank`.
 *
 * Required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 * Optional — defaults to the first city in the `cities` table:
 *   TEST_CITY_SLUG
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const hasEnv = Boolean(url && anonKey);

function anonClient() {
  return createClient<Database>(url!, anonKey!, { auth: { persistSession: false } });
}

/** Resolve a real city slug: the configured one, or the first in the table. */
async function resolveCitySlug(client: ReturnType<typeof anonClient>): Promise<string> {
  const configured = process.env.TEST_CITY_SLUG;
  if (configured) return configured;

  const { data, error } = await client
    .from("cities")
    .select("slug")
    .not("slug", "is", null)
    .limit(1)
    .single();

  if (error) throw new Error(`Could not resolve a test city: ${error.message}`);
  if (!data.slug) throw new Error("Resolved a city with no slug; set TEST_CITY_SLUG instead.");
  return data.slug;
}

describe.skipIf(!hasEnv)("ranking", () => {
  it("returns therapists ordered by priority_rank for a real city", async () => {
    const client = anonClient();
    const citySlug = await resolveCitySlug(client);

    const { data, error } = await client.rpc("search_public_therapists", {
      search_city_slug: citySlug,
      result_limit: 25,
    });

    expect(error, `RPC failed for city "${citySlug}"`).toBeNull();
    expect(Array.isArray(data)).toBe(true);

    const rows = data ?? [];
    expect(rows.length, `no therapists returned for "${citySlug}"`).toBeGreaterThan(0);

    // The RPC is the ranking: priority_rank must be non-decreasing.
    const ranks = rows.map((row) => row.priority_rank);
    const sorted = [...ranks].sort((a, b) => a - b);
    expect(ranks, "rows are not ordered by priority_rank").toEqual(sorted);

    // And every row must be a profile the anon role may see.
    for (const row of rows) {
      expect(row.slug, "ranked row without a public slug").toBeTruthy();
    }
  });
});
