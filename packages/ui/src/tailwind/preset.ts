import type { Config } from "tailwindcss";

import {
  easingCss,
  fontFamily,
  fontSize,
  gradient,
  lineHeight,
  radius,
  shadow,
  spacing,
} from "../tokens";

/**
 * Shared Tailwind preset for every MasseurMatch app.
 *
 * Colours resolve through the CSS custom properties declared in
 * `src/styles/tokens.css`, so a token change propagates to Tailwind and to
 * hand-written CSS at once. Apps extend this preset and only add their own
 * `content` globs.
 */

const withOpacity = (variableName: string) => `rgb(var(${variableName}) / <alpha-value>)`;
const hsl = (variableName: string) => `hsl(var(${variableName}))`;

export const preset = {
  content: [],
  theme: {
    extend: {
      colors: {
        background: hsl("--background"),
        foreground: hsl("--foreground"),
        card: {
          DEFAULT: hsl("--card"),
          foreground: hsl("--card-foreground"),
        },
        popover: {
          DEFAULT: hsl("--popover"),
          foreground: hsl("--popover-foreground"),
        },
        primary: {
          DEFAULT: hsl("--primary"),
          foreground: hsl("--primary-foreground"),
        },
        secondary: {
          DEFAULT: hsl("--secondary"),
          foreground: hsl("--secondary-foreground"),
        },
        muted: {
          DEFAULT: hsl("--muted"),
          foreground: hsl("--muted-foreground"),
        },
        accent: {
          DEFAULT: hsl("--accent"),
          foreground: hsl("--accent-foreground"),
        },
        destructive: {
          DEFAULT: hsl("--destructive"),
          foreground: hsl("--destructive-foreground"),
        },
        border: {
          DEFAULT: hsl("--border"),
          subtle: withOpacity("--color-border-subtle-rgb"),
          strong: withOpacity("--color-border-strong-rgb"),
        },
        input: hsl("--input"),
        ring: hsl("--ring"),
        success: {
          DEFAULT: hsl("--success"),
          foreground: hsl("--success-foreground"),
        },
        warning: {
          DEFAULT: hsl("--warning"),
          foreground: hsl("--warning-foreground"),
        },
        sidebar: {
          DEFAULT: hsl("--sidebar-background"),
          foreground: hsl("--sidebar-foreground"),
          primary: hsl("--sidebar-primary"),
          "primary-foreground": hsl("--sidebar-primary-foreground"),
          accent: hsl("--sidebar-accent"),
          "accent-foreground": hsl("--sidebar-accent-foreground"),
          border: hsl("--sidebar-border"),
          ring: hsl("--sidebar-ring"),
        },
        badge: {
          verified: hsl("--badge-verified"),
          "verified-light": hsl("--badge-verified-light"),
          "verified-border": hsl("--badge-verified-border"),
          available: hsl("--badge-available"),
          "available-light": hsl("--badge-available-light"),
          "available-border": hsl("--badge-available-border"),
          offer: hsl("--badge-offer"),
          "offer-light": hsl("--badge-offer-light"),
          "offer-border": hsl("--badge-offer-border"),
          promo: hsl("--badge-promo"),
          "promo-light": hsl("--badge-promo-light"),
          "promo-border": hsl("--badge-promo-border"),
        },
        brand: {
          primary: withOpacity("--color-brand-primary-rgb"),
          deep: withOpacity("--color-brand-deep-navy-rgb"),
          secondary: withOpacity("--color-brand-secondary-rgb"),
          electric: withOpacity("--color-brand-electric-rgb"),
          accent: withOpacity("--color-brand-accent-rgb"),
          soft: withOpacity("--color-brand-soft-accent-rgb"),
          gold: withOpacity("--color-brand-gold-rgb"),
        },
        bg: {
          body: withOpacity("--color-bg-body-rgb"),
          surface: withOpacity("--color-bg-surface-rgb"),
          subtle: withOpacity("--color-bg-subtle-rgb"),
          primary: withOpacity("--color-background-primary-rgb"),
        },
        text: {
          primary: withOpacity("--color-text-primary-rgb"),
          secondary: withOpacity("--color-text-secondary-rgb"),
          muted: withOpacity("--color-text-muted-rgb"),
          inverse: withOpacity("--color-text-inverse-rgb"),
        },
        action: {
          primary: withOpacity("--color-action-primary-rgb"),
          "primary-hover": withOpacity("--color-action-primary-hover-rgb"),
          secondary: withOpacity("--color-action-secondary-rgb"),
          "secondary-hover": withOpacity("--color-action-secondary-hover-rgb"),
        },
        feedback: {
          success: withOpacity("--color-feedback-success-rgb"),
          error: withOpacity("--color-feedback-error-rgb"),
          warning: withOpacity("--color-feedback-warning-rgb"),
        },
      },
      fontFamily: {
        sans: [...fontFamily.sans],
        heading: [...fontFamily.heading],
        display: [...fontFamily.display],
        stat: [...fontFamily.stat],
        serif: [...fontFamily.serif],
        mono: [...fontFamily.mono],
      },
      fontSize: {
        "ds-12": [fontSize[12], { lineHeight: lineHeight.base }],
        "ds-14": [fontSize[14], { lineHeight: lineHeight.base }],
        "ds-16": [fontSize[16], { lineHeight: lineHeight.base }],
        "ds-18": [fontSize[18], { lineHeight: lineHeight.relaxed }],
        "ds-24": [fontSize[24], { lineHeight: lineHeight.snug }],
        "ds-32": [fontSize[32], { lineHeight: lineHeight.snug }],
        "ds-40": [fontSize[40], { lineHeight: lineHeight.tight }],
        "ds-56": [fontSize[56], { lineHeight: lineHeight.tight }],
      },
      lineHeight: {
        tight: lineHeight.tight,
        snug: lineHeight.snug,
        base: lineHeight.base,
        relaxed: lineHeight.relaxed,
      },
      spacing: {
        "ds-1": spacing[1],
        "ds-2": spacing[2],
        "ds-3": spacing[3],
        "ds-4": spacing[4],
        "ds-5": spacing[5],
        "ds-6": spacing[6],
        "ds-7": spacing[7],
        "ds-8": spacing[8],
        "ds-9": spacing[9],
      },
      borderRadius: {
        // Matches the legacy scale: xl = 20px, 2xl = 28px.
        xl: "1.25rem",
        "2xl": "1.75rem",
        "ds-sm": radius.sm,
        "ds-md": radius.md,
        "ds-lg": radius.lg,
        "ds-xl": radius.xl,
      },
      boxShadow: {
        soft: "var(--shadow-subtle)",
        brand: "var(--shadow-card)",
        "ds-xs": shadow.xs,
        "ds-sm": shadow.sm,
        "ds-md": shadow.md,
        "ds-lg": shadow.lg,
        "ds-xl": shadow.xl,
        lift: shadow.lift,
        focus: "var(--focus-ring)",
      },
      backgroundImage: {
        "gradient-brand": gradient.brand,
        "gradient-surface": gradient.surface,
        "gradient-warm": gradient.warm,
      },
      transitionTimingFunction: {
        "smooth-out": easingCss.smoothOut,
        editorial: easingCss.editorial,
      },
      transitionDuration: {
        600: "600ms",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        blob: {
          "0%": { transform: "translateY(0px) scale(1)" },
          "33%": { transform: "translateY(-20px) scale(1.08)" },
          "66%": { transform: "translateY(10px) scale(0.98)" },
          "100%": { transform: "translateY(0px) scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        blob: "blob 7s infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default preset;
