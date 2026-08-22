import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { CURRENT_STATUSES } from "@masseurmatch/db/current-status";
import { describe, expect, it } from "vitest";

import { listingSchema, toProfilePatch } from "@/lib/listing";
import { LIMITS, MASSAGE_TECHNIQUES, OUTCALL_RADII_KM } from "@/lib/listing-options";

/**
 * The listing editor's schema and column mapping.
 *
 * Most of what is asserted here is not "does the code run" but "does it still
 * fix the thing it was written to fix". The legacy editor lost data in five
 * specific ways; each one has a test below, named after it, so a refactor that
 * quietly reintroduces the behaviour fails rather than ships.
 */

/** A listing with only the three fields the provider API insists on. */
const minimal = {
  display_name: "Bruno",
  city: "Dallas",
  phone: "(555) 123-4567",
};

function parse(overrides: Record<string, unknown> = {}) {
  const result = listingSchema.safeParse({ ...minimal, ...overrides });
  if (!result.success) {
    throw new Error(`expected a valid listing: ${JSON.stringify(result.error.issues, null, 2)}`);
  }
  return result.data;
}

const patchFor = (overrides: Record<string, unknown> = {}) => toProfilePatch(parse(overrides));

describe("required fields", () => {
  it("accepts a listing carrying only display name, city and phone", () => {
    expect(listingSchema.safeParse(minimal).success).toBe(true);
  });

  it.each(["display_name", "city", "phone"] as const)("rejects a missing %s", (field) => {
    const input: Record<string, unknown> = { ...minimal };
    delete input[field];
    expect(listingSchema.safeParse(input).success).toBe(false);
  });

  it("does not require a headline, bio or email", () => {
    const patch = patchFor();
    expect(patch.headline).toBeNull();
    expect(patch.email_address).toBeNull();
    expect(patch.bio).toBe("");
  });
});

describe("closed option sets", () => {
  it("rejects a technique that is not on the list", () => {
    expect(
      listingSchema.safeParse({ ...minimal, techniques: ["Percussive Wizardry"] }).success,
    ).toBe(false);
  });

  it("accepts every technique on the list", () => {
    expect(
      listingSchema.safeParse({ ...minimal, techniques: [...MASSAGE_TECHNIQUES] }).success,
    ).toBe(true);
  });

  it("rejects a headline that is not a preset", () => {
    expect(listingSchema.safeParse({ ...minimal, headline: "Vibes Only" }).success).toBe(false);
  });

  it("rejects an availability state the column would refuse", () => {
    expect(listingSchema.safeParse({ ...minimal, current_status: "Booking ahead" }).success).toBe(
      false,
    );
    for (const status of CURRENT_STATUSES) {
      expect(listingSchema.safeParse({ ...minimal, current_status: status }).success).toBe(true);
    }
  });

  it("deduplicates repeated selections", () => {
    expect(patchFor({ techniques: ["Swedish", "Swedish", "Reiki"] }).massage_techniques).toEqual([
      "Swedish",
      "Reiki",
    ]);
  });
});

describe("the 60-minute proportional rule", () => {
  const sessions = (ninetyIncall: string) => ({
    sessions: [
      { minutes: "60", incall: "120", outcall: "160" },
      { minutes: "90", incall: ninetyIncall, outcall: "210" },
    ],
  });

  it("allows a rate at or under the ceiling", () => {
    // 120 * (90/60) * 4/3 = 240
    expect(listingSchema.safeParse({ ...minimal, ...sessions("240") }).success).toBe(true);
  });

  it("rejects a rate above the ceiling and names it", () => {
    const result = listingSchema.safeParse({ ...minimal, ...sessions("241") });
    expect(result.success).toBe(false);
    if (result.success) return;
    const issue = result.error.issues.find((i) => i.path.join(".") === "sessions.1.incall");
    expect(issue?.message).toContain("$240");
  });

  it("does not apply when no 60-minute session is priced", () => {
    const noHour = {
      sessions: [
        { minutes: "90", incall: "900", outcall: "" },
        { minutes: "120", incall: "1200", outcall: "" },
      ],
    };
    expect(listingSchema.safeParse({ ...minimal, ...noHour }).success).toBe(true);
  });

  it("judges in-call and out-call independently", () => {
    const skewed = {
      sessions: [
        { minutes: "60", incall: "120", outcall: "" },
        { minutes: "90", incall: "170", outcall: "9999" },
      ],
    };
    // The out-call column has no priced hour, so its rate is unconstrained.
    expect(listingSchema.safeParse({ ...minimal, ...skewed }).success).toBe(true);
  });

  it("rejects a negative or fractional rate outright", () => {
    for (const incall of ["-50", "12.5", "twelve"]) {
      const result = listingSchema.safeParse({
        ...minimal,
        sessions: [{ minutes: "60", incall, outcall: "" }],
      });
      expect(result.success).toBe(false);
    }
  });
});

describe("derived columns", () => {
  it("fills full_name from display_name", () => {
    expect(patchFor().full_name).toBe("Bruno");
  });

  it("fills phone_number alongside phone", () => {
    const patch = patchFor();
    expect(patch.phone_number).toBe(patch.phone);
  });

  it("derives service_categories from every technique and specialties from the first twelve", () => {
    const techniques = [...MASSAGE_TECHNIQUES].slice(0, 20);
    const patch = patchFor({ techniques });
    expect(patch.service_categories).toEqual(techniques);
    expect(patch.specialties).toHaveLength(12);
    expect(patch.specialties).toEqual(techniques.slice(0, 12));
  });

  it("keeps start_date and start_year in step", () => {
    const patch = patchFor({ career_start_month: "Jan", career_start_year: "2010" });
    expect(patch.start_date).toBe("Jan 2010");
    expect(patch.start_year).toBe(2010);
  });

  it("writes outcall_radius as the number the column stores", () => {
    const patch = patchFor({ offers_outcall: true, outcall_radius: "40" });
    expect(patch.outcall_radius).toBe(40);
    expect(OUTCALL_RADII_KM).toContain(patch.outcall_radius);
  });

  it("clears the radius when out-call is off", () => {
    expect(patchFor({ offers_outcall: false, outcall_radius: "40" }).outcall_radius).toBeNull();
  });
});

/*
 * One test per defect found in the editor the therapists use today. The
 * comment on each says what production does; the assertion says what this
 * build does instead.
 */
describe("defects in the legacy editor", () => {
  it("street intersection: renders two fields and sends neither — here it becomes street_reference", () => {
    const patch = patchFor({ street_1: "8th Avenue", street_2: "W 23rd Street" });
    expect(patch.street_reference).toBe("8th Avenue + W 23rd Street");
  });

  it("street intersection: one street alone still saves", () => {
    expect(patchFor({ street_1: "8th Avenue" }).street_reference).toBe("8th Avenue");
    expect(patchFor().street_reference).toBeNull();
  });

  it("available now: PATCH accepts availableNow and never sets the column — here it is written", () => {
    expect(patchFor({ available_now: true }).available_now).toBe(true);
    expect(patchFor({ available_now: false }).available_now).toBe(false);
  });

  it("bio: only written when non-empty, so it can never be cleared — here an empty bio is an empty bio", () => {
    expect(patchFor({ bio: "Fourteen years on the table." }).bio).toBe(
      "Fourteen years on the table.",
    );
    expect(patchFor({ bio: "" }).bio).toBe("");
    expect(patchFor({ bio: "   " }).bio).toBe("");
  });

  it("status columns: reads visibility_status and writes current_status — here only current_status is written", () => {
    const patch = patchFor({ current_status: "available" });
    expect(patch.current_status).toBe("available");
    expect(patch).not.toHaveProperty("visibility_status");
  });

  it("studio amenities: incall_amenities is left alone rather than mirrored", () => {
    const patch = patchFor({ studio_amenities: ["Shower", "Free Parking"] });
    expect(patch.studio_amenities).toEqual(["Shower", "Free Parking"]);
    expect(patch).not.toHaveProperty("incall_amenities");
  });
});

describe("columns a provider JWT must not claim", () => {
  /*
   * `prevent_sensitive_profile_mutation` rejects an owner update that changes
   * any of these. The patch is applied through the service client, so nothing
   * would stop it at the database — the guard has to be here.
   */
  const guarded = [
    "id",
    "user_id",
    "role",
    "status",
    "profile_status",
    "visibility_status",
    "is_suspended",
    "is_banned",
    "moderation_notes",
    "admin_notes",
    "avatar_url",
    "photo_url",
    "is_verified_identity",
    "is_verified_phone",
    "is_verified_email",
    "is_featured",
    "boost_score",
    "tier",
  ];

  it.each(guarded)("never writes %s", (column) => {
    expect(Object.keys(patchFor())).not.toContain(column);
  });
});

describe("every patch key is a real profiles column", () => {
  /*
   * The generated types are the only source of truth for what exists. A patch
   * naming a column that was renamed — `weight_pounds` for `weight_lb`,
   * `outcall_extras` for `mobile_extras` — fails at write time in production
   * and at no point before it.
   */
  it("matches the generated Database type", () => {
    const types = readFileSync(
      fileURLToPath(new URL("../../../packages/db/types.ts", import.meta.url)),
      "utf8",
    );
    const rows = /\n {6}profiles: \{\n {8}Row: \{\n([\s\S]*?)\n {8}\}\n/.exec(types);
    expect(rows).not.toBeNull();
    const columns = new Set(
      [...(rows?.[1] ?? "").matchAll(/^ {10}([a-z0-9_]+)\??:/gm)].map((m) => m[1]),
    );
    expect(columns.size).toBeGreaterThan(100);

    const unknown = Object.keys(patchFor()).filter((key) => !columns.has(key));
    expect(unknown).toEqual([]);
  });
});

describe("limits", () => {
  it("caps the repeatable collections where the API does", () => {
    const row = { minutes: "60", incall: "100", outcall: "" };
    const tooMany = Array.from({ length: LIMITS.sessions + 1 }, () => row);
    expect(listingSchema.safeParse({ ...minimal, sessions: tooMany }).success).toBe(false);
  });

  it("stops the tagline at the editor limit, not the column limit", () => {
    expect(LIMITS.taglineEditor).toBeLessThan(LIMITS.tagline);
    const long = "x".repeat(LIMITS.taglineEditor + 1);
    expect(listingSchema.safeParse({ ...minimal, tagline: long }).success).toBe(false);
  });

  it("rejects a height or weight outside the recorded range", () => {
    expect(listingSchema.safeParse({ ...minimal, height_in: "35" }).success).toBe(false);
    expect(listingSchema.safeParse({ ...minimal, height_in: "97" }).success).toBe(false);
    expect(listingSchema.safeParse({ ...minimal, weight_lb: "59" }).success).toBe(false);
    expect(listingSchema.safeParse({ ...minimal, weight_lb: "601" }).success).toBe(false);
    expect(listingSchema.safeParse({ ...minimal, height_in: "80", weight_lb: "175" }).success).toBe(
      true,
    );
  });
});
