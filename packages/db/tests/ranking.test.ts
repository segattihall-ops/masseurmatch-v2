import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import type { Database } from "../index";
import { citySlug, compareByRank, type TherapistListing } from "../actions/directory-config";

/**
 * Directory ranking tests.
 *
 * These exercise the path the public site actually takes: read `profiles`
 * through the anon client (so RLS applies), then order with `compareByRank`.
 *
 * They deliberately do *not* go through `search_public_therapists`. That RPC
 * currently fails against the project with `column tp.slug does not exist`,
 * and the `cities` table is not readable by anon (no GRANT) — the last test
 * pins both facts so a fix flips the suite green instead of going unnoticed.
 *
 * Required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const hasEnv = Boolean(url && anonKey);

function anonClient() {
  return createClient<Database>(url!, anonKey!, { auth: { persistSession: false } });
}

const COLUMNS =
  "id,slug,display_name,full_name,headline,city,state,subscription_tier,is_featured,boost_score,rating_average,review_count";

async function visibleListings(): Promise<TherapistListing[]> {
  const { data, error } = await anonClient()
    .from("profiles")
    .select(COLUMNS)
    .eq("profile_status", "approved")
    .eq("visibility_status", "public");

  expect(error).toBeNull();
  return (data ?? []) as unknown as TherapistListing[];
}

describe.skipIf(!hasEnv)("directory ranking", () => {
  it("returns ranked therapists for a real city", async () => {
    const all = await visibleListings();
    const routable = all.filter((row) => row.slug && row.city && row.state);

    expect(routable.length, "no routable profiles are publicly visible").toBeGreaterThan(0);

    // Pick the city with the most listings — the closest thing to a real page.
    const counts = new Map<string, TherapistListing[]>();
    for (const row of routable) {
      const key = `${row.state!.toLowerCase()}/${citySlug(row.city!)}`;
      counts.set(key, [...(counts.get(key) ?? []), row]);
    }

    const [cityKey, listings] = [...counts.entries()].sort((a, b) => b[1].length - a[1].length)[0]!;
    const ranked = [...listings].sort(compareByRank);

    expect(ranked.length, `no therapists resolved for "${cityKey}"`).toBeGreaterThan(0);

    // Ranking must be a total order: sorting twice cannot change the result.
    expect([...ranked].sort(compareByRank).map((row) => row.id)).toEqual(
      ranked.map((row) => row.id),
    );

    // And every ranked row must be routable.
    for (const row of ranked) {
      expect(row.slug, "ranked row without a slug").toBeTruthy();
    }
  });

  it("orders paid tiers above free ones", async () => {
    const all = await visibleListings();
    const ranked = [...all].sort(compareByRank);

    const firstFree = ranked.findIndex((row) => (row.subscription_tier ?? "free") === "free");
    const lastPaid = ranked.reduce(
      (last, row, index) => ((row.subscription_tier ?? "free") !== "free" ? index : last),
      -1,
    );

    if (firstFree !== -1 && lastPaid !== -1) {
      expect(lastPaid, "a free-tier profile ranked above a paid one").toBeLessThan(firstFree);
    }
  });

  it("documents the two upstream gaps the directory routes around", async () => {
    const client = anonClient();

    // `cities` is not readable by anon: no GRANT, so PostgREST refuses.
    const cities = await client.from("cities").select("slug").limit(1);
    expect(
      cities.error,
      "cities became readable by anon — the directory can stop deriving cities from profiles",
    ).not.toBeNull();

    // The ranking RPC errors server-side.
    const rpc = await client.rpc("search_public_therapists", { result_limit: 1 });
    expect(
      rpc.error,
      "search_public_therapists now works — the directory can use it instead of profiles",
    ).not.toBeNull();
  });
});
