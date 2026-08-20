"use client";

import { Button, Input } from "@masseurmatch/ui";
import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";

import type { StepState } from "@/app/onboarding/form-state";

import { saveTravelSchedule, toggleAvailableNow } from "./actions";

type TravelEntry = { city: string; state: string; start_date: string; end_date: string };

function SubmitButton({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled}>
      {pending ? "Saving…" : children}
    </Button>
  );
}

export function AvailableNowToggle({
  active,
  expires,
  hours,
}: {
  active: boolean;
  expires: string | null;
  hours: number | null;
}) {
  const [state, formAction] = useFormState<StepState, FormData>(toggleAvailableNow, {});

  return (
    <div className="space-y-3">
      <p className="text-sm text-text-secondary">
        {hours === null
          ? "Available Now is included in the Standard, Pro, and Elite plans."
          : active && expires
            ? `You are showing as available until ${new Date(expires).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}.`
            : `Turning this on shows an “Available Now” badge on your public profile for ${hours} hour${hours === 1 ? "" : "s"}.`}
      </p>

      <form action={formAction}>
        <input type="hidden" name="activate" value={active ? "0" : "1"} />
        <SubmitButton disabled={hours === null}>
          {active ? "Turn off" : "Turn on Available Now"}
        </SubmitButton>
      </form>

      {state.error ? (
        <p role="alert" className="text-sm text-wine">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}

export function TravelScheduleForm({ initial }: { initial: TravelEntry[] }) {
  const [entries, setEntries] = React.useState<TravelEntry[]>(initial);
  const [state, formAction] = useFormState<StepState, FormData>(saveTravelSchedule, {});

  function update(index: number, patch: Partial<TravelEntry>) {
    setEntries((prev) => prev.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="travel_schedule" value={JSON.stringify(entries)} />

      {entries.length === 0 ? (
        <p className="text-sm text-text-secondary">
          No trips scheduled. Add one to appear in that city&apos;s directory while you are there.
        </p>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry, index) => (
            <li
              key={index}
              className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-[1fr_5rem_1fr_1fr_auto]"
            >
              <label className="block text-sm">
                <span className="mb-1 block text-text-secondary">City</span>
                <Input
                  value={entry.city}
                  placeholder="Miami"
                  onChange={(e) => update(index, { city: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-text-secondary">State</span>
                <Input
                  value={entry.state}
                  placeholder="FL"
                  maxLength={2}
                  onChange={(e) => update(index, { state: e.target.value.toUpperCase() })}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-text-secondary">From</span>
                <Input
                  type="date"
                  value={entry.start_date}
                  onChange={(e) => update(index, { start_date: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-text-secondary">Until</span>
                <Input
                  type="date"
                  value={entry.end_date}
                  onChange={(e) => update(index, { end_date: e.target.value })}
                />
              </label>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEntries((prev) => prev.filter((_, i) => i !== index))}
                >
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setEntries((prev) => [...prev, { city: "", state: "", start_date: "", end_date: "" }])
          }
        >
          Add a trip
        </Button>
        <SubmitButton>Save schedule</SubmitButton>
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-wine">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p role="status" className="text-sm text-text-secondary">
          Saved.
        </p>
      ) : null}
    </form>
  );
}
