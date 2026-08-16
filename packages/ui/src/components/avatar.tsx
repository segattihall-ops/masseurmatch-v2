import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn";

/**
 * Avatar — circular therapist/user portrait.
 *
 * Renders a plain `<img>` so the component stays framework-agnostic and safe
 * inside server components. Pass `next/image` output through `children` when a
 * screen needs the Next image pipeline.
 *
 * When `src` is omitted the initials fallback is rendered on the soft brand
 * tint, matching the placeholder treatment used across the directory.
 */
const avatarVariants = cva(
  [
    "relative inline-flex shrink-0 items-center justify-center overflow-hidden",
    "rounded-full border border-border bg-brand-soft align-middle",
    "font-display font-semibold uppercase tracking-tight text-brand-secondary",
    "shadow-soft",
  ],
  {
    variants: {
      size: {
        sm: "h-8 w-8 text-[0.625rem]",
        md: "h-10 w-10 text-xs",
        lg: "h-14 w-14 text-sm",
        xl: "h-20 w-20 text-lg",
        "2xl": "h-28 w-28 text-2xl",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

/** Take up to two initials from a display name. */
function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export interface AvatarProps
  extends
    Omit<React.HTMLAttributes<HTMLSpanElement>, "children">,
    VariantProps<typeof avatarVariants> {
  /** Image URL. When absent, initials are shown instead. */
  src?: string | null;
  /** Display name — drives the initials fallback and the image alt text. */
  name?: string;
  /** Overrides the alt text derived from `name`. */
  alt?: string;
  /** Explicit fallback content, e.g. an icon. Takes precedence over initials. */
  fallback?: React.ReactNode;
}

export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { className, size, src, name = "", alt, fallback, ...props },
  ref,
) {
  const initials = initialsFrom(name);

  return (
    <span ref={ref} className={cn(avatarVariants({ size }), className)} {...props}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : (
        <span aria-hidden={initials.length === 0 ? undefined : true}>{fallback ?? initials}</span>
      )}
    </span>
  );
});

export { avatarVariants };
