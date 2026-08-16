import { updateSession } from "@masseurmatch/db/middleware";
import type { NextRequest } from "next/server";

/**
 * Refreshes the Supabase session cookie on every matched request.
 *
 * This is *not* the authorisation boundary — middleware cannot safely be one,
 * because it runs before the route and its matcher is easy to widen by mistake.
 * Authorisation lives in `requireTherapist()` / `requireAdmin()`, called inside
 * each protected layout, where a missed route fails closed instead of open.
 */
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Everything except static assets and image optimisation.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2)$).*)",
  ],
};
