"use client";

import * as React from "react";
import { m, useReducedMotion, type Transition } from "framer-motion";

import { cn } from "../../lib/cn";
import { duration, EASE_SMOOTH_OUT, pageTransition } from "../../motion";
import type { MotionSafeHTMLProps } from "./types";

export interface PageTransitionProps extends MotionSafeHTMLProps<HTMLElement> {
  /**
   * Re-mount key. Pass the pathname (from `usePathname()`) so the transition
   * replays on navigation. Kept as a prop rather than reading the router here
   * so this wrapper stays usable outside the Next.js app router.
   */
  transitionKey?: string;
}

/**
 * PageTransition — wraps route content in a short opacity/lift transition.
 *
 * Intentionally understated (0.18s, 4px) to match the legacy shell: navigation
 * should feel instant, not animated. Fully skipped under reduced motion.
 */
export const PageTransition = React.forwardRef<HTMLDivElement, PageTransitionProps>(
  function PageTransition({ children, className, transitionKey, ...props }, ref) {
    const shouldReduceMotion = useReducedMotion() ?? false;

    const transition: Transition = {
      duration: shouldReduceMotion ? 0 : duration.fast,
      ease: EASE_SMOOTH_OUT,
    };

    return (
      <m.main
        ref={ref}
        key={transitionKey}
        className={cn("relative", className)}
        suppressHydrationWarning
        initial={shouldReduceMotion ? false : "hidden"}
        animate="visible"
        exit="exit"
        variants={pageTransition}
        transition={transition}
        {...props}
      >
        {children}
      </m.main>
    );
  },
);
