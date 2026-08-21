import { turnstileSiteKey } from "@masseurmatch/config/observability";
import { getViewer } from "@masseurmatch/db/auth";
import { Card } from "@masseurmatch/ui";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { safeNext } from "@/lib/safe-next";

import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { next?: string | string[] };
}) {
  const next = safeNext(searchParams.next);
  const viewer = await getViewer();

  if (viewer) {
    if (viewer.role === "admin") redirect(next);
    redirect("/not-authorized");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
      <Card className="w-full p-8">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-wine">MasseurMatch</p>
          <h1 className="mt-2 text-2xl font-semibold text-ink">Admin sign in</h1>
          <p className="mt-1 text-sm text-ink/60">Authorized operations staff only.</p>
        </div>
        <SignInForm next={next} turnstileSiteKey={turnstileSiteKey()} />
      </Card>
    </main>
  );
}
