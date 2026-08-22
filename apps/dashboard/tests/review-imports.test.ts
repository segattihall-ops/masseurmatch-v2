import { describe, expect, it } from "vitest";

import {
  importStatusLabel,
  isOpenImport,
  platformFromUrl,
  reviewImportSchema,
  toMigrationRow,
} from "@/lib/review-imports";

describe("platformFromUrl", () => {
  it("names the site a link points at", () => {
    expect(platformFromUrl("https://www.RentMasseur.com/profile/x?utm=y")).toBe("rentmasseur.com");
    expect(platformFromUrl("  http://example.co.uk/a/b  ")).toBe("example.co.uk");
  });

  it("refuses anything that is not http or https", () => {
    // The value is rendered back to an admin as a link, so a scheme that can
    // execute must never reach the row.
    expect(platformFromUrl("javascript:alert(1)")).toBeNull();
    expect(platformFromUrl("data:text/html,<script>")).toBeNull();
    expect(platformFromUrl("ftp://files.example.com/x")).toBeNull();
  });

  it("refuses what will not parse", () => {
    expect(platformFromUrl("not a url")).toBeNull();
    expect(platformFromUrl("")).toBeNull();
  });
});

describe("reviewImportSchema", () => {
  const valid = {
    source_url: "https://example.com/me",
    platform: "",
    email: "someone@example.com",
    notes: "",
  };

  it("accepts a link and an address", () => {
    expect(reviewImportSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a link that is not a web address", () => {
    const result = reviewImportSchema.safeParse({ ...valid, source_url: "javascript:alert(1)" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty link and an unusable email", () => {
    expect(reviewImportSchema.safeParse({ ...valid, source_url: "  " }).success).toBe(false);
    expect(reviewImportSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
  });

  it("caps the free-text fields", () => {
    expect(reviewImportSchema.safeParse({ ...valid, notes: "x".repeat(1001) }).success).toBe(false);
    expect(
      reviewImportSchema.safeParse({
        ...valid,
        source_url: `https://example.com/${"x".repeat(500)}`,
      }).success,
    ).toBe(false);
  });
});

describe("toMigrationRow", () => {
  it("fills the platform in from the link when it was left blank", () => {
    const request = reviewImportSchema.parse({
      source_url: "https://www.example.com/me",
      platform: "",
      email: "a@b.com",
      notes: "",
    });

    expect(toMigrationRow(request, "profile-1")).toEqual({
      profile_id: "profile-1",
      email: "a@b.com",
      platform: "example.com",
      source_url: "https://www.example.com/me",
      status: "pending",
      migration_notes: null,
    });
  });

  it("keeps a platform the therapist named themselves", () => {
    const request = reviewImportSchema.parse({
      source_url: "https://www.example.com/me",
      platform: "My old salon site",
      email: "a@b.com",
      notes: "Listed under a different name there.",
    });

    const row = toMigrationRow(request, "profile-1");
    expect(row.platform).toBe("My old salon site");
    expect(row.migration_notes).toBe("Listed under a different name there.");
  });
});

describe("importStatusLabel", () => {
  it("says what each known status means", () => {
    expect(importStatusLabel("pending")).toBe("Waiting for review");
    expect(importStatusLabel("in_progress")).toBe("Being imported");
    expect(importStatusLabel("completed")).toBe("Imported");
    expect(importStatusLabel("verified")).toBe("Imported and verified");
    expect(importStatusLabel("rejected")).toBe("Not accepted");
    expect(importStatusLabel("failed")).toBe("Could not be imported");
  });

  it("treats a missing status as received rather than as an error", () => {
    expect(importStatusLabel(null)).toBe("Received");
    expect(importStatusLabel("   ")).toBe("Received");
  });

  it("shows an unrecognised status as itself", () => {
    // The column is free text with no constraint. A status we have not seen is
    // still information, and hiding it makes a stuck request look like none.
    expect(importStatusLabel("awaiting_documents")).toBe("awaiting documents");
  });
});

describe("isOpenImport", () => {
  it("is true only while the request is still moving", () => {
    expect(isOpenImport("pending")).toBe(true);
    expect(isOpenImport("processing")).toBe(true);
    expect(isOpenImport(null)).toBe(true);
    expect(isOpenImport("completed")).toBe(false);
    expect(isOpenImport("rejected")).toBe(false);
  });
});
