/**
 * MasseurMatch design tokens.
 *
 * Single source of truth for the visual identity, extracted verbatim from the
 * legacy site (Agencee template adaptation). These values are mirrored as CSS
 * custom properties in `src/styles/tokens.css` and wired into Tailwind through
 * `src/tailwind/preset.ts` — do not introduce new values here without a design
 * decision, the intent is to preserve the existing look pixel for pixel.
 */

/** Raw brand palette — sober red / black / white. */
export const palette = {
  /** Near-black used for headings, dark surfaces and secondary actions. */
  ink: "#111111",
  ink2: "#1F1F1F",
  ink3: "#2B2B2B",
  /** Signature deep red. */
  wine: "#8B1E2D",
  wineDark: "#6E1521",
  wineDarker: "#5A1019",
  wineBright: "#A52538",
  wineSoft: "#F8EDEE",
  white: "#FFFFFF",
  offWhite: "#F7F7F7",
  greyText: "#6F6F6F",
  greyMuted: "#8E8E8E",
  borderSubtle: "#E8E8E8",
  borderStrong: "#D9D9D9",
  success: "#1E7A46",
  error: "#DC2626",
  warning: "#F97316",
} as const;

/** Semantic colour roles. Prefer these over `palette` in components. */
export const colors = {
  brand: {
    primary: palette.ink,
    deep: palette.ink,
    secondary: palette.wine,
    electric: palette.wineBright,
    accent: palette.wine,
    soft: palette.wineSoft,
    gold: palette.wine,
  },
  bg: {
    body: palette.white,
    surface: palette.white,
    subtle: palette.offWhite,
    dynamic: "#FAFAFA",
  },
  text: {
    primary: palette.ink,
    secondary: palette.greyText,
    /**
     * De-emphasised text — LARGE SIZES ONLY.
     *
     * `greyMuted` is #8E8E8E, which is 3.28:1 on white and 3.06:1 on
     * `offWhite`. WCAG AA needs 4.5:1 for normal text and 3:1 for large
     * (>=24px, or >=18.66px bold), so this token passes only for large text
     * and fails everywhere else — Lighthouse has caught it twice.
     *
     * There is no lighter alternative: 4.5:1 on `offWhite` requires #717171 or
     * darker, which is indistinguishable from `secondary` (#6F6F6F). So the
     * rule is the rule rather than a new token — use `text.secondary` for
     * body-size de-emphasised text.
     */
    muted: palette.greyMuted,
    inverse: palette.white,
  },
  border: {
    subtle: palette.borderSubtle,
    strong: palette.borderStrong,
  },
  action: {
    primary: palette.wine,
    primaryHover: palette.wineDark,
    primaryActive: palette.wineDarker,
    secondary: palette.ink,
    secondaryHover: palette.ink3,
  },
  feedback: {
    success: palette.success,
    error: palette.error,
    warning: palette.warning,
  },
} as const;

/**
 * shadcn-compatible HSL channel triplets (no `hsl()` wrapper) consumed as
 * `hsl(var(--token))`. Kept byte-identical to the legacy theme.
 */
export const hslTokens = {
  background: "0 0% 100%",
  foreground: "0 0% 7%",
  card: "0 0% 100%",
  "card-foreground": "0 0% 7%",
  popover: "0 0% 100%",
  "popover-foreground": "0 0% 7%",
  primary: "350 64% 33%",
  "primary-foreground": "0 0% 100%",
  secondary: "0 0% 97%",
  "secondary-foreground": "0 0% 7%",
  muted: "0 0% 97%",
  "muted-foreground": "0 0% 44%",
  accent: "350 64% 33%",
  "accent-foreground": "0 0% 100%",
  destructive: "0 73% 52%",
  "destructive-foreground": "0 0% 100%",
  border: "0 0% 91%",
  input: "0 0% 85%",
  ring: "350 64% 33%",
  success: "152 60% 30%",
  "success-foreground": "0 0% 100%",
  warning: "24 95% 53%",
  "warning-foreground": "0 0% 100%",
} as const;

/** Status badge tokens (verified / available / offer / promo). */
export const badgeTokens = {
  "badge-verified": "152 60% 30%",
  "badge-verified-light": "152 45% 93%",
  "badge-verified-border": "152 60% 60%",
  "badge-available": "152 60% 30%",
  "badge-available-light": "152 45% 93%",
  "badge-available-border": "152 60% 60%",
  "badge-offer": "350 64% 33%",
  "badge-offer-light": "350 60% 95%",
  "badge-offer-border": "350 60% 65%",
  "badge-promo": "24 95% 53%",
  "badge-promo-light": "24 95% 93%",
  "badge-promo-border": "24 95% 70%",
} as const;

/** Dark sidebar surface used by the dashboard shell. */
export const sidebarTokens = {
  "sidebar-background": "0 0% 7%",
  "sidebar-foreground": "0 0% 100%",
  "sidebar-primary": "350 64% 33%",
  "sidebar-primary-foreground": "0 0% 100%",
  "sidebar-accent": "0 0% 20%",
  "sidebar-accent-foreground": "0 0% 100%",
  "sidebar-border": "0 0% 20%",
  "sidebar-ring": "350 64% 33%",
} as const;

/** 4px-based spacing scale. */
export const spacing = {
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "24px",
  6: "32px",
  7: "40px",
  8: "48px",
  9: "64px",
} as const;

/** Type scale, in px, as used by the legacy site. */
export const fontSize = {
  12: "12px",
  14: "14px",
  16: "16px",
  18: "18px",
  24: "24px",
  32: "32px",
  40: "40px",
  56: "56px",
} as const;

export const lineHeight = {
  tight: "1.05",
  snug: "1.2",
  base: "1.5",
  relaxed: "1.65",
} as const;

/**
 * Corner radii. `base` is the shadcn `--radius`; `sm`–`xl` are the editorial
 * scale used by cards, inputs and hero surfaces.
 */
export const radius = {
  base: "0.75rem",
  sm: "12px",
  md: "18px",
  lg: "24px",
  xl: "28px",
} as const;

export const shadow = {
  xs: "0 4px 6px rgba(17,17,17,0.04)",
  sm: "0 8px 16px rgba(17,17,17,0.06)",
  md: "0 14px 40px rgba(17,17,17,0.08)",
  lg: "0 20px 60px rgba(17,17,17,0.12)",
  xl: "0 28px 80px rgba(17,17,17,0.18)",
  subtle: "0 6px 18px rgba(17,17,17,0.06)",
  card: "0 14px 40px rgb(17 17 17 / 0.08)",
  lift: "0 24px 56px rgb(0 0 0 / 0.1)",
} as const;

export const gradient = {
  brand: "linear-gradient(135deg, #111111 0%, #2B2B2B 38%, #8B1E2D 100%)",
  surface: "linear-gradient(180deg, rgb(255 255 255 / 0.98), rgb(247 247 247 / 0.92))",
  warm: "linear-gradient(135deg, #8B1E2D, #A52538)",
} as const;

/** Focus ring shadow — 3px wine halo at 18% opacity. */
export const focusRing = "0 0 0 3px rgba(139, 30, 45, 0.18)";

/**
 * Easing curves. `smoothOut` is the house curve used by every hover lift and
 * surface transition; `editorial` is reserved for longer reveal animations.
 */
export const easing = {
  smoothOut: [0.16, 1, 0.3, 1],
  editorial: [0.22, 1, 0.36, 1],
} as const;

export const easingCss = {
  smoothOut: "cubic-bezier(0.16, 1, 0.3, 1)",
  editorial: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const;

/** Font stacks. The Satoshi variable face is loaded per-app via next/font. */
export const fontFamily = {
  sans: ["var(--font-satoshi)", "Satoshi", "Arial", "sans-serif"],
  heading: ["var(--font-satoshi)", "Satoshi", "Arial", "sans-serif"],
  display: ["var(--font-satoshi)", "Satoshi", "Arial", "sans-serif"],
  stat: ["var(--font-satoshi)", "Satoshi", "Arial", "sans-serif"],
  serif: ["Georgia", '"Times New Roman"', "serif"],
  mono: ["ui-monospace", "SFMono-Regular", '"Roboto Mono"', "Consolas", "monospace"],
} as const;

export const tokens = {
  palette,
  colors,
  hslTokens,
  badgeTokens,
  sidebarTokens,
  spacing,
  fontSize,
  lineHeight,
  radius,
  shadow,
  gradient,
  focusRing,
  easing,
  easingCss,
  fontFamily,
} as const;

export type Tokens = typeof tokens;
