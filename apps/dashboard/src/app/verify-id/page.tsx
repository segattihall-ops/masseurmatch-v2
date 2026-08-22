import { Card } from "@masseurmatch/ui";
import type { Metadata } from "next";
import Link from "next/link";

import { createServiceClient } from "@masseurmatch/db/client";

import { requireUser } from "@/lib/guards";
import { normalizeIdentityStatus } from "@/lib/identity-status";
import { getOrCreateMyProfile } from "@/lib/profile";

import { VerifyIdForm } from "./verify-id-form";

export const metadata: Metadata = {
  title: "Verify your identity",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Manual identity verification page.
 *
 * Therapists submit a government ID and selfie. An authorized MasseurMatch
 * admin reviews the submission and decides whether the identity badge is
 * granted. No third-party identity provider participates in this flow.
 */
export default async function VerifyIdPage() {
  const viewer = await requireUser("/verify-id");
  const { profile } = await getOrCreateMyProfile(viewer.user.id);

  const { data: latest } = await createServiceClient()
    .from("identity_verifications")
    .select("status, last_error")
    .eq("user_id", viewer.user.id)
    .eq("provider", "manual")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const status = normalizeIdentityStatus(latest?.status);
  const verified = profile.is_verified_identity === true || status === "verified";
  const awaitingReview = !verified && status === "pending";
  const needsResubmission = !verified && (status === "requires_input" || status === "failed");
  const rejectionReason = needsResubmission ? (latest?.last_error ?? null) : null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6">
      <Card className="w-full p-8">
        <h1 className="text-2xl font-semibold text-ink">Verify your identity</h1>
        <p className="mt-1 mb-6 text-sm text-ink/60">
          Upload a government ID and current selfie. A MasseurMatch admin will manually review your
          documents within 1–3 business days. Once approved, a trust badge appears on your public
          listing.
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

        {awaitingReview ? (
          <div className="mb-6 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
            <p className="font-medium">Your documents are with our review team</p>
            <p className="mt-1 text-xs text-blue-800">
              Decisions usually land within 1–3 business days. You do not need to submit again
              unless we ask you to.
            </p>
          </div>
        ) : null}

        {needsResubmission ? (
          <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            <p className="font-medium">We need a new submission</p>
            {rejectionReason ? (
              <p className="mt-1 text-xs text-amber-800">{rejectionReason}</p>
            ) : (
              <p className="mt-1 text-xs text-amber-800">
                Your last submission could not be accepted. Start a new verification below.
              </p>
            )}
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
