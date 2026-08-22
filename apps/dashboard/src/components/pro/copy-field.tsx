"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

/**
 * A value with a copy button.
 *
 * The value stays selectable text rather than living only behind the button:
 * `navigator.clipboard` needs a secure context and can be refused outright, and
 * a link you cannot select is a link you cannot share. The button is the
 * convenience, not the mechanism.
 */
export function CopyField({ value, label }: { value: string; label: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
      window.setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("failed");
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <code className="min-w-0 flex-1 break-all rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground">
          {value}
        </code>
        <button
          type="button"
          onClick={copy}
          className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-foreground transition hover:bg-muted"
        >
          {state === "copied" ? (
            <Check className="h-4 w-4" aria-hidden />
          ) : (
            <Copy className="h-4 w-4" aria-hidden />
          )}
          Copy
          <span className="sr-only"> {label}</span>
        </button>
      </div>

      <p aria-live="polite" className="text-xs text-muted-foreground">
        {state === "copied"
          ? "Copied."
          : state === "failed"
            ? "Your browser would not let us copy it — select the text above instead."
            : ""}
      </p>
    </div>
  );
}
