import "server-only";

import { createHash } from "node:crypto";

/**
 * Cloudinary signed uploads.
 *
 * The browser never sees `CLOUDINARY_API_SECRET`. The server signs a narrow set
 * of parameters, the browser posts the file straight to Cloudinary with that
 * signature, and Cloudinary rejects anything whose parameters do not match what
 * was signed. That is the whole point of the exchange: bytes never transit our
 * server, but we still decide exactly what may be uploaded and where.
 *
 * `server-only` matters more here than anywhere else in the app — a client
 * import of this module would be a build error rather than a leaked secret.
 */

/** Formats Cloudinary will accept. Anything else is refused at their end. */
export const ALLOWED_FORMATS = ["jpg", "jpeg", "png", "webp", "heic"] as const;

/** Hard ceiling, enforced by Cloudinary because it is inside the signature. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/** Photos allowed per subscription tier. Phase 7 moves this into packages/billing. */
const TIER_PHOTO_LIMITS: Record<string, number> = {
  free: 3,
  standard: 10,
  pro: 20,
  elite: 40,
};

const DEFAULT_PHOTO_LIMIT = 3;

/**
 * How many photos this profile may hold.
 *
 * `profiles.photo_limit` wins when set — it is the per-account override an
 * admin can grant. Otherwise it falls out of the tier.
 */
export function photoLimitFor(tier: string | null, override: number | null): number {
  if (typeof override === "number" && override > 0) return override;
  return TIER_PHOTO_LIMITS[(tier ?? "free").toLowerCase()] ?? DEFAULT_PHOTO_LIMIT;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}. Photo upload is not configured.`);
  return value;
}

export type UploadTicket = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  publicId: string;
  allowedFormats: string;
  maxBytes: number;
  uploadUrl: string;
};

/**
 * Mint a single-use upload ticket for one photo belonging to `userId`.
 *
 * Two constraints are baked into the signature rather than trusted from the
 * client:
 *
 *   folder     — scoped to the user's own id, so a tampered request cannot
 *                write into another therapist's folder.
 *   public_id  — fixed here, so a client cannot overwrite an existing asset by
 *                choosing a name that already exists.
 *
 * `allowed_formats` and `max_bytes` ride along so Cloudinary itself rejects a
 * PDF or an oversized file — the browser is never the thing enforcing them.
 */
export function createUploadTicket(userId: string, nonce: string): UploadTicket {
  const cloudName = requireEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");
  const apiKey = requireEnv("CLOUDINARY_API_KEY");
  const apiSecret = requireEnv("CLOUDINARY_API_SECRET");

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `therapists/${userId}`;
  const publicId = `${folder}/${nonce}`;
  const allowedFormats = ALLOWED_FORMATS.join(",");

  // Cloudinary's rule: every signed parameter except file, cloud_name, api_key
  // and resource_type, sorted by key, joined as k=v with &, then the secret
  // appended, hashed with SHA-1.
  const signedParams: Record<string, string | number> = {
    allowed_formats: allowedFormats,
    folder,
    max_bytes: MAX_UPLOAD_BYTES,
    public_id: publicId,
    timestamp,
  };

  const toSign = Object.keys(signedParams)
    .sort()
    .map((key) => `${key}=${signedParams[key]}`)
    .join("&");

  const signature = createHash("sha1").update(`${toSign}${apiSecret}`).digest("hex");

  return {
    cloudName,
    apiKey,
    timestamp,
    signature,
    folder,
    publicId,
    allowedFormats,
    maxBytes: MAX_UPLOAD_BYTES,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
  };
}

/**
 * Confirm an upload actually exists and belongs to this user.
 *
 * The browser reports back what it uploaded, and a browser's report is not
 * evidence. This asks Cloudinary directly, using Basic auth with the API
 * secret, and additionally checks the asset sits under the caller's own folder
 * — so a forged `public_id` pointing at someone else's photo is rejected even
 * though the asset genuinely exists.
 */
export async function verifyUploadedAsset(
  userId: string,
  publicId: string,
): Promise<{ url: string; bytes: number; format: string }> {
  if (!publicId.startsWith(`therapists/${userId}/`)) {
    throw new Error("That asset does not belong to your profile.");
  }

  const cloudName = requireEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");
  const apiKey = requireEnv("CLOUDINARY_API_KEY");
  const apiSecret = requireEnv("CLOUDINARY_API_SECRET");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload/${encodeURIComponent(publicId)}`,
    {
      headers: {
        Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Could not verify that upload with Cloudinary.");
  }

  const asset = (await response.json()) as {
    secure_url?: string;
    bytes?: number;
    format?: string;
  };

  if (!asset.secure_url) throw new Error("Cloudinary returned no URL for that asset.");
  if ((asset.bytes ?? 0) > MAX_UPLOAD_BYTES) throw new Error("That file is too large.");
  if (!(ALLOWED_FORMATS as readonly string[]).includes(asset.format ?? "")) {
    throw new Error("That file type is not allowed.");
  }

  return { url: asset.secure_url, bytes: asset.bytes ?? 0, format: asset.format ?? "" };
}
