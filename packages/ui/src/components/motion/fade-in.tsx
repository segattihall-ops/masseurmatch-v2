"use client";

import * as React from "react";
import { m, useReducedMotion, type Transition } from "framer-motion";

import { cn } from "../../lib/cn";
import {
  duration,
  EASE_SMOOTH_OUT,
  fadeVariants,
  viewportOnce,
  type FadeDirection,
} from "../../motion";
import type { MotionSafeHTMLProps } from "./types";

export interface FadeInProps extends MotionSafeHTMLProps<HTMLDivElement> {
  /** Travel direction of the entrance. Defaults to `"up"`. */
  direction?: FadeDirection;
  /** Delay before the animation starts, in seconds. */
  delay?: number;
  /** Animation length, in seconds. */
  durationSeconds?: number;
  /** Animate when the element scrolls into view instead of on mount. */
  whileInView?: boolean;
  /** Replay the reveal every time the element re-enters the viewport. */
  repeat?: boolean;
  /** Element to render. */
  as?: "div" | "section" | "li" | "span";
}

/**
 * FadeIn — the default entrance wrapper.
 *
 * Under `prefers-reduced-motion: reduce` the translation is dropped and the
 * element cross-fades instantly, so content never sits hidden waiting on an
 * animation that will not run.
 */
export const FadeIn = React.forwardRef<HTMLDivElement, FadeInProps>(function FadeIn(
  {
    children,
    className,
    direction = "up",
    delay = 0,
    durationSeconds,
    whileInView = false,
    repeat = false,
    as = "div",
    ...props
  },
  ref,
) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  // All supported tags share the same prop surface; narrowing to one motion
  // component keeps the union from collapsing into an impossible ref type.
  const Component = m[as] as typeof m.div;

  const variants = React.useMemo(
    () => fadeVariants(direction, shouldReduceMotion),
    [direction, shouldReduceMotion],
  );

  const transition: Transition = {
    duration: shouldReduceMotion ? 0 : (durationSeconds ?? duration.base),
    delay: shouldReduceMotion ? 0 : delay,
    ease: EASE_SMOOTH_OUT,
  };

  const animationProps = whileInView
    ? { whileInView: "visible" as const, viewport: repeat ? { amount: 0.2 } : viewportOnce }
    : { animate: "visible" as const };

  return (
    <Component
      ref={ref}
      className={cn(className)}
      initial="hidden"
      variants={variants}
      transition={transition}
      {...animationProps}
      {...props}
    >
      {children}
    </Component>
  );
});
