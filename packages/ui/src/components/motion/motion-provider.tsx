"use client";

import * as React from "react";
import { domAnimation, LazyMotion, MotionConfig } from "framer-motion";

/**
 * MotionProvider — mount once, in each app's root layout.
 *
 * - `LazyMotion` + `domAnimation` loads only the DOM animation feature set
 *   (~15kb instead of the full bundle).
 * - `strict` forbids the heavyweight `motion.*` components; every wrapper in
 *   this package uses the lightweight `m.*` components instead.
 * - `reducedMotion="user"` makes framer-motion drop transform and layout
 *   animations whenever the OS reports `prefers-reduced-motion: reduce`,
 *   keeping opacity so nothing disappears.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
