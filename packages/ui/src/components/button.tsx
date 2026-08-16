import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn";

/**
 * Button — MasseurMatch design system.
 *
 * Token-driven, no arbitrary colour values. Variants and sizes are carried
 * over unchanged from the legacy site so existing screens keep their look.
 *
 * Variants:
 *   primary   — wine CTA (book, search, continue)
 *   secondary — subtle fill, secondary actions
 *   outline   — bordered, tertiary actions
 *   ghost     — icon rows, sidebar items
 *   danger    — destructive actions
 *   link      — inline text action
 *   premium   — gradient CTA reserved for upsell surfaces
 *
 * Sizes: sm 32px · md 40px (default) · lg 48px · xl 56px · icon 40px square.
 */
export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "font-sans font-medium tracking-tight",
    "select-none whitespace-nowrap",
    "transition-all duration-150 ease-smooth-out",
    "focus-visible:outline-none",
    "focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-[var(--color-primary)] text-white",
          "hover:bg-[var(--color-primary-hover)] hover:-translate-y-px hover:shadow-[var(--shadow-md)]",
          "active:translate-y-0 active:shadow-none active:bg-[var(--color-primary-active)]",
        ],
        secondary: [
          "bg-[var(--color-surface-offset)] text-[var(--color-text)]",
          "border border-[var(--color-border)]",
          "hover:bg-[var(--color-surface-dynamic)] hover:border-[var(--color-text-faint)] hover:-translate-y-px hover:shadow-[var(--shadow-subtle)]",
          "active:translate-y-0 active:bg-[var(--color-surface-dynamic)]",
        ],
        outline: [
          "border border-[var(--color-border)] bg-transparent text-[var(--color-text)]",
          "hover:border-[var(--color-text-faint)] hover:bg-[var(--color-surface-offset)] hover:-translate-y-px hover:shadow-[var(--shadow-subtle)]",
          "active:translate-y-0 active:bg-[var(--color-surface-dynamic)]",
        ],
        ghost: [
          "bg-transparent text-[var(--color-text-faint)]",
          "hover:bg-[var(--color-surface-offset)] hover:text-[var(--color-text)] hover:-translate-y-px",
          "active:translate-y-0 active:bg-[var(--color-surface-dynamic)]",
        ],
        danger: [
          "bg-[var(--color-error)] text-white",
          "hover:opacity-90 hover:-translate-y-px hover:shadow-[var(--shadow-md)]",
          "active:translate-y-0 active:opacity-100",
        ],
        link: [
          "bg-transparent text-[var(--color-primary)] underline-offset-4",
          "hover:text-[var(--color-primary-hover)] hover:underline",
        ],
        premium: [
          "bg-[linear-gradient(180deg,hsl(var(--primary)),hsl(var(--primary)/0.85))] text-white",
          "hover:brightness-[1.03] hover:-translate-y-px hover:shadow-[var(--shadow-md)]",
          "active:translate-y-0 active:brightness-100",
        ],
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-md",
        md: "h-10 px-5 text-sm rounded-lg",
        lg: "h-12 px-8 text-base rounded-xl",
        xl: "h-14 px-10 text-base rounded-xl",
        icon: "h-10 w-10 text-sm rounded-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
});
