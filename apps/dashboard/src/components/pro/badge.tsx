import { cn } from "@masseurmatch/ui";

/**
 * The one badge used across the Pro dashboard.
 *
 * Every variant is a pill at the shared `--radius`; they differ only in weight
 * so a nav badge and a toggle state read as the same family. Colour is
 * deliberately restrained here — the states that matter (`ON`/`OFF`) are the
 * only ones that get a tint, because they are the only ones a therapist has to
 * act on.
 */
export type BadgeVariant = "neutral" | "free" | "new" | "preview" | "earn" | "on" | "off";

const VARIANTS: Record<BadgeVariant, string> = {
  neutral: "border-border bg-muted text-muted-foreground",
  free: "border-border bg-muted text-muted-foreground",
  new: "border-border bg-muted text-foreground",
  preview: "border-border bg-muted text-muted-foreground",
  earn: "border-transparent bg-primary text-primary-foreground",
  on: "border-transparent bg-emerald-100 text-emerald-800",
  off: "border-border bg-muted text-muted-foreground",
};

export function Badge({
  variant = "neutral",
  children,
  className,
}: {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide leading-none",
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
