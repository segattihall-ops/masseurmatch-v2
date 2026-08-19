"use server";

import { createSessionClient, getViewer } from "@masseurmatch/db/auth";
import { HIDDEN, PUBLIC, SUSPENDED } from "@masseurmatch/db/visibility";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  FOSTA_CHECKS,
  MODERATION_ACTIONS,
  type ModerationAction,
} from "@/lib/moderation";

import type { StepState } from "../../onboarding/form-state";

/**
 * Moderation.
 *
 * Every decision writes to `audit_log` **before** it is applied. That ordering
 * is the whole design:
 *
 *   log then act  — a failure between the two leaves a logged decision that did
 *                   not take effect. Visible, reconcilable, harmless.
 *   act then log  — a failure leaves a profile approved or suspended with no
 *                   record of who did it or why. That is precisely the case an
 *                   immutable audit log exists to prevent.
 *
 * Supabase's JS client cannot open a transaction, so the statements are not
 * atomic. `supabase/migrations/20260816030000_audit_log_and_moderation.sql`
 * defines `public.moderate_profile()`, a `security definer` function for the
 * profile decision. Once that RPC also owns photo decisions, this path can be
 * collapsed into one database transaction. Until then, approval is deliberately
 * ordered audit -> reviewed photos -> profile. A failure can leave checked
 * photos approved while the profile remains non-public; it cannot publish a
 * profile whose pending photos were never approved by the reviewer.
 */

async function requireAdminId(): Promise<string> {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in?next=%2Fadmin%2Fmoderation");
  if (viewer.role !== "admin") redirect("/not-authorized");
  return viewer.user.id;
}

/** What each decision does to the profile row. */
const OUTCOMES: Record<ModerationAction, Record<string, unknown>> = {
  approve: {
    profile_status: "approved",
    visibility_status: PUBLIC,
    moderation_status: "approved",
  },
  reject: {
    profile_status: "rejected",
    visibility_status: HIDDEN,
    moderation_status: "rejected",
  },
  suspend: {
    profile_status: "suspended",
    // The schema has a dedicated value for this. Using it keeps an admin
    // removal distinguishable from an ordinary unlisting.
    visibility_status: SUSPENDED,
    moderation_status: "suspended",
  },
};

export async function moderateProfile(
  _prev: StepState,
  formData: FormData
): Promise<StepState> {
  const adminId = await requireAdminId();

  const profileId = String(formData.get("profile_id") ?? "").trim();
  const action = String(formData.get("action") ?? "") as ModerationAction;
  const reason = String(formData.get("reason") ?? "").trim();
  const checked = formData.getAll("fosta").map(String);

  if (!profileId) return { error: "No profile selected." };
  if (!MODERATION_ACTIONS.includes(action))
    return { error: "Unknown action." };

  // Mandatory reason, enforced server-side. The textarea is `required`, but a
  // required attribute is a hint to a browser, not a rule.
  if (reason.length < 10) {
    return {
      error:
        "Give a reason of at least 10 characters — it goes in the audit log.",
    };
  }

  // The FOSTA-SESTA checklist gates approval only. Rejecting or suspending
  // something you have not fully reviewed must stay possible: requiring the
  // checklist to remove harmful content would be exactly backwards.
  if (action === "approve") {
    const missing = FOSTA_CHECKS.filter((check) => !checked.includes(check.id));
    if (missing.length > 0) {
      return {
        error: `Confirm every check before approving. Outstanding: ${missing
          .map((c) => c.label)
          .join(", ")}.`,
      };
    }
  }

  const supabase = createSessionClient();

  // 1. Log first.
  const { error: logError } = await supabase.from("audit_log").insert({
    admin_id: adminId,
    admin_user_id: adminId,
    action: `profile.${action}`,
    target_type: "profile",
    target_id: profileId,
    target_profile_id: profileId,
    reason,
    details: { fosta_checked: action === "approve" ? checked : [] },
  });

  if (logError) {
    // Refusing to act is correct here: an unlogged moderation decision is worse
    // than a decision deferred.
    return {
      error: `Could not write the audit entry, so nothing was changed: ${logError.message}`,
    };
  }

  // 2. Approval includes the photos the reviewer just affirmed in the required
  // checklist. Only pending photos are touched; an older rejected photo is not
  // resurrected by approving a later profile edit.
  if (action === "approve") {
    const { error: photoError } = await supabase
      .from("profile_photos")
      .update({
        moderation_status: "approved",
        moderation_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq("profile_id", profileId)
      .eq("moderation_status", "pending");

    if (photoError) {
      return {
        error: `Logged, but the reviewed photos could not be approved: ${photoError.message}`,
      };
    }
  }

  // 3. Then publish or otherwise resolve the profile decision.
  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...OUTCOMES[action],
      moderation_notes: reason,
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profileId)
    .select("id");

  if (error)
    return { error: `Logged, but the change failed: ${error.message}` };
  if ((data ?? []).length === 0) {
    return {
      error:
        "Logged, but no profile was updated — it may have been changed already.",
    };
  }

  revalidatePath("/admin/moderation");
  revalidatePath("/admin");
  return { ok: true };
}
