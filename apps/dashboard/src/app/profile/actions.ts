"use server";

import { getViewer } from "@masseurmatch/db/auth";
import { createServiceClient } from "@masseurmatch/db/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { basicsSchema, changedSensitiveFields, servicesSchema } from "@/lib/onboarding";
import { getOrCreateMyProfile } from "@/lib/profile";

import type { StepState } from "../onboarding/form-state";

async function requireTherapistId(): Promise<string> {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in?next=%2Fprofile");
  if (viewer.role !== "provider" && viewer.role !== "admin") redirect("/not-authorized");
  return viewer.user.id;
}

function fieldErrors(error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).filter((e): e is [string, string[]] =>
      Boolean(e[1]),
    ),
  );
}

/**
 * Edit an existing profile.
 *
 * Re-moderation, and what it deliberately does *not* do
 * -----------------------------------------------------
 * When an approved profile's sensitive fields change, this flags it for review
 * without taking it offline: `profile_status` stays `approved` and
 * `moderation_status` becomes `pending_review`, which is what the phase 6 queue
 * reads. Dropping `profile_status` back to `pending` would delist the therapist
 * instantly — the public read policy requires `approved` — so a typo fix in a
 * bio would cost them their listing until a human got to it. That is the wrong
 * trade for text.
 *
 * The genuinely risky change is imagery, and that is already handled elsewhere:
 * every uploaded photo starts at `moderation_status = 'pending'` in
 * `profile_photos` and is not publicly shown until approved. So new images are
 * held, edited text stays live pending review. If you would rather hold text
 * too, this is the single place to change it.
 *
 * Database trust-state guards intentionally prevent a provider JWT from
 * changing moderation metadata directly. This action therefore validates the
 * authenticated provider and every editable field first, then performs only
 * the explicit patch below through the trusted backend for that same profile
 * id. That keeps the guard meaningful without breaking the legitimate
 * re-review transition.
 */
export async function saveProfile(_prev: StepState, formData: FormData): Promise<StepState> {
  const userId = await requireTherapistId();
  const { profile, status } = await getOrCreateMyProfile(userId);

  const basics = basicsSchema.safeParse({
    display_name: formData.get("display_name"),
    full_name: formData.get("full_name"),
    headline: formData.get("headline"),
    bio: formData.get("bio"),
    city: formData.get("city"),
    state: formData.get("state"),
    phone: formData.get("phone"),
    email: formData.get("email"),
  });
  if (!basics.success) return { fieldErrors: fieldErrors(basics.error) };

  const toPrice = (v: FormDataEntryValue | null) => {
    const raw = String(v ?? "").trim();
    return raw === "" ? null : raw;
  };

  const services = servicesSchema.safeParse({
    service_categories: formData.getAll("service_categories").map(String).filter(Boolean),
    additional_services: [],
    incall_price: toPrice(formData.get("incall_price")),
    outcall_price: toPrice(formData.get("outcall_price")),
  });
  if (!services.success) return { fieldErrors: fieldErrors(services.error) };

  const patch: Record<string, unknown> = { ...basics.data, ...services.data };

  const prices = [services.data.incall_price, services.data.outcall_price].filter(
    (p): p is number => p !== null,
  );
  patch.starting_price = prices.length > 0 ? Math.min(...prices) : null;

  const changed = changedSensitiveFields(
    {
      display_name: profile.display_name,
      full_name: profile.full_name,
      headline: profile.headline,
      bio: profile.bio,
      avatar_url: profile.avatar_url,
      photo_url: profile.photo_url,
      service_categories: profile.service_categories,
      additional_services: profile.additional_services,
    },
    patch,
  );

  const needsReview = status === "approved" && changed.length > 0;
  if (needsReview) {
    patch.moderation_status = "pending_review";
    patch.moderation_notes = `Re-review after edit to: ${changed.join(", ")}`;
    patch.reviewed_at = null;
  }

  const { data, error } = await createServiceClient()
    .from("profiles")
    .update({ ...patch, updated_at: new Date().toISOString() } as never)
    .eq("id", userId)
    .select("id");

  if (error) return { error: `That change was not saved: ${error.message}` };
  if ((data ?? []).length === 0) return { error: "That change was not saved. Please sign in again." };

  revalidatePath("/profile");
  // The public page is ISR'd; without this the edit would not surface until the
  // hourly revalidation window elapsed.
  revalidatePath("/", "layout");

  return {
    ok: true,
    error: needsReview
      ? `Saved. Because you changed ${changed.join(", ")}, your profile is queued for another review — it stays visible in the meantime.`
      : undefined,
  };
}
