"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@masseurmatch/ui";
import Link from "next/link";
import { useState, useTransition } from "react";

import { setAvailableNow } from "./available-now-actions";

/**
 * Available Now, on the dashboard home.
 *
 * One switch. The window length is fixed by the plan rather than chosen, which
 * removes a decision from a thing meant to take one tap between clients.
 */
export function AvailableNowCard({
  access,
  previewNote,
  upgrade,
  active,
  remaining,
  hours,
  lapsed,
}: {
  access: "full" | "preview" | "locked";
  previewNote: string | null;
  upgrade: { name: string; price: string } | null;
  active: boolean;
  /** `Available for another 40 min`, while a window is running. */
  remaining: string | null;
  hours: number;
  /** The flag is on but the window has passed — say so rather than pretend. */
  lapsed: boolean;
}) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  if (access === "locked") return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available now</CardTitle>
        <CardDescription>
          {active
            ? (remaining ?? "You are shown as available.")
            : "Let clients see you can take someone today."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {access === "preview" ? (
          <>
            <p className="text-sm text-text-secondary">{previewNote}</p>
            {upgrade ? (
              <Link
                href="/subscription"
                className="inline-flex h-10 items-center rounded-md bg-brand-primary px-4 text-sm font-medium text-white transition hover:opacity-90"
              >
                Get it with {upgrade.name} — {upgrade.price}/mo
              </Link>
            ) : null}
          </>
        ) : (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  setResult((await setAvailableNow(!active)).message);
                })
              }
              className="inline-flex h-10 items-center rounded-md bg-brand-primary px-4 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40"
            >
              {pending ? "Saving…" : active ? "Turn off" : `I'm available for ${hours}h`}
            </button>

            {/* aria-live so the outcome is announced, not just painted. */}
            <p aria-live="polite" className="text-sm text-text-secondary">
              {result ?? (lapsed ? "Your last availability window has ended." : "")}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
