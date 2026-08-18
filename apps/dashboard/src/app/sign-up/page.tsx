import { turnstileSiteKey } from "@masseurmatch/config/observability";
import { Card } from "@masseurmatch/ui";
import type { Metadata } from "next";
import Link from "next/link";

import { safeNext } from "@/lib/safe-next";

import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = {
  title: "Create your account",
  robots: { index: false, follow: false },
};

export default function SignUpPage({
  searchParams,
}: {
  searchParams: { next?: string | string[] };
}) {
  const next = safeNext(searchParams.next);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
      <Card className="w-full p-8">
        <h1 className="text-2xl font-semibold text-ink">Create your account</h1>
        <p className="mt-1 mb-6 text-sm text-ink/60">
          List your massage practice on MasseurMatch. Your profile stays private until you finish it
          and it is reviewed.
        </p>

        <SignUpForm next={next} turnstileSiteKey={turnstileSiteKey()} />

        <p className="mt-6 text-sm text-ink/60">
          Already have an account?{" "}
          <Link
            href={`/sign-in?next=${encodeURIComponent(next)}`}
            className="font-medium text-wine hover:underline"
          >
            Sign in
          </Link>
        </p>
      </Card>
    </main>
  );
}
