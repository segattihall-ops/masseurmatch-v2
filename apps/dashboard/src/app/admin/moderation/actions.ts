"use server";

import { createSessionClient, getViewer } from "@masseurmatch/db/auth";
import { createServiceClient } from "@masseurmatch/db/client";
import { isReviewableModerationState } from "@masseurmatch/db/review-lifecycle";
import { HIDDEN, PUBLIC, SUSPENDED } from "@masseurmatch/db/visibility";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { FOSTA_CHECKS, MODERATION_ACTIONS, type ModerationAction } from "@/lib/moderation";

import type { StepState } from "../../onboarding/form-state";

async function requireAdminId(): Promise<string> {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in?next=%2Fadmin%2Fmoderation");
  if (viewer.role !== "admin") redirect("/not-authorized");
  return viewer.user.id;
}

const OUTCOMES = {
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
    visibility_status: SUSPENDED,
    moderation_status: "suspended",
  },
} as const;

export async function moderateProfile(_prev: StepState, formData: FormData): Promise<StepState> {
  const adminId = await requireAdminId();
  const profileId = String(formData.get("profile_id") ?? "").trim();
  const action = String(formData.get("action") ?? "") as ModerationAction;
  const reason = String(formData.get("reason") ?? "").trim();
  const checked = formData.getAll("fosta").map(String);

  if (!profileId) return { error: "No profile selected." };
  if (!MODERATION_ACTIONS.includes(action)) return { error: "Unknown action." };
  if (reason.length < 10) {
    return { error: "Give a reason of at least 10 characters — it goes in the audit log." };
  }

  if (action === "approve") {
    const missing = FOSTA_CHECKS.filter((check) => !checked.includes(check.id));
    if (missing.length > 0) {
      return {
        error: `Confirm every check before approving. Outstanding: ${missing
          .map((check) => check.label)
          .join(", ")}.`,
      };
    }
  }

  const supabase = createSessionClient();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id,user_id,profile_status,moderation_status,is_suspended,is_banned")
    .eq("id", profileId)
    .maybeSingle();

  if (profileError) return { error: `Could not load the profile: ${profileError.message}` };
  if (!profile) return { error: "Profile not found." };

  if (
    action !== "suspend" &&
    !isReviewableModerationState({
      profileStatus: profile.profile_status,
      moderationStatus: profile.moderation_status,
      isSuspended: profile.is_suspended,
      isBanned: profile.is_banned,
    })
  ) {
    return {
      error:
        profile.is_suspended || profile.is_banned
          ? "This profile is under enforcement and cannot be approved or returned through the review queue."
          : "This profile is no longer waiting for review. Refresh the queue before taking action.",
    };
  }

  const { error: logError } = await supabase.from("audit_log").insert({
    admin_id: adminId,
    admin_user_id: adminId,
    action: `profile.${action}`,
    target_type: "profile",
    target_id: profileId,
    target_profile_id: profileId,
    reason,
    details: {
      fosta_checked: action === "approve" ? checked : [],
      previous_profile_status: profile.profile_status,
      previous_moderation_status: profile.moderation_status,
    },
  });

  if (logError) {
    return {
      error: `Could not write the audit entry, so nothing was changed: ${logError.message}`,
    };
  }

  const now = new Date().toISOString();
  if (action === "approve") {
    const { error: photoError } = await supabase
      .from("profile_photos")
      .update({
        moderation_status: "approved",
        moderation_reason: reason,
        updated_at: now,
      })
      .eq("profile_id", profileId)
      .eq("moderation_status", "pending");

    if (photoError) {
      return {
        error: `Logged, but the reviewed photos could not be approved: ${photoError.message}`,
      };
    }
  }

  const canonicalFields =
    action === "approve"
      ? {
          approved_at: now,
          approved_by: adminId,
          rejection_reason: null,
          rejected_at: null,
          rejected_by: null,
        }
      : action === "reject"
        ? {
            rejection_reason: reason,
            rejected_at: now,
            rejected_by: adminId,
            approved_at: null,
            approved_by: null,
          }
        : {
            is_suspended: true,
            suspension_reason: reason,
            approved_at: null,
            approved_by: null,
          };

  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...OUTCOMES[action],
      ...canonicalFields,
      moderation_notes: reason,
      reviewed_at: now,
      reviewed_by: adminId,
      updated_at: now,
    })
    .eq("id", profileId)
    .eq("profile_status", profile.profile_status)
    .select("id");

  if (error) return { error: `Logged, but the change failed: ${error.message}` };
  if ((data ?? []).length === 0) {
    return {
      error: "Logged, but no profile was updated — its review state changed while you were deciding.",
    };
  }

  const title =
    action === "approve"
      ? "Profile approved"
      : action === "reject"
        ? "Profile changes requested"
        : "Profile suspended";
  const body = action === "approve" ? "Your MasseurMatch profile was approved." : reason;
  const { error: notificationError } = await createServiceClient().from("notifications").insert({
    user_id: profile.user_id ?? profile.id,
    title,
    body,
    message: body,
    type: "profile_moderation",
    data: { profile_id: profileId, action },
    is_read: false,
  });

  if (notificationError) {
    console.error("[admin] profile moderation notification failed", {
      profileId,
      message: notificationError.message,
    });
  }

  revalidatePath("/admin/moderation");
  revalidatePath("/admin");
  return { ok: true };
}
