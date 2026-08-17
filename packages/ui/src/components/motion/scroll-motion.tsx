"use client";

import * as React from "react";
import {
  m,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

import { cn } from "../../lib/cn";

export function ScrollProgressBar({ className }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 32,
    mass: 0.18,
  });

  if (shouldReduceMotion) return null;

  return (
    <m.div
      aria-hidden="true"
      className={cn("pointer-events-none fixed left-0 top-0 z-[70] h-0.5 w-full origin-left", className)}
      style={{ scaleX }}
    />
  );
}

export function ScrollParallax({
  children,
  className,
  distance = 28,
}: {
  children: React.ReactNode;
  className?: string;
  distance?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const rawY = useTransform(scrollYProgress, [0, 0.5, 1], [distance, 0, -distance]);
  const y = useSpring(rawY, { stiffness: 110, damping: 28, mass: 0.2 });

  return (
    <m.div ref={ref} className={cn(className)} style={shouldReduceMotion ? undefined : { y }}>
      {children}
    </m.div>
  );
}

export function ScrollCue({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion() ?? false;

  return (
    <m.span
      className={cn("inline-flex items-center gap-2", className)}
      animate={shouldReduceMotion ? undefined : { y: [0, 5, 0] }}
      transition={
        shouldReduceMotion
          ? undefined
          : { duration: 1.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
      }
    >
      {children}
    </m.span>
  );
}
