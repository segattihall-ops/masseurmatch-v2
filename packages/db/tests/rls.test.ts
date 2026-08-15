import { createClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, it } from "vitest";

import type { Database, Tables } from "../index";

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

/** Statuses a logged-out visitor is allowed to see. */
const PUBLIC_STATUSES = new Set(["active", "approved"]);

function anonClient() {
  return createClient<Database>(url!, anonKey!, { auth: { persistSession: false } });
}

describe.skipIf(!hasAnonEnv)("RLS — anonymous access", () => {
  it("returns nothing from a protected table (keyword_trends is admin-read only)", async () => {
    const { data, error } = await anonClient().from("keyword_trends").select("id").limit(5);

    // Either shape proves the policy holds: PostgREST returns an empty set when
    // RLS filters every row, or an explicit permission error.
    if (error) {
      expect(error.code).toBeDefined();
    } else {
      expect(data).toEqual([]);
    }
  });

  it("returns only active/approved profiles", async () => {
    const { data, error } = await anonClient()
      .from("profiles")
      .select("id, status, is_active")
      .limit(200);

    expect(error).toBeNull();
    expect(data).not.toBeNull();

    const rows = (data ?? []) as Pick<Tables<"profiles">, "id" | "status" | "is_active">[];
    const leaked = rows.filter((row) => !PUBLIC_STATUSES.has(String(row.status)));

    expect(
      leaked.map((row) => `${row.id}:${row.status}`),
      "anonymous read leaked non-public profile statuses",
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
