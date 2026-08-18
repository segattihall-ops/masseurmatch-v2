import { turnstileSiteKey } from "@masseurmatch/config/observability";
import { Card } from "@masseurmatch/ui";
import type { Metadata } from "next";
import Link from "next/link";

import { safeNext } from "@/lib/safe-next";

import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

/**
 * Messages `/auth/callback` can ask for, keyed by a fixed code.
 *
 * A lookup rather than rendering `?message=`: text taken from a URL and shown
 * on a sign-in page is a phishing surface, however harmless the words in the
 * link that day. An unknown code shows nothing.
 */
const NOTICES: Record<string, string> = {
  "link-expired":
    "That confirmation link has expired or was already used. Sign in, or create your account again.",
  "link-invalid": "That link was not something we could read. Try opening it again from the email.",
  "setup-failed":
    "We confirmed your email but could not finish setting up your account. Try signing in, and contact support if this keeps happening.",
};

function notice(value: string | string[] | undefined): string | null {
  const code = Array.isArray(value) ? value[0] : value;
  return (code && NOTICES[code]) ?? null;
}

export default function SignInPage({
  searchParams,
}: {
  searchParams: { next?: string | string[]; notice?: string | string[] };
}) {
  const next = safeNext(searchParams.next);
  const message = notice(searchParams.notice);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
      <Card className="w-full p-8">
        <h1 className="text-2xl font-semibold text-ink">Sign in</h1>
        <p className="mt-1 mb-6 text-sm text-ink/60">Manage your MasseurMatch listing.</p>

        {message ? (
          <p role="status" className="mb-6 rounded-md bg-bg-subtle p-3 text-sm text-ink/80">
            {message}
          </p>
        ) : null}

        <SignInForm next={next} turnstileSiteKey={turnstileSiteKey()} />

        <p className="mt-6 text-sm text-ink/60">
          New here?{" "}
          <Link
            href={`/sign-up?next=${encodeURIComponent(next)}`}
            className="font-medium text-wine hover:underline"
          >
            Create an account
          </Link>
        </p>
      </Card>
    </main>
  );
}
