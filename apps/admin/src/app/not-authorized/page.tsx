import { getViewer } from "@masseurmatch/db/auth";
import { Card, buttonVariants } from "@masseurmatch/ui";
import Link from "next/link";

import { signOut } from "@/app/sign-in/actions";

export const dynamic = "force-dynamic";

/**
 * Access denied — and, when someone is signed in, the way back out.
 *
 * The sign-out button is not decoration. A signed-in non-admin who follows
 * "Return to sign in" is redirected straight back here by the sign-in page, so
 * without a way to drop the session this page is a loop with no exit. That was
 * survivable while the only way in was typing an admin password by mistake;
 * "Continue with Google" makes it a single wrong click on the account chooser,
 * which is a thing people will do.
 *
 * Naming the account matters as much as the button. The whole failure mode is
 * arriving as somebody you did not mean to be, and "you are signed in as
 * <personal address>" is what makes that obvious rather than mysterious.
 *
 * The session cookie is host-only, so this signs the person out of the admin
 * app and leaves any dashboard session of theirs alone.
 */
export default async function NotAuthorizedPage() {
  const viewer = await getViewer();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-6">
      <Card className="w-full p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-wine">
          MasseurMatch Admin
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-ink">Access denied</h1>
        <p className="mt-2 text-sm text-ink/60">
          This application is restricted to authorized administrators.
        </p>

        {viewer ? (
          <>
            <p className="mt-4 text-sm text-ink/60">
              You are signed in as{" "}
              <span className="font-medium text-ink">{viewer.user.email ?? "this account"}</span>,
              which does not have the admin role. If that is not the account you meant to use, sign
              out and try again.
            </p>
            <form action={signOut} className="mt-6">
              <button type="submit" className={buttonVariants()}>
                Sign out
              </button>
            </form>
          </>
        ) : (
          <Link href="/sign-in" className={`${buttonVariants()} mt-6`}>
            Return to sign in
          </Link>
        )}
      </Card>
    </main>
  );
}
