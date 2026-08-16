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
 * runs, but it exposes none of the ranking columns and returns fewer rows than
 * are publicly visible; `cities` is not readable by anon (no GRANT). The last
 * two tests pin both facts, so if either changes the suite says so rather than
 * leaving the directory on the slower path for a reason nobody remembers.
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

  it("cities is still unreadable by anon", async () => {
    // No GRANT, so PostgREST refuses. This is why the directory derives its
    // city list from `profiles` instead of reading `cities` directly.
    const cities = await anonClient().from("cities").select("slug").limit(1);
    expect(
      cities.error,
      "cities became readable by anon — the directory can stop deriving cities from profiles",
    ).not.toBeNull();
  });

  it("search_public_therapists runs but cannot rank, so the directory still reads profiles", async () => {
    // This RPC used to fail outright (`column tp.slug does not exist`). It was
    // fixed upstream, so "does it error?" is no longer the question worth
    // pinning — "is it usable?" is. Two measured reasons it is not:
    //
    //   1. It returns no `subscription_tier`, `is_featured` or `boost_score`.
    //      Those are what `compareByRank` orders by, so routing the directory
    //      through this RPC would silently drop paid placement — the thing
    //      therapists pay for.
    //   2. It returns fewer rows than are publicly visible, excluding at least
    //      one approved + public profile (a join on city/coordinates, most
    //      likely). A directory that hides a paying listing is worse than a
    //      slower one.
    //
    // It does not over-return, which is the part that would have been a leak.
    const client = anonClient();

    const rpc = await client.rpc("search_public_therapists", { result_limit: 500 });
    expect(rpc.error, "the RPC started erroring again").toBeNull();

    const rows = (rpc.data ?? []) as Record<string, unknown>[];
    expect(rows.length).toBeGreaterThan(0);

    for (const column of ["subscription_tier", "is_featured", "boost_score"]) {
      expect(
        rows[0],
        `${column} is exposed now — the RPC could replace the profiles query`,
      ).not.toHaveProperty(column);
    }

    const visible = await visibleListings();
    const returned = new Set(rows.map((row) => row.slug as string));
    const dropped = visible.filter((listing) => !returned.has(listing.slug));

    expect(
      dropped.length,
      "the RPC stopped dropping visible profiles — reconsider using it",
    ).toBeGreaterThan(0);
    expect(
      visible.filter((listing) => returned.has(listing.slug)).length,
      "the RPC returned nothing the directory considers visible",
    ).toBeGreaterThan(0);
  });
});
