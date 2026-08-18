import { Card } from "@masseurmatch/ui";
import type { Metadata } from "next";

import { requireUser } from "@/lib/guards";

import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false, follow: false },
};

// The recovery link establishes a session moments before this renders, so
// nothing here may be cached or prerendered.
export const dynamic = "force-dynamic";

/**
 * Where a recovery link ends up, via `/auth/callback`.
 *
 * `requireUser` rather than `requireTherapist`: an admin resets a password the
 * same way, and a role check on this page would be a second thing that can go
 * wrong between someone forgetting their password and getting back in.
 */
export default async function ResetPasswordPage() {
  await requireUser("/reset-password");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
      <Card className="w-full p-8">
        <h1 className="text-2xl font-semibold text-ink">Choose a new password</h1>
        <p className="mt-1 mb-6 text-sm text-ink/60">
          You are signed in from the link in your email. Set a new password and you are done.
        </p>

        <ResetPasswordForm />
      </Card>
    </main>
  );
}
