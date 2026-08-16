import { turnstileSiteKey } from "@masseurmatch/config/observability";
import { Card } from "@masseurmatch/ui";
import type { Metadata } from "next";

import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

function safeNext(value: string | string[] | undefined): string {
  const next = Array.isArray(value) ? value[0] : value;
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export default function SignInPage({
  searchParams,
}: {
  searchParams: { next?: string | string[] };
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
      <Card className="w-full p-8">
        <h1 className="text-2xl font-semibold text-ink">Sign in</h1>
        <p className="mt-1 mb-6 text-sm text-ink/60">Manage your MasseurMatch listing.</p>
        <SignInForm next={safeNext(searchParams.next)} turnstileSiteKey={turnstileSiteKey()} />
      </Card>
    </main>
  );
}
