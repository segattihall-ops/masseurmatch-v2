"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@masseurmatch/ui";
import Link from "next/link";
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
  access,
  previewNote,
  upgrade,
  remaining,
  perMonth,
  activeUntil,
  canSpend,
  blockedMessage,
  available,
}: {
  /** From the entitlement table, never inferred from the numbers below. */
  access: "full" | "preview" | "locked";
  /** What `preview` actually gives, in the table's own words. */
  previewNote: string | null;
  /** Cheapest tier that unlocks this, already priced. Null if none does. */
  upgrade: { name: string; price: string } | null;
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

  // `locked` features are listed on the subscription page, where they can be
  // compared against a price. On the home page they would be clutter.
  if (access === "locked") return null;

  // Preview: show what the tool is and what it costs to have it, and nothing
  // else. Deliberately no counter — "0 of 0 left" reads as something taken
  // away from someone who never had it, which is the opposite of an invitation
  // to try the product.
  if (access === "preview") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Visibility Spike</CardTitle>
          <CardDescription>Lift your listing in your city for 24 hours.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {previewNote ? <p className="text-sm text-text-secondary">{previewNote}</p> : null}

          {upgrade ? (
            <Link
              href="/subscription"
              className="inline-flex h-10 items-center rounded-md bg-brand-primary px-4 text-sm font-medium text-white transition hover:opacity-90"
            >
              Get Spikes with {upgrade.name} — {upgrade.price}/mo
            </Link>
          ) : null}
        </CardContent>
      </Card>
    );
  }

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
