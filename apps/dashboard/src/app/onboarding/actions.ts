"use server";

import { getViewer } from "@masseurmatch/db/auth";
import { HIDDEN } from "@masseurmatch/db/visibility";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { basicsSchema, canSubmit, servicesSchema } from "@/lib/onboarding";
import { getOrCreateMyProfile, updateMyProfile } from "@/lib/profile";

import type { StepState } from "./form-state";

/**
 * Onboarding writes.
 *
 * Every step validates with the same zod schema the browser used. The client
 * pass is a convenience; this one is the gate. A hand-crafted POST that skips
 * the form entirely still lands here.
 */

async function requireTherapistId(): Promise<string> {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in?next=%2Fonboarding");
  if (viewer.role !== "provider" && viewer.role !== "admin") redirect("/not-authorized");
  return viewer.user.id;
}

/** zod's flatten() shape, narrowed to what the forms render. */
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
      .map((s) => s.trim())
      .filter(Boolean),
    incall_price: toPrice(formData.get("incall_price")),
    outcall_price: toPrice(formData.get("outcall_price")),
  });

  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const { incall_price, outcall_price } = parsed.data;
  // `starting_price` is what the public card renders, so keep it consistent
  // rather than letting two columns disagree about the same number.
  const prices = [incall_price, outcall_price].filter((p): p is number => p !== null);

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
 * Submit for review.
 *
 * Re-checks completeness on the server: the button is hidden when steps are
 * missing, but a hidden button is not a control. Sets `pending`, which is what
 * the phase 6 moderation queue reads, and keeps visibility `hidden` until a
 * reviewer approves — so submitting can never itself publish a profile.
 */
export async function submitForReview(_prev: StepState): Promise<StepState> {
  const userId = await requireTherapistId();
  const { snapshot, status } = await getOrCreateMyProfile(userId);

  if (status === "approved") {
    return { error: "Your profile is already approved." };
  }
  if (!canSubmit(snapshot)) {
    return { error: "Finish the earlier steps before submitting." };
  }

  const written = await updateMyProfile(userId, {
    profile_status: "pending",
    visibility_status: HIDDEN,
  });
  if (written === 0) return { error: "Could not submit. Please sign in again." };

  revalidatePath("/onboarding");
  return { ok: true };
}
