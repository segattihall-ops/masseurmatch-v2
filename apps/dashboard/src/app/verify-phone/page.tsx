import { Card } from "@masseurmatch/ui";
import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/guards";
import { maskPhone } from "@/lib/phone";
import { getOrCreateMyProfile } from "@/lib/profile";

import { VerifyPhoneForm } from "./verify-phone-form";

export const metadata: Metadata = {
  title: "Verify your phone",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Verifying a number, and what it is for.
 *
 * Two things, stated because a therapist deciding whether to hand over their
 * mobile number deserves both: it becomes a second way into the account, and it
 * is a badge clients can see. It does **not** publish the number — `show_phone`
 * on the profile decides that, separately.
 */
export default async function VerifyPhonePage() {
  const viewer = await requireUser("/verify-phone");
  const { profile } = await getOrCreateMyProfile(viewer.user.id);

  const verified = profile.is_verified_phone === true && profile.phone;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
      <Card className="w-full p-8">
        <h1 className="text-2xl font-semibold text-ink">Verify your phone</h1>
        <p className="mt-1 mb-6 text-sm text-ink/60">
          A verified number lets you sign in with a code, and shows clients the number on your
          listing is really yours. Verifying does not publish it — that stays your choice on your
          profile.
        </p>

        {verified ? (
          <p className="mb-6 rounded-md bg-bg-subtle p-3 text-sm text-ink/80">
            <span className="font-medium">{maskPhone(profile.phone as string)}</span> is already
            verified. Sending a new code replaces it.
          </p>
        ) : null}

        <VerifyPhoneForm current={profile.phone} />

        <p className="mt-6 text-sm text-ink/60">
          <Link href="/" className="font-medium text-wine hover:underline">
            Back to your dashboard
          </Link>
        </p>
      </Card>
    </main>
  );
}
