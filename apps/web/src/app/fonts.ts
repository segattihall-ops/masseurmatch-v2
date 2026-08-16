import localFont from "next/font/local";

/**
 * Satoshi — the single typeface of the MasseurMatch identity.
 *
 * One variable face covering weights 300–900, served from the design system so
 * both apps ship byte-identical fonts. Exposed as `--font-satoshi`, which the
 * design tokens reference for every family (sans, heading, display, stat).
 */
export const satoshi = localFont({
  src: [
    {
      path: "../../../../packages/ui/fonts/Satoshi-Variable.woff2",
      style: "normal",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
  weight: "300 900",
});
