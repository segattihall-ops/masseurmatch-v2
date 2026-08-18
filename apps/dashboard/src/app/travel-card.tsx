"use client";

import { formatVisitDates, travelEntryKey, type TravelEntry } from "@masseurmatch/db/travel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@masseurmatch/ui";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";

import { addTravel, removeTravel, type TravelState } from "./travel-actions";

const EMPTY: TravelState = {};

/**
 * Its own component because `useFormStatus` only reports the status of the form
 * it is rendered inside — called from the parent it would always read false.
 */
function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 items-center rounded-md bg-brand-primary px-4 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40"
    >
      {pending ? "Saving\u2026" : "Save trip"}
    </button>
  );
}

/**
 * Travel schedule, on the dashboard home.
 *
 * A list of trips and one row of inputs to add another. No calendar widget: a
 * therapist entering "Denver, Sep 3–7" wants two date fields, and a month grid
 * is a lot of interface for two dates.
 *
 * The form stays collapsed until asked for. Most people are not travelling most
 * of the time, and an always-open form makes the page look like homework.
 */
export function TravelCard({
  entries,
  canHaveTourPage,
  previewNote,
  upgrade,
}: {
  entries: TravelEntry[];
  /** From the entitlement table — whether trips get their own indexed page. */
  canHaveTourPage: boolean;
  previewNote: string | null;
  upgrade: { name: string; price: string } | null;
}) {
  const [state, submit] = useFormState(addTravel, EMPTY);
  const [open, setOpen] = useState(false);
  const [removing, startRemove] = useTransition();

  const fieldError = (name: string) => state.fieldErrors?.[name]?.[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Travel</CardTitle>
        <CardDescription>
          {entries.length === 0
            ? "Tell clients where you will be, before you get there."
            : "Clients in these cities can find you while you are there."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {entries.length > 0 ? (
          <ul className="space-y-2">
            {entries.map((entry) => {
              const key = travelEntryKey(entry);
              return (
                <li key={key} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-text-primary">
                    {entry.city}
                    {entry.state ? `, ${entry.state}` : ""}{" "}
                    <span className="text-text-secondary">{formatVisitDates(entry)}</span>
                  </span>
                  <button
                    type="button"
                    disabled={removing}
                    onClick={() => startRemove(async () => void (await removeTravel(key)))}
                    className="text-text-muted underline underline-offset-4 hover:opacity-80 disabled:opacity-40"
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}

        {open ? (
          <form action={submit} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span className="text-text-secondary">City</span>
                <input
                  name="city"
                  required
                  maxLength={80}
                  className="h-10 w-full rounded-md border border-border bg-transparent px-3 text-text-primary"
                />
                {fieldError("city") ? (
                  <span className="block text-xs text-red-600">{fieldError("city")}</span>
                ) : null}
              </label>

              <label className="space-y-1 text-sm">
                <span className="text-text-secondary">State</span>
                <input
                  name="state"
                  required
                  maxLength={2}
                  placeholder="CO"
                  className="h-10 w-full rounded-md border border-border bg-transparent px-3 text-text-primary uppercase"
                />
                {fieldError("state") ? (
                  <span className="block text-xs text-red-600">{fieldError("state")}</span>
                ) : null}
              </label>

              <label className="space-y-1 text-sm">
                <span className="text-text-secondary">First day</span>
                <input
                  type="date"
                  name="start_date"
                  required
                  className="h-10 w-full rounded-md border border-border bg-transparent px-3 text-text-primary"
                />
                {fieldError("start_date") ? (
                  <span className="block text-xs text-red-600">{fieldError("start_date")}</span>
                ) : null}
              </label>

              <label className="space-y-1 text-sm">
                <span className="text-text-secondary">Last day</span>
                <input
                  type="date"
                  name="end_date"
                  required
                  className="h-10 w-full rounded-md border border-border bg-transparent px-3 text-text-primary"
                />
                {fieldError("end_date") ? (
                  <span className="block text-xs text-red-600">{fieldError("end_date")}</span>
                ) : null}
              </label>
            </div>

            <div className="flex items-center gap-3">
              <SaveButton />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-text-secondary underline underline-offset-4"
              >
                Cancel
              </button>
            </div>

            {/* aria-live so a rejection is announced, not just painted. */}
            <p aria-live="polite" className="text-sm text-text-secondary">
              {state.error ?? ""}
            </p>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-10 items-center rounded-md bg-brand-primary px-4 text-sm font-medium text-white transition hover:opacity-90"
          >
            Add a trip
          </button>
        )}

        {/* Said once, at the bottom, and only when it is true. A therapist with
            no trips does not need to be sold a tour page yet. */}
        {!canHaveTourPage && entries.length > 0 ? (
          <p className="text-sm text-text-secondary">
            {previewNote}{" "}
            {upgrade ? (
              <Link href="/subscription" className="underline underline-offset-4">
                {upgrade.name} is {upgrade.price}/mo
              </Link>
            ) : null}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
