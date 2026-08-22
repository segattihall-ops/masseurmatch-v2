import "server-only";

import { createServiceClient } from "@masseurmatch/db/client";

export type AdminCityCoverage = {
  key: string;
  city: string;
  state: string;
  total: number;
  public: number;
  approved: number;
  pending: number;
  suspended: number;
};

export async function listAdminCityCoverage(): Promise<AdminCityCoverage[]> {
  const { data, error } = await createServiceClient()
    .from("profiles")
    .select("id,city,state,profile_status,visibility_status")
    .not("city", "is", null)
    .not("state", "is", null)
    .limit(5000);

  if (error) throw new Error(`Could not load city coverage: ${error.message}`);

  const cities = new Map<string, AdminCityCoverage>();
  for (const profile of data ?? []) {
    const city = profile.city?.trim();
    const state = profile.state?.trim();
    if (!city || !state) continue;
    const key = `${state.toLowerCase()}::${city.toLowerCase()}`;
    const row =
      cities.get(key) ??
      ({ key, city, state, total: 0, public: 0, approved: 0, pending: 0, suspended: 0 } satisfies AdminCityCoverage);

    row.total += 1;
    if (profile.visibility_status === "public") row.public += 1;
    if (profile.profile_status === "approved") row.approved += 1;
    if (["pending", "pending_approval", "under_review"].includes(profile.profile_status ?? "")) {
      row.pending += 1;
    }
    if (profile.profile_status === "suspended") row.suspended += 1;
    cities.set(key, row);
  }

  return [...cities.values()].sort(
    (a, b) => b.public - a.public || b.total - a.total || a.state.localeCompare(b.state) || a.city.localeCompare(b.city),
  );
}

export function publicCityPath(city: string, state: string): string {
  const slug = city
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `/${state.toLowerCase()}/${slug}`;
}
