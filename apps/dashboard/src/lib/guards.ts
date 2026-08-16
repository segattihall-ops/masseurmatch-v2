import "server-only";

import { getViewer, type Role } from "@masseurmatch/db/auth";
import { redirect } from "next/navigation";

/**
 * Route guards.
 *
 * Call these at the top of a protected layout or page. They read the role on
 * the server from `user_roles`, keyed to the id in the validated Supabase JWT —
 * never from anything the client sends.
 *
 * They are deliberately *not* implemented in middleware. A middleware matcher
 * is a denylist by shape: forget to cover a path and it silently becomes
 * public. Calling a guard inside the layout means an unguarded route renders
 * nothing rather than leaking.
 */

export type Viewer = NonNullable<Awaited<ReturnType<typeof getViewer>>>;

/** Any signed-in user. Sends anonymous visitors to sign-in with a return path. */
export async function requireUser(returnTo = "/"): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect(`/sign-in?next=${encodeURIComponent(returnTo)}`);
  return viewer;
}

/** A specific role, or better. Admins pass every check. */
export async function requireRole(role: Role, returnTo = "/"): Promise<Viewer> {
  const viewer = await requireUser(returnTo);
  if (viewer.role === "admin") return viewer;
  if (viewer.role !== role) redirect("/not-authorized");
  return viewer;
}

export function requireTherapist(returnTo = "/"): Promise<Viewer> {
  return requireRole("therapist", returnTo);
}

/** Admin only — `requireRole` would let an admin through either way, but this reads clearly at call sites. */
export async function requireAdmin(returnTo = "/"): Promise<Viewer> {
  const viewer = await requireUser(returnTo);
  if (viewer.role !== "admin") redirect("/not-authorized");
  return viewer;
}
