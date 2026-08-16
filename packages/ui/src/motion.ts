/**
 * Centralised motion vocabulary.
 *
 * Pure data — this module imports only *types* from framer-motion, so it stays
 * free of `"use client"` and can be imported from server components. The
 * runtime lives exclusively in the wrappers under `src/components/motion/`.
 *
 * Every variant here is written so that a reduced-motion consumer can simply
 * animate to the `animate` state without a transform offset; the wrappers do
 * that via `useReducedMotion()` and `<MotionConfig reducedMotion="user">`.
 */
import type { Transition, Variants } from "framer-motion";

import { easing } from "./tokens";

/** House easing curve — the same cubic-bezier used by CSS transitions. */
export const EASE_SMOOTH_OUT = easing.smoothOut;
/** Longer, more theatrical curve for editorial reveals. */
export const EASE_EDITORIAL = easing.editorial;

/** Duration scale, in seconds. */
export const duration = {
  instant: 0.12,
  fast: 0.18,
  base: 0.32,
  slow: 0.55,
  reveal: 0.9,
} as const;

export const transition = {
  fast: { duration: duration.fast, ease: EASE_SMOOTH_OUT },
  base: { duration: duration.base, ease: EASE_SMOOTH_OUT },
  slow: { duration: duration.slow, ease: EASE_SMOOTH_OUT },
  editorial: { duration: duration.reveal, ease: EASE_EDITORIAL },
} satisfies Record<string, Transition>;

/** Distance, in px, that elements travel on a directional fade. */
export const OFFSET = 22;

export type FadeDirection = "up" | "down" | "left" | "right" | "none";

const offsetFor = (direction: FadeDirection) => {
  switch (direction) {
    case "up":
      return { y: OFFSET, x: 0 };
    case "down":
      return { y: -OFFSET, x: 0 };
    case "left":
      return { x: OFFSET, y: 0 };
    case "right":
      return { x: -OFFSET, y: 0 };
    case "none":
      return { x: 0, y: 0 };
  }
};

/**
 * Build fade variants for a direction. `reduced` drops the translation so the
 * element only cross-fades — never returns an empty animation, which keeps
 * `onAnimationComplete` and exit transitions working.
 */
export function fadeVariants(direction: FadeDirection = "up", reduced = false): Variants {
  const offset = reduced ? { x: 0, y: 0 } : offsetFor(direction);
  return {
    hidden: { opacity: 0, ...offset },
    visible: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, ...offset },
  };
}

/** Default fade-up variants. */
export const fadeIn: Variants = fadeVariants("up");

/** Subtle scale-in used by dialogs, popovers and hero media. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.97 },
};

/** Container that reveals its children one after the other. */
export function staggerContainer(stagger = 0.08, delayChildren = 0): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren },
    },
    exit: {
      transition: { staggerChildren: stagger / 2, staggerDirection: -1 },
    },
  };
}

/** Child of a `staggerContainer`. */
export const staggerItem: Variants = fadeVariants("up");

/**
 * Route-level transition. Deliberately small (opacity + 4px) so navigation
 * feels immediate rather than animated.
 */
export const pageTransition: Variants = {
  hidden: { opacity: 0.98, y: 4 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};

/** Default viewport config for scroll-triggered reveals. */
export const viewportOnce = { once: true, amount: 0.2 } as const;

export const variants = {
  fadeIn,
  scaleIn,
  staggerItem,
  pageTransition,
} as const;
