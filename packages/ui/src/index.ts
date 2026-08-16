/**
 * @masseurmatch/ui — MasseurMatch design system.
 *
 * Consumed as source: each app lists this package in `transpilePackages` and
 * extends `@masseurmatch/ui/tailwind-preset`. Import the stylesheet once from
 * the root layout:
 *
 *   import "@masseurmatch/ui/styles.css";
 */

// Design tokens
export * from "./tokens";

// Utilities
export { cn } from "./lib/cn";

// Base components (server-safe — no client boundary)
export { Button, buttonVariants, type ButtonProps } from "./components/button";
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./components/card";
export { Input, type InputProps } from "./components/input";
export { Avatar, avatarVariants, type AvatarProps } from "./components/avatar";

// Motion wrappers — each module carries its own "use client" boundary, so
// importing them from a server component does not turn it into a client one.
export * from "./components/motion";
