import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./types";

/**
 * Typed Supabase client factories.
 *
 * Every client is parameterised with the generated `Database`, so `.from()`,
 * `.rpc()` and their results are fully typed — no `any` anywhere in the access
 * layer.
 */
export type Client = SupabaseClient<Database>;

/**
 * True when both public Supabase variables are present.
 *
 * The public site calls this before querying so a build without credentials
 * (CI, a fresh clone) produces the site shell instead of failing outright.
 */
export function hasSupabaseCredentials(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env.local and fill it in — see README.md.`,
    );
  }
  return value;
}

/**
 * Anon-key client. Subject to RLS, so it only ever sees what a logged-out
 * visitor may see. Safe for the browser and for public server rendering.
 */
export function createAnonClient(): Client {
  return createClient<Database>(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    { auth: { persistSession: false } },
  );
}

/**
 * Service-role client. **Bypasses RLS entirely** — server-only, never import
 * this from a client component or expose its results without authorising the
 * caller first. Used by the Python collector's equivalents: cron jobs,
 * webhooks and other trusted back-end work.
 */
export function createServiceClient(): Client {
  return createClient<Database>(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
