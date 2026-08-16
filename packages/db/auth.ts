import "server-only";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Client } from "./client";
import type { Database } from "./types";

/**
 * Server-side auth for the App Router.
 *
 * Sessions live in cookies, not `localStorage`, so a server component can read
 * them. Everything here is `server-only`: a client import would be a build
 * error rather than a silent security hole.
 *
 * The rule this file enforces: **a role is never trusted from the client.**
 * `getRole()` reads `user_roles` on the server for the id the Supabase JWT was
 * issued for. Nothing a browser sends can influence it.
 */

export type Role = "admin" | "therapist" | "client";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}. See .env.example.`);
  }
  return value;
}

/**
 * Supabase client bound to the request's cookies.
 *
 * `set` is wrapped because Next.js forbids mutating cookies from a server
 * component — only route handlers, server actions and middleware may. Session
 * refresh happens in middleware, so a server component reading an expired
 * session degrades to logged-out instead of crashing.
 */
export function createSessionClient(): Client {
  const store = cookies();

  return createServerClient<Database>(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        get(name: string) {
          return store.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            store.set({ name, value, ...options });
          } catch {
            // Server component — middleware owns refresh. Ignore.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            store.set({ name, value: "", ...options });
          } catch {
            // As above.
          }
        },
      },
    },
  ) as Client;
}

/**
 * The signed-in user, or null.
 *
 * Uses `getUser()`, not `getSession()`. `getSession()` returns whatever is in
 * the cookie without contacting the auth server, so a forged cookie would be
 * taken at face value. `getUser()` validates the JWT against Supabase, which is
 * the only form safe to make an authorisation decision from.
 */
export async function getUser() {
  const {
    data: { user },
    error,
  } = await createSessionClient().auth.getUser();
  if (error) return null;
  return user;
}

/** The caller's role, read server-side. Defaults to `client`. */
export async function getRole(): Promise<Role | null> {
  const supabase = createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw new Error(`Could not resolve role: ${error.message}`);

  const role = data?.role;
  return role === "admin" || role === "therapist" || role === "client" ? role : "client";
}

/** Signed-in user and role together, in one round trip's worth of intent. */
export async function getViewer(): Promise<{
  user: NonNullable<Awaited<ReturnType<typeof getUser>>>;
  role: Role;
} | null> {
  const user = await getUser();
  if (!user) return null;
  const role = (await getRole()) ?? "client";
  return { user, role };
}
