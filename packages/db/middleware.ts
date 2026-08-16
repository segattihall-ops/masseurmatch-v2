import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "./types";

/**
 * Session refresh for Next.js middleware.
 *
 * Supabase access tokens are short-lived. Server components cannot write
 * cookies, so without this the session would silently expire mid-visit and the
 * user would appear logged out. Middleware is the one place allowed to refresh
 * and write the cookie back.
 *
 * Not `server-only`: middleware runs on the edge runtime, where that guard does
 * not apply. It is still never bundled into the browser.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Without credentials there is no session to refresh. Pass through rather
  // than throwing, so a credential-less preview build still serves pages.
  if (!url || !anonKey) return response;

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: "", ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  // Touching getUser() is what triggers the refresh-and-set-cookie cycle.
  await supabase.auth.getUser();

  return response;
}
