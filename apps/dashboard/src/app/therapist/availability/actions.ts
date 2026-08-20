"use server";

import { createSessionClient, getViewer } from "@masseurmatch/db/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { StepState } from "@/app/onboarding/form-state";
import { tierHours } from "@/lib/availability";

/**
 * Available Now and the travel schedule.
 *
 * Both write columns the therapist holds an explicit UPDATE grant on
 * (`20260818060000_profiles_column_grants.sql`), through their own session so
 * RLS scopes the row. Tier duration rules mirror production's: the badge is a
 * paid feature, and its length grows with the plan. The rule lives on the
 * server — the client only renders what it is told.
 */

async function requireTherapistId(): Promise<string> {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in?next=%2Ftherapist%2Favailability");
  if (viewer.role !== "provider" && viewer.role !== "admin") redirect("/not-authorized");
  return viewer.user.id;
}

export async function toggleAvailableNow(_prev: StepState, formData: FormData): Promise<StepState> {
  const userId = await requireTherapistId();
  const activate = String(formData.get("activate") ?? "") === "1";

  const supabase = createSessionClient();

  if (!activate) {
    const { error } = await supabase
      .from("profiles")
      .update({ available_now: false, available_now_expires: null })
      .eq("id", userId);
    if (error) return { error: `Could not turn Available Now off: ${error.message}` };
    revalidatePath("/therapist/availability");
    return { ok: true };
  }

  const { data: profile, error: readError } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", userId)
    .maybeSingle();
  if (readError) return { error: `Could not check your plan: ${readError.message}` };

  const hours = tierHours(profile?.subscription_tier);
  if (hours === null) {
    return {
      error: "Available Now is not included in the Free plan. Upgrade to Standard, Pro, or Elite.",
    };
  }

  const expires = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
  const { error } = await supabase
    .from("profiles")
    .update({ available_now: true, available_now_expires: expires })
    .eq("id", userId);
  if (error) return { error: `Could not turn Available Now on: ${error.message}` };

  revalidatePath("/therapist/availability");
  return { ok: true };
}

type TravelEntry = { city: string; state: string; start_date: string; end_date: string };

export async function saveTravelSchedule(_prev: StepState, formData: FormData): Promise<StepState> {
  const userId = await requireTherapistId();

  let entries: TravelEntry[];
  try {
    const raw = JSON.parse(String(formData.get("travel_schedule") ?? "[]"));
    if (!Array.isArray(raw)) throw new Error("not a list");
    entries = raw.map((item) => ({
      city: String(item?.city ?? "").trim(),
      state: String(item?.state ?? "")
        .trim()
        .toUpperCase(),
      start_date: String(item?.start_date ?? ""),
      end_date: String(item?.end_date ?? ""),
    }));
  } catch {
    return { error: "That schedule could not be read. Reload the page and try again." };
  }

  if (entries.length > 20) return { error: "Keep the schedule to 20 trips or fewer." };
  for (const trip of entries) {
    if (!trip.city || !trip.start_date || !trip.end_date) {
      return { error: "Every trip needs a city, a start date, and an end date." };
    }
    if (trip.end_date < trip.start_date) {
      return { error: `The ${trip.city} trip ends before it starts.` };
    }
  }

  const { error } = await createSessionClient()
    .from("profiles")
    .update({ travel_schedule: entries })
    .eq("id", userId);
  if (error) return { error: `Could not save the schedule: ${error.message}` };

  revalidatePath("/therapist/availability");
  return { ok: true };
}
