/**
 * Travel schedules — when a therapist is visiting somewhere other than home.
 *
 * Pure functions over `profiles.travel_schedule`, which is a free-form `jsonb`
 * column. Nothing here touches the database, so the dashboard editor, the
 * directory badge and the public tour page all agree by construction.
 *
 * ---------------------------------------------------------------------------
 * Ported from the old repo, with three fixes
 * ---------------------------------------------------------------------------
 * 1. **Timezone.** The old version compared `Date.parse("2026-09-01")`, which
 *    is midnight *UTC*, against `Date.now()`. For a therapist in UTC-7 a visit
 *    starting today only became "now" at 5pm their time, and one ending today
 *    disappeared 7 hours early. A visit is a range of calendar days, not a range
 *    of instants, so this compares calendar days.
 *
 * 2. **City matching.** The old version compared `entry.city.toLowerCase()`
 *    against a city name in one place and against a URL slug in another, so
 *    "New York" matched on the card and failed on the tour page. Everything here
 *    matches on the slug, using the same `citySlug()` the directory routes use.
 *
 * 3. **Validation.** The old version accepted any object with the right keys.
 *    This is a `jsonb` column that a therapist, an admin CMS and a voice agent
 *    all write to, so entries are parsed defensively: anything malformed is
 *    dropped rather than crashing a public page or, worse, rendering
 *    "Invalid Date" to a visitor.
 */

import { citySlug } from "./actions/directory-config";

/** How far ahead a visit counts as "soon". */
export const VISITING_LOOKAHEAD_DAYS = 14;

/** One leg of a travel schedule, after validation. */
export type TravelEntry = {
  city: string;
  /** Two-letter code, uppercase, or null when the therapist did not say. */
  state: string | null;
  /** `YYYY-MM-DD`, inclusive. */
  start_date: string;
  /** `YYYY-MM-DD`, inclusive — the therapist is there for all of this day. */
  end_date: string;
};

export type TravelStatus = "now" | "soon";

export type TravelVisit = {
  status: TravelStatus;
  entry: TravelEntry;
  /** Whole days until arrival. Zero when the visit is already running. */
  daysUntil: number;
};

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * A calendar day as a comparable integer, `YYYYMMDD`.
 *
 * Comparing days as numbers sidesteps the timezone trap entirely: no instant is
 * constructed, so no offset can shift the answer. `20260901 <= 20260903` is true
 * in every timezone on earth, which is the property the old code lacked.
 */
function dayNumber(iso: string): number | null {
  if (!DATE_ONLY.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  return y * 10_000 + m * 100 + d;
}

/** Today, in the viewer's own timezone, as the same comparable integer. */
function todayNumber(now: Date): number {
  return now.getFullYear() * 10_000 + (now.getMonth() + 1) * 100 + now.getDate();
}

/** Whole days between two `YYYYMMDD` values, via UTC to avoid DST arithmetic. */
function daysBetween(fromDay: number, toDay: number): number {
  const asUtc = (n: number) =>
    Date.UTC(Math.trunc(n / 10_000), (Math.trunc(n / 100) % 100) - 1, n % 100);
  return Math.round((asUtc(toDay) - asUtc(fromDay)) / 86_400_000);
}

function cleanState(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(trimmed) ? trimmed : null;
}

/**
 * Read one entry out of whatever the column happens to hold.
 *
 * Returns null for anything unusable. A schedule is written by the dashboard,
 * by an admin CMS and — in the old system — by a voice agent, so "this shape is
 * guaranteed" is not an assumption worth making on a page visitors can see.
 */
export function parseTravelEntry(value: unknown): TravelEntry | null {
  if (typeof value !== "object" || value === null) return null;
  const raw = value as Record<string, unknown>;

  const city = typeof raw.city === "string" ? raw.city.trim() : "";
  if (city.length === 0) return null;

  const start = typeof raw.start_date === "string" ? raw.start_date.trim() : "";
  const end = typeof raw.end_date === "string" ? raw.end_date.trim() : "";
  const startDay = dayNumber(start);
  const endDay = dayNumber(end);
  if (startDay === null || endDay === null) return null;

  // A backwards range is a data-entry mistake, not a visit. Dropping it beats
  // rendering a trip that ends before it starts.
  if (endDay < startDay) return null;

  return { city, state: cleanState(raw.state), start_date: start, end_date: end };
}

/** Every usable entry, oldest first. Anything malformed is dropped silently. */
export function parseTravelSchedule(value: unknown): TravelEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(parseTravelEntry)
    .filter((e): e is TravelEntry => e !== null)
    .sort((a, b) => a.start_date.localeCompare(b.start_date));
}

function matchesCity(entry: TravelEntry, wantedSlug: string | null): boolean {
  return wantedSlug === null || citySlug(entry.city) === wantedSlug;
}

/**
 * Visits that have not finished yet, soonest first.
 *
 * `cityName` may be a display name or a slug — both are normalised — so callers
 * do not have to know which one they are holding.
 */
export function upcomingVisits(
  schedule: unknown,
  cityName?: string | null,
  now: Date = new Date(),
): TravelEntry[] {
  const today = todayNumber(now);
  const wanted = cityName?.trim() ? citySlug(cityName) : null;

  return parseTravelSchedule(schedule).filter(
    (entry) => matchesCity(entry, wanted) && (dayNumber(entry.end_date) ?? 0) >= today,
  );
}

/**
 * The visit worth showing: one running now, otherwise the next one within the
 * lookahead window. Null when there is nothing to say.
 *
 * A running visit always wins over an upcoming one — "here now" is more useful
 * to a client than "here in nine days", even if the second is in their city and
 * the first is not, which is why the city filter is applied before this choice.
 */
export function travelVisit(
  schedule: unknown,
  cityName?: string | null,
  now: Date = new Date(),
): TravelVisit | null {
  const today = todayNumber(now);
  const visits = upcomingVisits(schedule, cityName, now);

  for (const entry of visits) {
    const start = dayNumber(entry.start_date);
    if (start !== null && start <= today) return { status: "now", entry, daysUntil: 0 };
  }

  const next = visits[0];
  if (!next) return null;

  const start = dayNumber(next.start_date);
  if (start === null) return null;

  const daysUntil = daysBetween(today, start);
  return daysUntil <= VISITING_LOOKAHEAD_DAYS ? { status: "soon", entry: next, daysUntil } : null;
}

/** `Visiting now` / `Visiting in 3 days` — the badge on a directory card. */
export function travelBadge(visit: TravelVisit | null): string | null {
  if (!visit) return null;
  if (visit.status === "now") return "Visiting now";
  if (visit.daysUntil <= 1) return "Visiting tomorrow";
  return `Visiting in ${visit.daysUntil} days`;
}

/**
 * `Sep 1–5, 2026` or `Sep 28 – Oct 2, 2026`.
 *
 * Built from the date parts rather than `toLocaleDateString` on a parsed
 * `Date`, for the same reason the comparisons are: `new Date("2026-09-01")` is
 * UTC midnight, which formats as August 31st for most of the Americas. A visitor
 * being told the wrong month is a worse bug than it looks.
 */
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function formatVisitDates(entry: TravelEntry): string {
  const [sy, sm, sd] = entry.start_date.split("-").map(Number) as [number, number, number];
  const [ey, em, ed] = entry.end_date.split("-").map(Number) as [number, number, number];

  const startMonth = MONTHS[sm - 1] ?? "";
  const endMonth = MONTHS[em - 1] ?? "";

  if (sy === ey && sm === em) return `${startMonth} ${sd}–${ed}, ${ey}`;
  if (sy === ey) return `${startMonth} ${sd} – ${endMonth} ${ed}, ${ey}`;
  return `${startMonth} ${sd}, ${sy} – ${endMonth} ${ed}, ${ey}`;
}

/**
 * A stable identity for one leg of a schedule.
 *
 * Removal keys on this rather than on array position: the list is re-sorted on
 * every parse, so an index captured when the page rendered can point at a
 * different trip by the time the click lands.
 */
export function travelEntryKey(entry: TravelEntry): string {
  return `${entry.start_date}|${entry.end_date}|${entry.city.toLowerCase()}`;
}

/** Where this therapist's tour page for a city lives. */
export function tourPagePath(state: string, city: string, slug: string): string {
  return `/${state.toLowerCase()}/${citySlug(city)}/visiting/${slug}`;
}
