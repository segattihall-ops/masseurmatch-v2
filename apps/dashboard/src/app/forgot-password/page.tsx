import { turnstileSiteKey } from "@masseurmatch/config/observability";
import { Card } from "@masseurmatch/ui";
import type { Metadata } from "next";
import Link from "next/link";

import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Reset your password",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
      <Card className="w-full p-8">
        <h1 className="text-2xl font-semibold text-ink">Reset your password</h1>
        <p className="mt-1 mb-6 text-sm text-ink/60">
          We will email you a link that signs you in so you can choose a new one.
        </p>

        <ForgotPasswordForm turnstileSiteKey={turnstileSiteKey()} />

        <p className="mt-6 text-sm text-ink/60">
          Remembered it?{" "}
          <Link href="/sign-in" className="font-medium text-wine hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </main>
  );
}
