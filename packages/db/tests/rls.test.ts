import { createClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, it } from "vitest";

import type { Database } from "../index";

/**
 * RLS behaviour tests.
 *
 * These run against a real Supabase project — they assert what the *database*
 * allows, which is the only way to prove a policy works. Point them at a
 * staging project when possible; they are read-only apart from one UPDATE that
 * is expected to be refused.
 *
 * Required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * Optional — enables the cross-therapist write test:
 *   TEST_THERAPIST_A_EMAIL / TEST_THERAPIST_A_PASSWORD
 *   TEST_THERAPIST_B_PROFILE_ID   (a profile owned by a *different* therapist)
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const hasAnonEnv = Boolean(url && anonKey);

const therapistEmail = process.env.TEST_THERAPIST_A_EMAIL;
const therapistPassword = process.env.TEST_THERAPIST_A_PASSWORD;
const otherProfileId = process.env.TEST_THERAPIST_B_PROFILE_ID;
const hasTherapistEnv = Boolean(therapistEmail && therapistPassword && otherProfileId);

/**
 * The live public gate on `profiles`.
 *
 * Note it is `profile_status` / `visibility_status` — *not* the legacy
 * `status` / `is_active` columns, which still exist but no longer gate
 * anything. Several publicly listed profiles carry `status = 'pending'`
 * while being correctly approved and public, so asserting on `status` here
 * produces a false failure.
 */
const PUBLIC_PROFILE_STATUS = "approved";
const PUBLIC_VISIBILITY_STATUS = "public";

function anonClient() {
  return createClient<Database>(url!, anonKey!, { auth: { persistSession: false } });
}

describe.skipIf(!hasAnonEnv)("RLS — anonymous access", () => {
  it("returns nothing from a protected table (keyword_trends is not public)", async () => {
    const { data, error } = await anonClient().from("keyword_trends").select("id").limit(5);

    // Either shape proves the table is closed: PostgREST refuses outright
    // (42501, no grant) or RLS filters every row.
    if (error) {
      expect(error.code).toBeDefined();
    } else {
      expect(data).toEqual([]);
    }
  });

  it("returns only approved, publicly visible profiles", async () => {
    const { data, error } = await anonClient()
      .from("profiles")
      .select("id, profile_status, visibility_status, is_suspended, is_banned")
      .limit(500);

    expect(error).toBeNull();
    expect(data).not.toBeNull();

    const rows = data ?? [];
    expect(rows.length, "expected at least one publicly visible profile").toBeGreaterThan(0);

    const leaked = rows.filter(
      (row) =>
        row.profile_status !== PUBLIC_PROFILE_STATUS ||
        row.visibility_status !== PUBLIC_VISIBILITY_STATUS ||
        row.is_suspended === true ||
        row.is_banned === true,
    );

    expect(
      leaked.map((row) => `${row.id}:${row.profile_status}/${row.visibility_status}`),
      "anonymous read returned a profile that is not publicly listed",
    ).toEqual([]);
  });

  it("cannot write to profiles at all", async () => {
    const { data, error } = await anonClient()
      .from("profiles")
      .update({ headline: "rls-test-should-not-apply" })
      .neq("id", "00000000-0000-0000-0000-000000000000")
      .select("id");

    // No policy grants anon UPDATE, so this must affect zero rows or be refused.
    if (!error) {
      expect(data ?? []).toEqual([]);
    } else {
      expect(error.code).toBeDefined();
    }
  });
});

describe.skipIf(!hasTherapistEnv || !hasAnonEnv)("RLS — therapist isolation", () => {
  let authed: ReturnType<typeof anonClient>;

  beforeAll(async () => {
    authed = anonClient();
    const { error } = await authed.auth.signInWithPassword({
      email: therapistEmail!,
      password: therapistPassword!,
    });
    if (error) throw new Error(`Could not sign in test therapist: ${error.message}`);
  });

  it("cannot edit another therapist's profile", async () => {
    const { data, error } = await authed
      .from("profiles")
      .update({ headline: "rls-test-cross-tenant-write" })
      .eq("id", otherProfileId!)
      .select("id");

    // The row is invisible to this user's UPDATE policy, so nothing is updated.
    if (!error) {
      expect(data ?? [], "a therapist updated a profile they do not own").toEqual([]);
    } else {
      expect(error.code).toBeDefined();
    }
  });
});
