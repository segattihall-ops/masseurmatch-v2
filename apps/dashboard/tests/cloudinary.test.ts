import { createHash } from "node:crypto";

import { beforeAll, describe, expect, it } from "vitest";

/**
 * Upload signing.
 *
 * This is the one part of phase 5 where a mistake leaks or lets a therapist
 * write into someone else's storage, so it is tested against an independently
 * computed signature rather than a snapshot of our own output — a snapshot
 * would happily lock in a wrong algorithm.
 */

const SECRET = "test-secret-not-a-real-key";

beforeAll(() => {
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = "test-cloud";
  process.env.CLOUDINARY_API_KEY = "test-api-key";
  process.env.CLOUDINARY_API_SECRET = SECRET;
});

async function load() {
  return import("@/lib/cloudinary");
}

describe("photoLimitFor", () => {
  it("falls back to the free tier for an unknown or missing tier", async () => {
    const { photoLimitFor } = await load();
    expect(photoLimitFor(null, null)).toBe(3);
    expect(photoLimitFor("something-new", null)).toBe(3);
  });

  it("reads the tier, case-insensitively", async () => {
    const { photoLimitFor } = await load();
    expect(photoLimitFor("standard", null)).toBe(10);
    expect(photoLimitFor("PRO", null)).toBe(15);
    expect(photoLimitFor("elite", null)).toBe(20);
  });

  it("lets a per-account override win", async () => {
    const { photoLimitFor } = await load();
    expect(photoLimitFor("free", 25)).toBe(25);
  });

  it("ignores a zero or negative override rather than locking the account out", async () => {
    const { photoLimitFor } = await load();
    expect(photoLimitFor("pro", 0)).toBe(15);
    expect(photoLimitFor("pro", -5)).toBe(15);
  });
});

describe("createUploadTicket", () => {
  it("never returns the API secret", async () => {
    const { createUploadTicket } = await load();
    const ticket = createUploadTicket("user-1", "nonce-1");
    expect(JSON.stringify(ticket)).not.toContain(SECRET);
  });

  it("scopes folder and public_id to the user, so one therapist cannot write into another's space", async () => {
    const { createUploadTicket } = await load();
    const ticket = createUploadTicket("user-1", "nonce-1");
    expect(ticket.folder).toBe("therapists/user-1");
    expect(ticket.publicId.startsWith("therapists/user-1/")).toBe(true);

    const other = createUploadTicket("user-2", "nonce-1");
    expect(other.folder).not.toBe(ticket.folder);
  });

  it("produces a signature matching Cloudinary's documented algorithm", async () => {
    const { createUploadTicket, MAX_UPLOAD_BYTES, ALLOWED_FORMATS } = await load();
    const ticket = createUploadTicket("user-1", "nonce-1");

    // Recomputed independently: signed params sorted by key, joined k=v with &,
    // secret appended, SHA-1.
    const expected = createHash("sha1")
      .update(
        [
          `allowed_formats=${ALLOWED_FORMATS.join(",")}`,
          `folder=therapists/user-1`,
          `max_bytes=${MAX_UPLOAD_BYTES}`,
          `public_id=therapists/user-1/nonce-1`,
          `timestamp=${ticket.timestamp}`,
        ].join("&") + SECRET,
      )
      .digest("hex");

    expect(ticket.signature).toBe(expected);
  });

  it("changes the signature when any signed parameter changes", async () => {
    const { createUploadTicket } = await load();
    const a = createUploadTicket("user-1", "nonce-1");
    const b = createUploadTicket("user-1", "nonce-2");
    expect(a.signature).not.toBe(b.signature);
  });

  it("carries the format and size limits, so Cloudinary enforces them rather than the browser", async () => {
    const { createUploadTicket, MAX_UPLOAD_BYTES } = await load();
    const ticket = createUploadTicket("user-1", "nonce-1");
    expect(ticket.maxBytes).toBe(MAX_UPLOAD_BYTES);
    expect(ticket.allowedFormats).toContain("jpg");
    expect(ticket.allowedFormats).not.toContain("pdf");
  });

  it("points at the configured cloud", async () => {
    const { createUploadTicket } = await load();
    expect(createUploadTicket("user-1", "n").uploadUrl).toBe(
      "https://api.cloudinary.com/v1_1/test-cloud/image/upload",
    );
  });
});

describe("verifyUploadedAsset", () => {
  it("refuses a public_id outside the caller's own folder before making any network call", async () => {
    const { verifyUploadedAsset } = await load();
    await expect(verifyUploadedAsset("user-1", "therapists/user-2/stolen")).rejects.toThrow(
      /does not belong/i,
    );
    await expect(verifyUploadedAsset("user-1", "somewhere/else")).rejects.toThrow(
      /does not belong/i,
    );
  });
});
