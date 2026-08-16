import { Card } from "@masseurmatch/ui";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Not authorized",
  robots: { index: false, follow: false },
};

export default function NotAuthorizedPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
      <Card className="w-full p-8">
        <h1 className="text-2xl font-semibold text-ink">Not authorized</h1>
        <p className="mt-2 text-sm text-ink/60">
          Your account does not have access to this area. If you think that is wrong, contact
          support.
        </p>
        <Link href="/" className="mt-6 inline-block text-sm font-medium text-wine hover:underline">
          Back to your dashboard
        </Link>
      </Card>
    </main>
  );
}
