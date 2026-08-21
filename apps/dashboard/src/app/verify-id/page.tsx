import { Card } from "@masseurmatch/ui";
import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/guards";
import { getOrCreateMyProfile } from "@/lib/profile";

import { VerifyIdForm } from "./verify-id-form";

export const metadata: Metadata = {
  title: "Verify your identity",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Identity verification page.
 *
 * Allows therapists to submit government ID and a selfie for identity verification.
 * The verification is reviewed by our team and results in a trust badge on their
 * public listing when approved.
 *
 * This is separate from profile approval — verification confirms the person is who
 * they claim to be, while profile approval is about content moderation.
 */
export default async function VerifyIdPage() {
  const viewer = await requireUser("/verify-id");
  const { profile } = await getOrCreateMyProfile(viewer.user.id);

  const verified = profile.is_verified_identity === true;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6">
      <Card className="w-full p-8">
        <h1 className="text-2xl font-semibold text-ink">Verify your identity</h1>
        <p className="mt-1 mb-6 text-sm text-ink/60">
          Upload a government ID and current selfie. Our team will review your documents within
          1–3 business days. Once verified, a trust badge appears on your public listing.
        </p>

        {verified ? (
          <div className="mb-6 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-900">
            <p className="font-medium">✓ Your identity is verified</p>
            <p className="mt-1 text-xs text-green-800">
              Your verification badge is active on your public listing. You can submit a new
              verification anytime to update or renew it.
            </p>
          </div>
        ) : null}

        <VerifyIdForm verificationStatus={verified ? "approved" : "none"} />

        <p className="mt-6 text-sm text-ink/60">
          <Link href="/pro/trust" className="font-medium text-wine hover:underline">
            Back to trust & verification
          </Link>
        </p>
      </Card>
    </main>
  );
}
