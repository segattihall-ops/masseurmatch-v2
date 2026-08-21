import { Card, buttonVariants } from "@masseurmatch/ui";
import Link from "next/link";

export default function NotAuthorizedPage() {
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
        <Link href="/sign-in" className={`${buttonVariants()} mt-6`}>
          Return to sign in
        </Link>
      </Card>
    </main>
  );
}
