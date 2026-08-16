import { describe, expect, it } from "vitest";

import {
  basicsSchema,
  canSubmit,
  changedSensitiveFields,
  currentStep,
  servicesSchema,
  stepProgress,
  type OnboardingSnapshot,
} from "@/lib/onboarding";

/**
 * Onboarding logic.
 *
 * Pure functions, so these run in CI without database credentials — unlike the
 * RLS suite in packages/db, which skips when unconfigured. That matters here:
 * step derivation is what makes onboarding resumable, and a regression in it
 * would silently drop a therapist back to the start.
 */

const empty: OnboardingSnapshot = {
  display_name: null,
  full_name: null,
  headline: null,
  bio: null,
  city: null,
  state: null,
  phone: null,
  email: null,
  service_categories: null,
  incall_price: null,
  outcall_price: null,
  photoCount: 0,
};

const withBasics: OnboardingSnapshot = {
  ...empty,
  display_name: "Andrey",
  full_name: "Andrey Silva",
  headline: "Deep tissue and sports massage in Manhattan",
  bio: "x".repeat(60),
  city: "New York",
  state: "NY",
  phone: "+1 212 555 0100",
  email: "andrey@example.com",
};

const withServices: OnboardingSnapshot = {
  ...withBasics,
  service_categories: ["Deep tissue"],
  incall_price: 150,
};

const complete: OnboardingSnapshot = { ...withServices, photoCount: 2 };

describe("step derivation", () => {
  it("starts a brand new profile at basics", () => {
    expect(currentStep(empty)).toBe("basics");
  });

  it("advances one step at a time as data lands", () => {
    expect(currentStep(withBasics)).toBe("services");
    expect(currentStep(withServices)).toBe("photos");
    expect(currentStep(complete)).toBe("review");
  });

  it("is a pure function of the data, so resuming cannot drift", () => {
    // The same snapshot must always resolve to the same step — this is the
    // property that replaces a stored onboarding_step column.
    expect(currentStep(withServices)).toBe(currentStep({ ...withServices }));
  });

  it("does not let an incomplete profile be submitted", () => {
    expect(canSubmit(empty)).toBe(false);
    expect(canSubmit(withBasics)).toBe(false);
    expect(canSubmit(withServices)).toBe(false);
    expect(canSubmit(complete)).toBe(true);
  });

  it("reports per-step progress for the indicator", () => {
    expect(stepProgress(withServices)).toEqual({
      basics: true,
      services: true,
      photos: false,
      review: false,
    });
  });

  it("treats a profile with no photo as incomplete", () => {
    expect(currentStep({ ...complete, photoCount: 0 })).toBe("photos");
  });
});

describe("basics validation", () => {
  it("accepts a filled-in step and uppercases the state", () => {
    const parsed = basicsSchema.safeParse({ ...withBasics, state: "ny" });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.state).toBe("NY");
  });

  it("rejects a too-short bio", () => {
    const parsed = basicsSchema.safeParse({ ...withBasics, bio: "too short" });
    expect(parsed.success).toBe(false);
  });

  it("rejects a malformed email", () => {
    expect(basicsSchema.safeParse({ ...withBasics, email: "nope" }).success).toBe(false);
  });

  it("rejects letters in the phone number", () => {
    expect(basicsSchema.safeParse({ ...withBasics, phone: "call me" }).success).toBe(false);
  });
});

describe("services validation", () => {
  const base = { service_categories: ["Deep tissue"], additional_services: [] };

  it("requires at least one rate", () => {
    const parsed = servicesSchema.safeParse({
      ...base,
      incall_price: null,
      outcall_price: null,
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts an outcall-only therapist", () => {
    expect(
      servicesSchema.safeParse({ ...base, incall_price: null, outcall_price: 200 }).success,
    ).toBe(true);
  });

  it("requires at least one service", () => {
    expect(
      servicesSchema.safeParse({ ...base, service_categories: [], incall_price: 150 }).success,
    ).toBe(false);
  });

  it("coerces the numeric strings a form actually submits", () => {
    const parsed = servicesSchema.safeParse({ ...base, incall_price: "150", outcall_price: null });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.incall_price).toBe(150);
  });

  it("rejects a negative rate", () => {
    expect(servicesSchema.safeParse({ ...base, incall_price: -1 }).success).toBe(false);
  });
});

describe("sensitive-field detection", () => {
  const before = {
    display_name: "Andrey",
    bio: "Original bio",
    service_categories: ["Deep tissue"],
  };

  it("flags a changed bio", () => {
    expect(changedSensitiveFields(before, { bio: "Rewritten" })).toEqual(["bio"]);
  });

  it("ignores a field that was not submitted", () => {
    expect(changedSensitiveFields(before, {})).toEqual([]);
  });

  it("ignores a resubmitted identical value", () => {
    expect(changedSensitiveFields(before, { bio: "Original bio" })).toEqual([]);
  });

  it("compares arrays by value, not identity", () => {
    expect(changedSensitiveFields(before, { service_categories: ["Deep tissue"] })).toEqual([]);
    expect(changedSensitiveFields(before, { service_categories: ["Swedish"] })).toEqual([
      "service_categories",
    ]);
  });

  it("does not flag rates or contact details", () => {
    // These change often and carry no moderation risk. Flagging them would
    // flood the phase 6 queue and train reviewers to rubber-stamp.
    expect(changedSensitiveFields(before, { incall_price: 999 } as never)).toEqual([]);
  });

  it("reports every changed field at once", () => {
    expect(changedSensitiveFields(before, { bio: "New", display_name: "Andre" }).sort()).toEqual([
      "bio",
      "display_name",
    ]);
  });
});
