"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@masseurmatch/ui";
import { useState, useTransition } from "react";

import { startSpike } from "./spike-actions";

/**
 * Visibility Spikes, on the dashboard home.
 *
 * One card, one number, one button. A Spike is a small thing a therapist does
 * in five seconds between clients — it does not need a page, a wizard, or a
 * chart, and giving it one would push everything that matters further down.
 *
 * The button is disabled when a Spike cannot be started, but the server checks
 * again before spending anything: a disabled button is a courtesy, not a
 * control.
 */
export function SpikeCard({
  remaining,
  perMonth,
  activeUntil,
  canSpend,
  blockedMessage,
  available,
}: {
  remaining: number;
  perMonth: number;
  activeUntil: string | null;
  canSpend: boolean;
  blockedMessage: string | null;
  available: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  // Nothing to show until the migration has run. A card that explains it is
  // broken is worse than no card.
  if (!available) return null;

  const runningUntil = activeUntil
    ? new Date(activeUntil).toLocaleString(undefined, { hour: "numeric", minute: "2-digit" })
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visibility Spike</CardTitle>
        <CardDescription>
          {runningUntil
            ? `Running until ${runningUntil}. Your listing is lifted in your city.`
            : "Lift your listing in your city for 24 hours."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="font-stat text-ds-32 text-text-primary">
          {remaining}
          <span className="text-base font-normal text-text-secondary"> of {perMonth} left</span>
        </p>

        <button
          type="button"
          disabled={!canSpend || pending}
          onClick={() =>
            startTransition(async () => {
              setResult(await startSpike());
            })
          }
          className="inline-flex h-10 items-center rounded-md bg-brand-primary px-4 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? "Starting…" : "Start a Spike"}
        </button>

        {/* aria-live so the outcome is announced, not just painted. */}
        <p aria-live="polite" className="text-sm text-text-secondary">
          {result ? result.message : (blockedMessage ?? "")}
        </p>
      </CardContent>
    </Card>
  );
}
