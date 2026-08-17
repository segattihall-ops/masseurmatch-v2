"use server";

import { parseTravelSchedule, travelEntryKey, type TravelEntry } from "@masseurmatch/db/travel";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTherapist } from "@/lib/guards";
import { getOrCreateMyProfile, updateMyProfile } from "@/lib/profile";

/**
 * Adding and removing legs of a travel schedule.
 *
 * `profiles.travel_schedule` is a single `jsonb` array rather than a table, so
 * every write is a read-modify-write of the whole column. That is a lost-update
 * race if a therapist has two tabs open — the second write wins and the first
 * trip vanishes. Accepted deliberately: the alternative is a new table and a
 * new set of policies for something one person edits a few times a year, and
 * the failure is a re-entered trip rather than a wrong charge.
 *
 * Entries are re-parsed through `parseTravelSchedule` on the way out, so a
 * malformed row already sitting in the column is dropped by the next save
 * instead of being faithfully written back.
 */

/** How many legs one schedule may hold. */
const MAX_ENTRIES = 20;

const DATE = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date.");

const entrySchema = z
  .object({
    city: z.string().trim().min(2, "Enter the city you are visiting.").max(80),
    state: z
      .string()
      .trim()
      .length(2, "Use the two-letter state code.")
      .transform((s) => s.toUpperCase()),
    start_date: DATE,
    end_date: DATE,
  })
  .refine((v) => v.end_date >= v.start_date, {
    message: "The last day cannot be before the first.",
    path: ["end_date"],
  });

export type TravelState = { ok?: true; error?: string; fieldErrors?: Record<string, string[]> };

async function currentSchedule(userId: string): Promise<{ id: string; entries: TravelEntry[] }> {
  const { profile } = await getOrCreateMyProfile(userId);
  const raw = (profile as { travel_schedule?: unknown }).travel_schedule;
  return { id: profile.id, entries: parseTravelSchedule(raw) };
}

async function save(userId: string, entries: TravelEntry[]): Promise<TravelState> {
  const written = await updateMyProfile(userId, { travel_schedule: entries });
  if (written === 0) return { error: "That change was not saved. Please sign in again." };

  // The tour page and the directory badge both read this column, and both are
  // cached. Without this the trip would not appear until the window elapsed.
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function addTravel(_prev: TravelState, formData: FormData): Promise<TravelState> {
  const viewer = await requireTherapist("/");

  const parsed = entrySchema.safeParse({
    city: formData.get("city"),
    state: formData.get("state"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
  });

  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(
      Object.entries(parsed.error.flatten().fieldErrors).filter((e): e is [string, string[]] =>
        Boolean(e[1]),
      ),
    );
    return { fieldErrors };
  }

  const { entries } = await currentSchedule(viewer.user.id);

  if (entries.length >= MAX_ENTRIES) {
    return { error: `You can have ${MAX_ENTRIES} trips saved at once. Remove one first.` };
  }

  const entry: TravelEntry = parsed.data;
  if (entries.some((e) => travelEntryKey(e) === travelEntryKey(entry))) {
    return { error: "That trip is already on your schedule." };
  }

  return save(viewer.user.id, [...entries, entry]);
}

export async function removeTravel(key: string): Promise<TravelState> {
  const viewer = await requireTherapist("/");
  const { entries } = await currentSchedule(viewer.user.id);

  const kept = entries.filter((e) => travelEntryKey(e) !== key);
  // Removing something that is already gone is not an error worth showing —
  // a double-clicked button would otherwise report a failure for doing exactly
  // what was asked.
  if (kept.length === entries.length) return { ok: true };

  return save(viewer.user.id, kept);
}
