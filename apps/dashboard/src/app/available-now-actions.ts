"use server";

import { accessTo, planFor } from "@masseurmatch/billing";
import { availableNowEndsAt, isAvailableNow } from "@masseurmatch/db/available-now";
import { resolveTier } from "@masseurmatch/db/tier-grants";
import { revalidatePath } from "next/cache";

import { requireTherapist } from "@/lib/guards";
import { getOrCreateMyProfile, updateMyProfile } from "@/lib/profile";

/**
 * Turning Available Now on and off.
 *
 * The window length comes from the plan, and the entitlement comes from the
 * feature table — never from `subscription_tier` directly, so a lapsed courtesy
 * grant cannot switch it on.
 *
 * Turning it **off** is deliberately not gated. Someone whose grant lapsed
 * mid-window must still be able to clear a badge that says they are free right
 * now, and refusing that would leave a false claim on a public page.
 */

export type AvailableNowResult = { ok: boolean; message: string };

export async function setAvailableNow(on: boolean): Promise<AvailableNowResult> {
  const viewer = await requireTherapist("/");
  const { profile } = await getOrCreateMyProfile(viewer.user.id);

  if (!on) {
    await updateMyProfile(viewer.user.id, {
      available_now: false,
      available_now_expires: null,
    });
    revalidatePath("/", "layout");
    return { ok: true, message: "You are no longer shown as available." };
  }

  const tier = resolveTier({
    subscription_tier: profile.subscription_tier,
    subscription_status: profile.subscription_status,
    tier_granted_until:
      (profile as { tier_granted_until?: string | null }).tier_granted_until ?? null,
  });

  if (accessTo("available-now", tier) !== "full") {
    return { ok: false, message: "Available Now comes with Standard and above." };
  }

  const hours = planFor(tier).availableNowHours;
  if (hours <= 0) {
    return { ok: false, message: "Your plan does not include Available Now." };
  }

  // Re-read rather than trust the client: a second tab could already have
  // started a window, and restarting it would silently extend the claim.
  if (
    isAvailableNow(
      profile as { available_now?: boolean | null; available_now_expires?: string | null },
    )
  ) {
    return { ok: false, message: "You are already shown as available." };
  }

  const endsAt = availableNowEndsAt(hours);
  const written = await updateMyProfile(viewer.user.id, {
    available_now: true,
    available_now_expires: endsAt.toISOString(),
  });

  if (written === 0) return { ok: false, message: "That did not save. Please sign in again." };

  // The directory caches; without this the badge would lag the claim.
  revalidatePath("/", "layout");
  return { ok: true, message: `You are shown as available for the next ${hours}h.` };
}
