"use client";

import * as React from "react";
import { AnimatePresence, m, useReducedMotion, type Transition } from "framer-motion";

import { cn } from "../../lib/cn";
import { duration, EASE_SMOOTH_OUT, fadeVariants, scaleIn, type FadeDirection } from "../../motion";
import type { MotionSafeHTMLProps } from "./types";

/**
 * AnimatePresence helpers.
 *
 * `AnimatePresence` itself is a client-only component; re-exporting it from
 * this `"use client"` module means server components can compose it without
 * declaring a client boundary of their own.
 */
export { AnimatePresence };

export interface PresenceProps extends MotionSafeHTMLProps<HTMLDivElement> {
  /** Render the child while true; animate it out when it flips to false. */
  show: boolean;
  /** Stable identity for the presence child. */
  presenceKey?: string;
  /** Entrance/exit shape. Defaults to a fade with an upward lift. */
  preset?: "fade" | "scale";
  /** Travel direction when `preset="fade"`. */
  direction?: FadeDirection;
  /** Wait for the outgoing child to finish before mounting the next one. */
  mode?: "sync" | "wait" | "popLayout";
}

/**
 * Presence — conditional mount/unmount with an exit animation.
 *
 * Wraps `AnimatePresence` so callers do not have to remember to key the child
 * or to keep entrance and exit variants in sync.
 */
export const Presence = React.forwardRef<HTMLDivElement, PresenceProps>(function Presence(
  {
    show,
    presenceKey = "presence",
    preset = "fade",
    direction = "up",
    mode = "wait",
    className,
    children,
    ...props
  },
  ref,
) {
  const shouldReduceMotion = useReducedMotion() ?? false;

  const variants = preset === "scale" ? scaleIn : fadeVariants(direction, shouldReduceMotion);

  const transition: Transition = {
    duration: shouldReduceMotion ? 0 : duration.base,
    ease: EASE_SMOOTH_OUT,
  };

  return (
    <AnimatePresence mode={mode} initial={false}>
      {show ? (
        <m.div
          ref={ref}
          key={presenceKey}
          className={cn(className)}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={variants}
          transition={transition}
          {...props}
        >
          {children}
        </m.div>
      ) : null}
    </AnimatePresence>
  );
});

export interface PresenceItemProps extends MotionSafeHTMLProps<HTMLDivElement> {
  /** Stable identity — required so `AnimatePresence` can track the exit. */
  itemKey: string;
  preset?: "fade" | "scale";
  direction?: FadeDirection;
}

/**
 * PresenceItem — a single animated child inside a caller-owned
 * `<AnimatePresence>`, for lists where items are added and removed.
 */
export const PresenceItem = React.forwardRef<HTMLDivElement, PresenceItemProps>(
  function PresenceItem(
    { itemKey, preset = "fade", direction = "up", className, children, ...props },
    ref,
  ) {
    const shouldReduceMotion = useReducedMotion() ?? false;

    const variants = preset === "scale" ? scaleIn : fadeVariants(direction, shouldReduceMotion);

    const transition: Transition = {
      duration: shouldReduceMotion ? 0 : duration.base,
      ease: EASE_SMOOTH_OUT,
    };

    return (
      <m.div
        ref={ref}
        key={itemKey}
        className={cn(className)}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={variants}
        transition={transition}
        {...props}
      >
        {children}
      </m.div>
    );
  },
);
