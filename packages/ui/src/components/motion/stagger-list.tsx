"use client";

import * as React from "react";
import { m, useReducedMotion, type Transition } from "framer-motion";

import { cn } from "../../lib/cn";
import {
  duration,
  EASE_SMOOTH_OUT,
  fadeVariants,
  staggerContainer,
  viewportOnce,
} from "../../motion";
import type { MotionSafeHTMLProps } from "./types";

export interface StaggerListProps extends MotionSafeHTMLProps<HTMLDivElement> {
  /** Seconds between each child's entrance. */
  stagger?: number;
  /** Seconds to wait before the first child animates. */
  delayChildren?: number;
  /** Animate when the list scrolls into view instead of on mount. */
  whileInView?: boolean;
  /** Element to render. Use `"ul"`/`"ol"` with `StaggerItem as="li"`. */
  as?: "div" | "ul" | "ol" | "section";
}

/**
 * StaggerList — reveals its `StaggerItem` children in sequence.
 *
 * Under reduced motion the stagger collapses to zero and children cross-fade
 * together, so the list appears at once rather than trickling in.
 */
export const StaggerList = React.forwardRef<HTMLDivElement, StaggerListProps>(function StaggerList(
  {
    children,
    className,
    stagger = 0.08,
    delayChildren = 0,
    whileInView = false,
    as = "div",
    ...props
  },
  ref,
) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const Component = m[as] as typeof m.div;

  const variants = React.useMemo(
    () =>
      staggerContainer(shouldReduceMotion ? 0 : stagger, shouldReduceMotion ? 0 : delayChildren),
    [stagger, delayChildren, shouldReduceMotion],
  );

  const animationProps = whileInView
    ? { whileInView: "visible" as const, viewport: viewportOnce }
    : { animate: "visible" as const };

  return (
    <Component
      ref={ref}
      className={cn(className)}
      initial="hidden"
      variants={variants}
      {...animationProps}
      {...props}
    >
      {children}
    </Component>
  );
});

export interface StaggerItemProps extends MotionSafeHTMLProps<HTMLDivElement> {
  /** Element to render. Use `"li"` inside a `StaggerList as="ul"`. */
  as?: "div" | "li" | "article";
}

/** Child of `StaggerList`. Inherits the parent's orchestration. */
export const StaggerItem = React.forwardRef<HTMLDivElement, StaggerItemProps>(function StaggerItem(
  { children, className, as = "div", ...props },
  ref,
) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const Component = m[as] as typeof m.div;

  const variants = React.useMemo(
    () => fadeVariants("up", shouldReduceMotion),
    [shouldReduceMotion],
  );

  const transition: Transition = {
    duration: shouldReduceMotion ? 0 : duration.base,
    ease: EASE_SMOOTH_OUT,
  };

  return (
    <Component
      ref={ref}
      className={cn(className)}
      variants={variants}
      transition={transition}
      {...props}
    >
      {children}
    </Component>
  );
});
