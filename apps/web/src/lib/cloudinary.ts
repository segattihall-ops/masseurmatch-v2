/**
 * Image helpers.
 *
 * The Cloudinary URL rewriting lives in `cloudinary-loader.ts`, registered
 * globally through `images.loaderFile` in next.config.mjs.
 */

/** True when a value can actually be rendered as an image. */
export function hasImage(src: string | null | undefined): src is string {
  return typeof src === "string" && src.trim().length > 0;
}
