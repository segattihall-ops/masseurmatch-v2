"use server";

import { createSessionClient, getViewer } from "@masseurmatch/db/auth";
import { isEnforcementBlocked } from "@masseurmatch/db/review-lifecycle";
import { HIDDEN } from "@masseurmatch/db/visibility";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { basicsSchema, canSubmit, servicesSchema } from "@/lib/onboarding";
import { getOrCreateMyProfile, updateMyProfile, updateModerationState } from "@/lib/profile";

import type { StepState } from "./form-state";

async function requireTherapistId(): Promise<string> {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in?next=%2Fonboarding");
  if (viewer.role !== "provider" && viewer.role !== "admin") redirect("/not-authorized");
  return viewer.user.id;
}

function fieldErrors(error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}): Record<string, string[]> {
  const flat = error.flatten().fieldErrors;
  return Object.fromEntries(
    Object.entries(flat).filter((entry): entry is [string, string[]] => Boolean(entry[1])),
  );
}

export async function saveBasics(_prev: StepState, formData: FormData): Promise<StepState> {
  const userId = await requireTherapistId();

  const parsed = basicsSchema.safeParse({
    display_name: formData.get("display_name"),
    full_name: formData.get("full_name"),
    headline: formData.get("headline"),
    bio: formData.get("bio"),
    city: formData.get("city"),
    state: formData.get("state"),
    phone: formData.get("phone"),
    email: formData.get("email"),
  });

  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  await getOrCreateMyProfile(userId);
  const written = await updateMyProfile(userId, parsed.data);
  if (written === 0) return { error: "That change was not saved. Please sign in again." };

  revalidatePath("/onboarding");
  return { ok: true };
}

export async function saveServices(_prev: StepState, formData: FormData): Promise<StepState> {
  const userId = await requireTherapistId();

  const toPrice = (value: FormDataEntryValue | null) => {
    const raw = String(value ?? "").trim();
    return raw === "" ? null : raw;
  };

  const parsed = servicesSchema.safeParse({
    service_categories: formData.getAll("service_categories").map(String).filter(Boolean),
    additional_services: formData
      .getAll("additional_services")
      .map(String)
      .map((service) => service.trim())
      .filter(Boolean),
    incall_price: toPrice(formData.get("incall_price")),
    outcall_price: toPrice(formData.get("outcall_price")),
  });

  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const { incall_price, outcall_price } = parsed.data;
  const prices = [incall_price, outcall_price].filter((price): price is number => price !== null);

  await getOrCreateMyProfile(userId);
  const written = await updateMyProfile(userId, {
    ...parsed.data,
    starting_price: prices.length > 0 ? Math.min(...prices) : null,
  });
  if (written === 0) return { error: "That change was not saved. Please sign in again." };

  revalidatePath("/onboarding");
  return { ok: true };
}

/**
 * Submit or resubmit for human review.
 *
 * Completeness and enforcement are re-checked server-side. A rejected profile
 * may return to `pending`, but suspension/ban is a separate enforcement state
 * and can never be cleared by this provider action. Submission keeps the
 * listing hidden and never grants approval or verification.
 */
export async function submitForReview(_prev: StepState): Promise<StepState> {
  const userId = await requireTherapistId();
  const { snapshot, status } = await getOrCreateMyProfile(userId);

  if (status === "approved") return { error: "Your profile is already approved." };
  if (status === "pending") return { error: "Your profile is already waiting for review." };
  if (!canSubmit(snapshot)) return { error: "Finish the earlier steps before submitting." };

  const session = createSessionClient();
  const { data: current, error: currentError } = await session
    .from("profiles")
    .select("profile_status,moderation_status,is_suspended,is_banned")
    .eq("id", userId)
    .maybeSingle();

  if (currentError) return { error: `Could not verify your review state: ${currentError.message}` };
  if (!current) return { error: "Could not find your profile. Please sign in again." };
  if (
    status === "suspended" ||
    isEnforcementBlocked({
      profileStatus: current.profile_status,
      moderationStatus: current.moderation_status,
      isSuspended: current.is_suspended,
      isBanned: current.is_banned,
    })
  ) {
    return {
      error:
        "This profile is under enforcement and cannot be resubmitted. Open a support ticket for review.",
    };
  }

  const written = await updateModerationState(userId, {
    profile_status: "pending",
    visibility_status: HIDDEN,
    moderation_status: "pending",
    reviewed_at: null,
  });
  if (written === 0) return { error: "Could not submit. Please sign in again." };

  revalidatePath("/onboarding");
  revalidatePath("/pro/approval-status");
  revalidatePath("/pro/listing");
  revalidatePath("/admin/moderation");
  return { ok: true };
}
