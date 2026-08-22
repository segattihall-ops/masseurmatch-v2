import { CURRENT_STATUSES } from "@masseurmatch/db/current-status";
import { z } from "zod";

import {
  ADDITIONAL_SERVICES,
  AFFILIATIONS,
  BODY_TYPES,
  CLOCK_HOURS,
  CLOCK_MINUTES,
  DISCOUNT_PERCENTAGES,
  HEADLINES,
  LANGUAGES,
  LIMITS,
  MASSAGE_SETUP,
  MASSAGE_TECHNIQUES,
  MERIDIEM,
  MOBILE_EXTRAS,
  MONTHS,
  OUTCALL_RADII_MILES,
  PAYMENT_METHODS,
  PRODUCTS,
  RATE_DISCLAIMERS,
  REGULAR_DISCOUNTS,
  SCHEDULE_DAYS,
  STUDIO_AMENITIES,
  WEEKDAYS,
  YEARS,
} from "./listing-options";

/**
 * Listing editor — schema and column mapping.
 *
 * Shared by client and server, like `onboarding.ts`: the same schema gives the
 * browser fast feedback and runs again in the server action, which is the only
 * validation that counts. No `"use server"` or `server-only` here.
 *
 * Two things this file is deliberately responsible for.
 *
 * **Closed sets.** Every choice a therapist makes comes from a list in
 * `listing-options.ts`, and the schema checks membership rather than accepting
 * free strings. `profiles` has no CHECK constraint behind most of these
 * columns, so a typo would otherwise be stored and served.
 *
 * **The column mapping.** `toProfilePatch` is the single place that knows which
 * form field lands in which column, including the several that fan out. That
 * matters more than it looks: `public.profiles` carries 181 columns with real
 * duplication in it, and a mapping spread across a component tree is how the
 * legacy editor came to render fields it never saved.
 */

const trimmed = z.string().trim();

/**
 * A value the therapist picked from a closed list.
 *
 * Optional, like every list-backed field in this editor: a therapist who has
 * not chosen a body type has not made an error. The default comes before the
 * check so an omitted key reads as "" rather than as a missing string.
 */
const oneOf = (values: readonly string[], message: string) =>
  trimmed.default("").refine((v) => v === "" || values.includes(v), message);

/** Several values from a closed list, deduplicated. */
const manyOf = (values: readonly string[], message: string) =>
  z
    .array(trimmed)
    .default([])
    .transform((list) => Array.from(new Set(list)))
    .refine((list) => list.every((v) => values.includes(v)), message);

/** An optional free-text field: empty string reads as "cleared", never as "leave alone". */
const optionalText = (max: number) => trimmed.max(max).default("");

const optionalUrl = trimmed
  .max(500)
  .default("")
  .refine(
    (v) => v === "" || /^https?:\/\/\S+\.\S+/.test(v),
    "Start the address with http:// or https://.",
  );

/** Whole dollars, or blank for a length that is not offered. */
const optionalMoney = trimmed
  .default("")
  .refine((v) => v === "" || /^\d+$/.test(v), "Whole dollars only, and never negative.");

const optionalInt = (min: number, max: number, message: string) =>
  trimmed.default("").refine((v) => {
    if (v === "") return true;
    const n = Number(v);
    return Number.isInteger(n) && n >= min && n <= max;
  }, message);

/* ------------------------------------------------------------------------- */
/* Repeatable rows                                                            */
/* ------------------------------------------------------------------------- */

export const sessionSchema = z.object({
  minutes: optionalInt(
    LIMITS.sessionMinutesMin,
    LIMITS.sessionMinutesMax,
    `Session length is ${LIMITS.sessionMinutesMin} to ${LIMITS.sessionMinutesMax} minutes.`,
  ),
  incall: optionalMoney,
  outcall: optionalMoney,
});

export const hoursRangeSchema = z.object({
  days: oneOf(SCHEDULE_DAYS, "Choose a day pattern from the list."),
  from_h: oneOf(CLOCK_HOURS, "Hours run 1 to 12."),
  from_m: oneOf(CLOCK_MINUTES, "Times are on the quarter hour."),
  from_ap: oneOf(MERIDIEM, "AM or PM."),
  to_h: oneOf(CLOCK_HOURS, "Hours run 1 to 12."),
  to_m: oneOf(CLOCK_MINUTES, "Times are on the quarter hour."),
  to_ap: oneOf(MERIDIEM, "AM or PM."),
});

export const educationSchema = z.object({
  degree: optionalText(LIMITS.degree),
  institution: optionalText(LIMITS.institution),
  location: optionalText(LIMITS.educationLocation),
  start_month: oneOf(MONTHS, "Choose a month."),
  start_year: oneOf(YEARS, "Choose a year."),
  end_month: oneOf(MONTHS, "Choose a month."),
  end_year: oneOf(YEARS, "Choose a year."),
});

/* ------------------------------------------------------------------------- */
/* The listing                                                                */
/* ------------------------------------------------------------------------- */

export const listingSchema = z
  .object({
    /* About you */
    display_name: trimmed
      .min(2, "Enter the name clients will see.")
      .max(LIMITS.displayName, `Display name is ${LIMITS.displayName} characters or fewer.`),
    headline: oneOf(HEADLINES, "Choose a headline from the list."),
    tagline: optionalText(LIMITS.taglineEditor),
    bio: optionalText(LIMITS.bio),
    height_in: optionalInt(
      LIMITS.heightInchesMin,
      LIMITS.heightInchesMax,
      `Height is recorded in inches, between ${LIMITS.heightInchesMin} and ${LIMITS.heightInchesMax}.`,
    ),
    weight_lb: optionalInt(
      LIMITS.weightPoundsMin,
      LIMITS.weightPoundsMax,
      `Weight is recorded in pounds, between ${LIMITS.weightPoundsMin} and ${LIMITS.weightPoundsMax}.`,
    ),
    body_type: oneOf(BODY_TYPES, "Choose a body type from the list."),

    /* Location & contact */
    zip: trimmed
      .default("")
      .refine((v) => v === "" || /^\d{5}$/.test(v), "A ZIP code is five digits."),
    city: trimmed.min(2, "Enter the city you work in.").max(80),
    state: trimmed
      .default("")
      .transform((v) => v.toUpperCase())
      .refine((v) => v === "" || /^[A-Z]{2}$/.test(v), "Use the two-letter state code."),
    neighborhood: optionalText(120),
    street_1: optionalText(120),
    street_2: optionalText(120),
    offers_incall: z.boolean().default(false),
    offers_outcall: z.boolean().default(false),
    map_enabled: z.boolean().default(false),
    outcall_radius: trimmed
      .default("")
      .refine(
        (v) => v === "" || (OUTCALL_RADII_MILES as readonly number[]).includes(Number(v)),
        "Choose a radius from the list.",
      ),
    phone: trimmed
      .min(7, "A phone number is required to save a provider profile.")
      .max(32)
      .regex(/^[0-9+()\-.\s]+$/, "Digits and + ( ) - . only."),
    whatsapp: trimmed
      .max(32)
      .default("")
      .refine((v) => v === "" || /^[0-9+()\-.\s]{7,}$/.test(v), "Digits and + ( ) - . only."),
    email: trimmed
      .max(160)
      .default("")
      .refine(
        (v) => v === "" || z.string().email().safeParse(v).success,
        "Enter a valid email address.",
      ),
    show_email: z.boolean().default(false),
    website: optionalUrl,
    booking_url: optionalUrl,
    booking_platform: optionalText(80),

    /* Services */
    techniques: manyOf(MASSAGE_TECHNIQUES, "That is not a technique we offer."),
    massage_setup: manyOf(MASSAGE_SETUP, "That is not a setup option we offer."),
    mobile_extras: manyOf(MOBILE_EXTRAS, "That is not an out-call extra we offer."),
    additional_services: manyOf(ADDITIONAL_SERVICES, "That is not an additional service we offer."),
    studio_amenities: manyOf(STUDIO_AMENITIES, "That is not an amenity we offer."),
    products_used: manyOf(PRODUCTS, "That is not a product we list."),
    products_sold: manyOf(PRODUCTS, "That is not a product we list."),

    /* Rates & payments */
    sessions: z.array(sessionSchema).max(LIMITS.sessions).default([]),
    rate_disclaimers: manyOf(RATE_DISCLAIMERS, "That is not a disclaimer we offer."),
    regular_discounts: manyOf(REGULAR_DISCOUNTS, "That is not a discount we offer."),
    dow_discount_percent: oneOf(DISCOUNT_PERCENTAGES, "Choose a discount from the list."),
    dow_discount_day: oneOf(WEEKDAYS, "Choose a day of the week."),
    payment_methods: manyOf(PAYMENT_METHODS, "That is not a payment method we accept."),

    /* Schedule */
    studio_hours: z.array(hoursRangeSchema).max(LIMITS.scheduleRanges).default([]),
    mobile_hours_same: z.boolean().default(true),
    mobile_hours: z.array(hoursRangeSchema).max(LIMITS.scheduleRanges).default([]),
    available_now: z.boolean().default(false),
    current_status: oneOf(CURRENT_STATUSES, "Choose an availability state from the list."),
    lgbtq_affirming: z.boolean().default(false),

    /* Credentials */
    career_start_month: oneOf(MONTHS, "Choose a month."),
    career_start_year: oneOf(YEARS, "Choose a year."),
    years_experience: optionalInt(
      0,
      LIMITS.yearsExperienceMax,
      `Years of experience is a whole number from 0 to ${LIMITS.yearsExperienceMax}.`,
    ),
    education: z.array(educationSchema).max(LIMITS.education).default([]),
    languages: manyOf(LANGUAGES, "That is not a language we list."),
    affiliations: manyOf(AFFILIATIONS, "That is not an affiliation we list."),
  })
  .superRefine((v, ctx) => {
    /*
     * The hour rule the provider API enforces: once a 60-minute session is
     * priced, no other length may cost more than a third above its
     * proportional share of that hour. Checked per column, because in-call and
     * out-call are priced independently.
     */
    const hour = v.sessions.find((s) => Number(s.minutes) === 60);
    if (!hour) return;

    (["incall", "outcall"] as const).forEach((column) => {
      const base = Number(hour[column]);
      if (!Number.isFinite(base) || base <= 0) return;

      v.sessions.forEach((session, index) => {
        if (session === hour) return;
        const minutes = Number(session.minutes);
        const rate = Number(session[column]);
        if (!Number.isFinite(minutes) || !Number.isFinite(rate) || session[column] === "") return;

        const ceiling = (base * (minutes / 60) * 4) / 3;
        if (rate > ceiling + 0.001) {
          ctx.addIssue({
            code: "custom",
            path: ["sessions", index, column],
            message: `At ${minutes} min this tops out at $${Math.floor(ceiling)}, based on your $${base} hour.`,
          });
        }
      });
    });
  });

export type ListingInput = z.infer<typeof listingSchema>;

/* ------------------------------------------------------------------------- */
/* Column mapping                                                             */
/* ------------------------------------------------------------------------- */

const nullIfBlank = (v: string) => (v === "" ? null : v);
const numberOrNull = (v: string) => (v === "" ? null : Number(v));

/** `"{Headline} by {Display Name}"` — what the listing actually shows. */
export function composeHeadline(input: Pick<ListingInput, "headline" | "display_name">): string {
  const name = input.display_name.trim();
  if (!input.headline) return name;
  return name ? `${input.headline} by ${name}` : input.headline;
}

/** The two street fields, joined the way the column stores them. */
export function composeStreetReference(
  input: Pick<ListingInput, "street_1" | "street_2">,
): string | null {
  const parts = [input.street_1, input.street_2].map((s) => s.trim()).filter(Boolean);
  return parts.length ? parts.join(" + ") : null;
}

const toClock = (h: string, m: string, ap: string) => `${h}:${m} ${ap}`;

const serialiseHours = (ranges: ListingInput["studio_hours"]) =>
  ranges.map((r) => ({
    days: r.days,
    from: toClock(r.from_h, r.from_m, r.from_ap),
    to: toClock(r.to_h, r.to_m, r.to_ap),
  }));

/**
 * Validated input to a `profiles` patch.
 *
 * Every key here is a real column — verified against the generated types, not
 * assumed. Several inputs fan out to more than one column, and each of those is
 * a deliberate choice rather than an accident of history:
 *
 * - `display_name` also fills `full_name`, which the directory reads.
 * - `phone` also fills `phone_number`; both are read in different places and a
 *   half-written pair is how a profile loses its contact number.
 * - `techniques` derives `service_categories` (all of them) and `specialties`
 *   (the first twelve). Neither has a control, in this editor or the legacy one.
 * - `career_start_*` derives `start_date` and `start_year` together, so the
 *   text and the sortable number cannot disagree.
 *
 * Columns deliberately **not** written:
 *
 * - `visibility_status` — platform state, guarded by
 *   `prevent_sensitive_profile_mutation`. The listing toggle owns it.
 * - `incall_amenities` — superseded by `studio_amenities`; mirroring would
 *   create a second source of truth.
 * - `languages`, `whatsapp`, `email`, `starting_price` and the other legacy
 *   twins — this editor writes the current column only. Retiring the twins is
 *   a schema change, not an editor change.
 */
export function toProfilePatch(input: ListingInput) {
  const techniques = input.techniques;

  return {
    /* About you */
    display_name: input.display_name,
    full_name: input.display_name,
    headline: nullIfBlank(input.headline),
    tagline: nullIfBlank(input.tagline),
    /*
     * Written unconditionally, including as an empty string. The legacy PATCH
     * only wrote `bio` when the new value had text, which meant a therapist
     * could never clear one.
     */
    bio: input.bio,
    height_inches: numberOrNull(input.height_in),
    weight_lb: numberOrNull(input.weight_lb),
    body_type: nullIfBlank(input.body_type),

    /* Location */
    zip_code: nullIfBlank(input.zip),
    city: input.city,
    state: nullIfBlank(input.state),
    neighborhood: nullIfBlank(input.neighborhood),
    /* The legacy editor rendered both street fields and sent neither. */
    street_reference: composeStreetReference(input),
    offers_incall: input.offers_incall,
    offers_outcall: input.offers_outcall,
    map_enabled: input.map_enabled,
    /*
     * Written to both radius columns, in miles. They are a legacy pair like
     * `phone`/`phone_number`: neither is read in this repository, the older
     * name carries no unit and the newer one does. Writing them together from
     * one input is the only way they cannot disagree — and any existing row
     * whose `outcall_radius` was populated in some other unit needs a backfill
     * before it can be trusted.
     */
    outcall_radius: input.offers_outcall ? numberOrNull(input.outcall_radius) : null,
    outcall_radius_miles: input.offers_outcall ? numberOrNull(input.outcall_radius) : null,

    /* Contact */
    phone: input.phone,
    phone_number: input.phone,
    whatsapp_number: nullIfBlank(input.whatsapp),
    email_address: nullIfBlank(input.email),
    show_email: input.email === "" ? false : input.show_email,
    website: nullIfBlank(input.website),
    booking_url: nullIfBlank(input.booking_url),
    booking_platform: nullIfBlank(input.booking_platform),

    /* Services */
    massage_techniques: techniques,
    service_categories: techniques,
    specialties: techniques.slice(0, 12),
    massage_setup: input.massage_setup,
    mobile_extras: input.mobile_extras,
    additional_services: input.additional_services,
    studio_amenities: input.studio_amenities,
    products_used: input.products_used,
    products_sold: input.products_sold,

    /* Rates */
    pricing_sessions: input.sessions
      .filter((s) => s.minutes !== "")
      .map((s) => ({
        minutes: Number(s.minutes),
        incall_rate: numberOrNull(s.incall),
        outcall_rate: numberOrNull(s.outcall),
      })),
    rate_disclaimers: input.rate_disclaimers,
    regular_discounts: input.regular_discounts,
    day_of_week_discount:
      input.dow_discount_percent && input.dow_discount_day
        ? { percent: input.dow_discount_percent, day: input.dow_discount_day }
        : null,
    payment_methods: input.payment_methods,

    /* Schedule */
    studio_hours: serialiseHours(input.studio_hours),
    mobile_hours: input.mobile_hours_same ? null : serialiseHours(input.mobile_hours),
    /* The legacy PATCH accepted `availableNow` and never set this column. */
    available_now: input.available_now,
    current_status: nullIfBlank(input.current_status),
    lgbtq_affirming: input.lgbtq_affirming,

    /* Credentials */
    start_date:
      input.career_start_month && input.career_start_year
        ? `${input.career_start_month} ${input.career_start_year}`
        : null,
    start_year: numberOrNull(input.career_start_year),
    years_experience: numberOrNull(input.years_experience),
    education_entries: input.education
      .filter((e) => e.degree !== "")
      .map((e) => ({
        degree: e.degree,
        institution: nullIfBlank(e.institution),
        location: nullIfBlank(e.location),
        start: e.start_month && e.start_year ? `${e.start_month} ${e.start_year}` : null,
        end: e.end_month && e.end_year ? `${e.end_month} ${e.end_year}` : null,
      })),
    languages_spoken: input.languages,
    affiliations: input.affiliations,
  };
}

export type ProfilePatch = ReturnType<typeof toProfilePatch>;
