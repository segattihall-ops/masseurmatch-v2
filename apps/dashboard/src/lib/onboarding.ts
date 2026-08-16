import { z } from "zod";

/**
 * Onboarding — schema and step derivation.
 *
 * Shared by client and server: the same `zod` schema validates the form in the
 * browser for fast feedback and again in the server action, which is the only
 * validation that actually counts. No `"use server"` or `server-only` here, so
 * both sides can import it.
 *
 * **Progress is derived, never stored.** There is no `onboarding_step` column,
 * and deliberately so: a step counter and the underlying data are two sources
 * of truth that drift the moment a write half-succeeds or someone edits a row
 * by hand. Reading the furthest complete step from the data cannot drift, and
 * it makes onboarding resumable for free — including for the existing profiles
 * that predate this flow.
 */

const trimmed = z.string().trim();

/** US state code, stored uppercase to match the existing `profiles.state` rows. */
const stateCode = trimmed
  .length(2, "Use the two-letter state code.")
  .transform((s) => s.toUpperCase());

export const basicsSchema = z.object({
  display_name: trimmed.min(2, "Enter the name clients will see.").max(80),
  full_name: trimmed.min(2, "Enter your full legal name.").max(120),
  headline: trimmed.min(10, "Write at least a short headline.").max(140),
  bio: trimmed.min(50, "Tell clients about your practice — at least 50 characters.").max(4000),
  city: trimmed.min(2, "Enter your city.").max(80),
  state: stateCode,
  phone: trimmed
    .min(7, "Enter a contact phone number.")
    .max(32)
    .regex(/^[0-9+()\-.\s]+$/, "Digits and + ( ) - . only."),
  email: trimmed.email("Enter a valid email address."),
});

/** At least one service, and a price that is a real number of dollars. */
const price = z.coerce
  .number({ error: "Enter a number." })
  .int("Whole dollars only.")
  .min(0, "Cannot be negative.")
  .max(10_000, "That looks too high — check the amount.");

export const servicesSchema = z
  .object({
    service_categories: z
      .array(trimmed.min(1))
      .min(1, "Choose at least one service.")
      .max(20, "That is a lot of services — pick your main ones."),
    additional_services: z.array(trimmed.min(1)).max(20).default([]),
    incall_price: price.nullable().default(null),
    outcall_price: price.nullable().default(null),
  })
  .refine((v) => v.incall_price !== null || v.outcall_price !== null, {
    message: "Set at least one rate, incall or outcall.",
    path: ["incall_price"],
  });

export type BasicsInput = z.infer<typeof basicsSchema>;
export type ServicesInput = z.infer<typeof servicesSchema>;

/* ------------------------------------------------------------------------- */

export const ONBOARDING_STEPS = ["basics", "services", "photos", "review"] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export const STEP_LABELS: Record<OnboardingStep, string> = {
  basics: "About you",
  services: "Services and rates",
  photos: "Photos",
  review: "Review and submit",
};

/** The shape step derivation needs — a subset of `profiles`, plus a photo count. */
export type OnboardingSnapshot = {
  display_name: string | null;
  full_name: string | null;
  headline: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  email: string | null;
  service_categories: string[] | null;
  incall_price: number | null;
  outcall_price: number | null;
  photoCount: number;
};

export function isBasicsComplete(p: OnboardingSnapshot): boolean {
  return basicsSchema.safeParse({
    display_name: p.display_name ?? "",
    full_name: p.full_name ?? "",
    headline: p.headline ?? "",
    bio: p.bio ?? "",
    city: p.city ?? "",
    state: p.state ?? "",
    phone: p.phone ?? "",
    email: p.email ?? "",
  }).success;
}

export function isServicesComplete(p: OnboardingSnapshot): boolean {
  return servicesSchema.safeParse({
    service_categories: p.service_categories ?? [],
    additional_services: [],
    incall_price: p.incall_price,
    outcall_price: p.outcall_price,
  }).success;
}

/** At least one photo. The public profile falls back to initials, but a listing without one converts poorly. */
export function isPhotosComplete(p: OnboardingSnapshot): boolean {
  return p.photoCount > 0;
}

/**
 * The first step that is not yet complete — where the therapist should resume.
 *
 * Returns `review` once everything before it is done, which is the submit gate
 * rather than a fifth thing to fill in.
 */
export function currentStep(p: OnboardingSnapshot): OnboardingStep {
  if (!isBasicsComplete(p)) return "basics";
  if (!isServicesComplete(p)) return "services";
  if (!isPhotosComplete(p)) return "photos";
  return "review";
}

/** True when every step before `review` is satisfied, so the profile may be submitted. */
export function canSubmit(p: OnboardingSnapshot): boolean {
  return isBasicsComplete(p) && isServicesComplete(p) && isPhotosComplete(p);
}

/** Per-step completion, for the progress indicator. */
export function stepProgress(p: OnboardingSnapshot): Record<OnboardingStep, boolean> {
  return {
    basics: isBasicsComplete(p),
    services: isServicesComplete(p),
    photos: isPhotosComplete(p),
    review: canSubmit(p),
  };
}

/**
 * Fields that put an already-approved profile back in the moderation queue.
 *
 * Phase 6 consumes this. Anything a visitor reads as a claim about the person —
 * their name, their pitch, their imagery — is re-reviewed. Rates and contact
 * details are not: they change often and carry no moderation risk, so putting
 * them in here would flood the queue with noise and train reviewers to
 * rubber-stamp.
 */
export const SENSITIVE_FIELDS = [
  "display_name",
  "full_name",
  "headline",
  "bio",
  "avatar_url",
  "photo_url",
  "service_categories",
  "additional_services",
] as const;

export type SensitiveField = (typeof SENSITIVE_FIELDS)[number];

/** Which sensitive fields differ between the stored row and an incoming patch. */
export function changedSensitiveFields(
  before: Partial<Record<SensitiveField, unknown>>,
  patch: Partial<Record<SensitiveField, unknown>>,
): SensitiveField[] {
  return SENSITIVE_FIELDS.filter((field) => {
    if (!(field in patch)) return false;
    return JSON.stringify(before[field] ?? null) !== JSON.stringify(patch[field] ?? null);
  });
}
