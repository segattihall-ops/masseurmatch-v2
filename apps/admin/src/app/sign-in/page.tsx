import { turnstileSiteKey } from "@masseurmatch/config/observability";
import { getViewer } from "@masseurmatch/db/auth";
import { Card } from "@masseurmatch/ui";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { GoogleButton } from "@/components/google-button";
import { safeNext } from "@/lib/safe-next";

import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Messages `/auth/callback` can ask for, keyed by a fixed code.
 *
 * A lookup rather than rendering `?notice=`: text taken from a URL and shown on
 * a sign-in page is a phishing surface, however harmless the words in the link
 * that day. An unknown code shows nothing.
 */
const NOTICES: Record<string, string> = {
  "google-failed":
    "We could not complete that Google sign-in. Try again, or use your email and password.",
};

function notice(value: string | string[] | undefined): string | null {
  const code = Array.isArray(value) ? value[0] : value;
  return (code && NOTICES[code]) ?? null;
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { next?: string | string[]; notice?: string | string[] };
}) {
  const next = safeNext(searchParams.next);
  const message = notice(searchParams.notice);
  const viewer = await getViewer();

  if (viewer) {
    if (viewer.role === "admin") redirect(next);
    redirect("/not-authorized");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
      <Card className="w-full p-8">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-wine">
            MasseurMatch
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-ink">Admin sign in</h1>
          <p className="mt-1 text-sm text-ink/60">Authorized operations staff only.</p>
        </div>

        {message ? (
          <p role="status" className="mb-6 rounded-md bg-bg-subtle p-3 text-sm text-ink/80">
            {message}
          </p>
        ) : null}

        <SignInForm next={next} turnstileSiteKey={turnstileSiteKey()} />

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-ink/10" />
          <span className="text-xs uppercase tracking-wide text-ink/40">or</span>
          <span className="h-px flex-1 bg-ink/10" />
        </div>

        <GoogleButton next={next} />

        <p className="mt-6 text-xs text-ink/50">
          Signing in with Google proves who you are. It does not grant access — an account still
          needs the admin role.
        </p>
      </Card>
    </main>
  );
}
