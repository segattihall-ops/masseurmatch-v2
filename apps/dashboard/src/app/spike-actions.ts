"use server";

import { revalidatePath } from "next/cache";

import { requireTherapist } from "@/lib/guards";
import { getOrCreateMyProfile } from "@/lib/profile";
import { spendSpike } from "@/lib/spikes";

/**
 * Start a visibility Spike.
 *
 * The profile is re-read from the session here rather than taken from the
 * form: a hidden field naming someone else's profile id would otherwise spend
 * their credit and lift their listing.
 *
 * Returns a message instead of throwing. Running out of Spikes is a normal
 * thing to do with the feature, not an error, and an error page is a poor way
 * to say "you have used all six".
 */
export async function startSpike(): Promise<{ ok: boolean; message: string }> {
  const viewer = await requireTherapist("/");
  const { profile } = await getOrCreateMyProfile(viewer.user.id);

  const result = await spendSpike({
    id: profile.id,
    subscription_tier: profile.subscription_tier,
    subscription_status: profile.subscription_status,
    // Both columns arrive only once their migrations have run; until then the
    // profile simply has no grant and no Spike, which is the safe reading.
    tier_granted_until:
      (profile as { tier_granted_until?: string | null }).tier_granted_until ?? null,
    spike_until: (profile as { spike_until?: string | null }).spike_until ?? null,
  });

  if (!result.ok) return { ok: false, message: result.reason };

  // The public directory caches for an hour, and a Spike that takes an hour to
  // show up is not a Spike.
  revalidatePath("/", "layout");

  return { ok: true, message: "Your Spike is live for the next 24 hours." };
}
