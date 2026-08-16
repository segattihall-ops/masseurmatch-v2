import type { ImageLoaderProps } from "next/image";

/**
 * Global Cloudinary loader for `next/image`.
 *
 * Wired in `next.config.mjs` via `images.loaderFile`. It has to be configured
 * globally rather than passed as a `loader` prop: pages are server components,
 * and a function cannot be serialised across the server/client boundary.
 *
 * Rewrites Cloudinary delivery URLs to request the exact width the layout asks
 * for, in the best format the browser accepts. Any other URL passes through
 * untouched so a stray absolute URL still renders.
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";

/** `.../image/upload/<transforms>/v123/folder/file.jpg` — capture after upload. */
const UPLOAD_SEGMENT = /\/image\/upload\/(?:[^/]+\/)?(v\d+\/.+)$/;

function transforms(width: number, quality?: number): string {
  return ["f_auto", `q_${quality ?? "auto"}`, `w_${width}`, "c_limit"].join(",");
}

export default function cloudinaryLoader({ src, width, quality }: ImageLoaderProps): string {
  const match = src.match(UPLOAD_SEGMENT);
  if (match) {
    const cloud = src.split("/image/upload/")[0];
    return `${cloud}/image/upload/${transforms(width, quality)}/${match[1]}`;
  }

  if (/^https?:\/\//.test(src)) return src;

  if (!CLOUD_NAME) return src;
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms(width, quality)}/${src.replace(/^\//, "")}`;
}
