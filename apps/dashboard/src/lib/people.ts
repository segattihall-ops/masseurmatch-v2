import "server-only";

import { createSessionClient } from "@masseurmatch/db/auth";

/**
 * The People CRM's data layer.
 *
 * Reads go through the session client so RLS applies to admins too — the same
 * rule as the rest of `lib/admin.ts`. The production app's version of this
 * screen capped at 200 rows with an N+1 auth lookup per person; this one
 * paginates in the database and keeps to columns the list actually renders.
 */

export type Person = {
  id: string;
  user_id: string | null;
  display_name: string | null;
  full_name: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  profile_status: string | null;
  visibility_status: string | null;
  subscription_tier: string | null;
  is_verified_identity: boolean | null;
  is_verified_phone: boolean | null;
  updated_at: string;
};

const PERSON_COLUMNS =
  "id,user_id,display_name,full_name,email,city,state," +
  "profile_status,visibility_status,subscription_tier," +
  "is_verified_identity,is_verified_phone,updated_at";

export const PEOPLE_PAGE_SIZE = 25;

export const PEOPLE_STATUSES = ["draft", "pending", "approved", "rejected", "suspended"] as const;

export async function listPeople(options: {
  page: number;
  q?: string;
  status?: string;
}): Promise<{ people: Person[]; total: number }> {
  const page = Math.max(1, options.page);
  const from = (page - 1) * PEOPLE_PAGE_SIZE;

  let query = createSessionClient()
    .from("profiles")
    .select(PERSON_COLUMNS, { count: "exact" })
    .order("updated_at", { ascending: false })
    .range(from, from + PEOPLE_PAGE_SIZE - 1);

  if (options.status && (PEOPLE_STATUSES as readonly string[]).includes(options.status)) {
    query = query.eq("profile_status", options.status);
  }

  const q = (options.q ?? "").trim();
  if (q) {
    // Escape PostgREST's or() delimiters rather than rejecting the search.
    const safe = q.replace(/[,()]/g, " ").trim();
    if (safe) {
      query = query.or(
        `display_name.ilike.%${safe}%,full_name.ilike.%${safe}%,email.ilike.%${safe}%,city.ilike.%${safe}%`,
      );
    }
  }

  const { data, error, count } = await query;
  if (error) throw new Error(`Could not load people: ${error.message}`);

  return { people: (data ?? []) as unknown as Person[], total: count ?? 0 };
}
