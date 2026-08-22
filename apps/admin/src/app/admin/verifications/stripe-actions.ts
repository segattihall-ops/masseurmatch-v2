"use server";

import { createServiceClient } from "@masseurmatch/db/client";
import type { Json } from "@masseurmatch/db/types";
import { revalidatePath } from "next/cache";

import type { StepState } from "@/app/onboarding/form-state";
import { requireAdmin } from "@/lib/guards";
import { retrieveStripeIdentitySession } from "@/lib/stripe-identity";

export async function syncStripeIdentity(
  _prev: StepState,
  formData: FormData,
): Promise<StepState> {
  const viewer = await requireAdmin("/verifications");
  const verificationId = String(formData.get("verification_id") ?? "").trim();
  if (!verificationId) return { error: "No Stripe Identity verification selected." };

  const service = createServiceClient();
  const { data: verification, error: readError } = await service
    .from("identity_verifications")
    .select(
      "id,user_id,profile_id,provider,status,last_error,metadata,stripe_session_id,stripe_verification_session_id",
    )
    .eq("id", verificationId)
    .maybeSingle();

  if (readError) return { error: `Could not read verification: ${readError.message}` };
  if (!verification || verification.provider !== "stripe") {
    return { error: "That legacy Stripe Identity verification no longer exists." };
  }

  const sessionId =
    verification.stripe_verification_session_id?.trim() || verification.stripe_session_id?.trim();
  if (!sessionId) return { error: "This legacy verification has no Stripe session id to sync." };

  let stripeSession;
  try {
    stripeSession = await retrieveStripeIdentitySession(sessionId);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Stripe Identity sync failed." };
  }

  const now = new Date().toISOString();
  const lastError =
    stripeSession.last_error?.reason?.trim() || stripeSession.last_error?.code?.trim() || null;

  const { error: auditError } = await service.from("audit_log").insert({
    admin_id: viewer.user.id,
    admin_user_id: viewer.user.id,
    action: "identity.stripe.sync",
    target_type: "identity_verification",
    target_id: verification.id,
    target_profile_id: verification.profile_id,
    reason: `Stripe Identity status synced: ${verification.status} → ${stripeSession.status}`,
    details: {
      previous_status: verification.status,
      stripe_status: stripeSession.status,
      livemode: stripeSession.livemode,
    },
  });

  if (auditError) {
    return {
      error: `Stripe responded, but the audit entry failed, so nothing was changed: ${auditError.message}`,
    };
  }

  const currentMetadata =
    verification.metadata && typeof verification.metadata === "object" && !Array.isArray(verification.metadata)
      ? (verification.metadata as Record<string, Json | undefined>)
      : {};
  const metadata = {
    ...currentMetadata,
    stripe_sync: {
      synced_at: now,
      synced_by: viewer.user.id,
      livemode: stripeSession.livemode,
    },
  } as Json;

  const { error: updateError } = await service
    .from("identity_verifications")
    .update({
      status: stripeSession.status,
      last_error: lastError,
      stripe_verification_report_id: stripeSession.last_verification_report,
      metadata,
      updated_at: now,
    })
    .eq("id", verification.id);

  if (updateError) return { error: `Logged, but the status update failed: ${updateError.message}` };

  if (stripeSession.status === "verified" && verification.profile_id) {
    const { error: profileError } = await service
      .from("profiles")
      .update({
        is_verified_identity: true,
        verification_status: "verified",
        identity_verified_at: now,
        updated_at: now,
      })
      .eq("id", verification.profile_id);

    if (profileError) {
      return {
        error: `Stripe verification is saved as verified, but the profile badge failed: ${profileError.message}`,
      };
    }
  }

  revalidatePath("/verifications");
  revalidatePath("/admin/verifications");
  revalidatePath("/reports");
  revalidatePath("/");
  return { ok: true };
}
