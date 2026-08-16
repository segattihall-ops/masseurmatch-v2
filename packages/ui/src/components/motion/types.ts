import type * as React from "react";

/**
 * React's `onDrag*` and `onAnimationStart` handlers have different signatures
 * from framer-motion's, so a plain `React.HTMLAttributes` spread onto an `m.*`
 * element fails to typecheck. Dropping them mirrors what framer-motion's own
 * `HTMLMotionProps` does, and none of these wrappers expose drag gestures
 * (`domAnimation` does not include the drag feature set anyway).
 */
export type MotionSafeHTMLProps<T = HTMLElement> = Omit<
  React.HTMLAttributes<T>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"
>;
