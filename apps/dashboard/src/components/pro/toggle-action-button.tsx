"use client";

import { cn } from "@masseurmatch/ui";
import { useState, useTransition } from "react";

export type ToggleResult = { ok: boolean; message: string };

/**
 * The button inside a `ToggleCard` that changes something.
 *
 * Takes a *bound* server action, so the card itself stays a server component
 * and the browser never learns which value is being written — only that a
 * button was pressed.
 *
 * The outcome is announced in an `aria-live` region rather than only painted,
 * because turning your own profile off is exactly the change you want confirmed
 * out loud.
 */
export function ToggleActionButton({
  action,
  label,
  pendingLabel = "Saving…",
  variant = "primary",
  icon,
}: {
  action: () => Promise<ToggleResult>;
  label: string;
  pendingLabel?: string;
  variant?: "primary" | "outline";
  icon?: React.ReactNode;
}) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ToggleResult | null>(null);

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => setResult(await action()))}
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition disabled:opacity-40",
          variant === "primary"
            ? "bg-primary text-primary-foreground hover:opacity-90"
            : "border border-border text-foreground hover:bg-muted",
        )}
      >
        {icon}
        {pending ? pendingLabel : label}
      </button>

      <p aria-live="polite" className="text-xs text-muted-foreground">
        {result?.message ?? ""}
      </p>
    </div>
  );
}
