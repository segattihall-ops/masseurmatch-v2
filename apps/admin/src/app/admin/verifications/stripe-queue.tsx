"use client";

import { Button, Card } from "@masseurmatch/ui";
import * as React from "react";
import { useRouter } from "next/navigation";

import { EMPTY_STEP_STATE } from "../../onboarding/form-state";
import { syncStripeIdentity } from "./stripe-actions";

export type StripeIdentityRow = {
  id: string;
  name: string;
  status: string;
  submittedAt: string | null;
  lastError: string | null;
  hasSession: boolean;
};

export function StripeIdentityQueue({
  rows,
  configured,
}: {
  rows: StripeIdentityRow[];
  configured: boolean;
}) {
  if (rows.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-ink">Legacy Stripe Identity</h2>
        <p className="mt-1 text-sm leading-6 text-ink/55">
          Historical automated identity sessions from the OLD site. Sync reads the current
          VerificationSession from Stripe server-side and updates the MasseurMatch badge only when
          Stripe reports <code className="text-ink/75">verified</code>.
        </p>
      </div>

      {!configured ? (
        <Card className="mb-4 border-wineSoft bg-wineSoft/30 p-4">
          <p className="text-sm leading-6 text-wineDark">
            Stripe Identity sync is not configured in this Admin deployment. Add{" "}
            <code>STRIPE_IDENTITY_RESTRICTED_KEY</code> (preferred) or <code>STRIPE_SECRET_KEY</code>
            to Vercel to enable status refresh for these legacy sessions.
          </p>
        </Card>
      ) : null}

      <ul className="space-y-3">
        {rows.map((row) => (
          <li key={row.id}>
            <StripeRow row={row} configured={configured} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function StripeRow({ row, configured }: { row: StripeIdentityRow; configured: boolean }) {
  const router = useRouter();
  const [state, setState] = React.useState(EMPTY_STEP_STATE);
  const [pending, startTransition] = React.useTransition();

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await syncStripeIdentity(EMPTY_STEP_STATE, formData);
      setState(result);
      if (result.ok) router.refresh();
    });
  }

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold text-ink">{row.name}</h3>
            <span className="rounded-full bg-ink/5 px-2 py-0.5 text-xs capitalize text-ink/65">
              {row.status.replaceAll("_", " ")}
            </span>
          </div>
          <p className="mt-1 text-xs leading-5 text-ink/50">
            {row.submittedAt ? `Created ${row.submittedAt}` : "Legacy Stripe Identity session"}
            {!row.hasSession ? " · missing session id" : ""}
          </p>
          {row.lastError ? (
            <p className="mt-2 rounded-lg bg-ink/5 px-3 py-2 text-sm leading-6 text-ink/65">
              Last Stripe error: {row.lastError}
            </p>
          ) : null}
        </div>

        <form action={submit} className="w-full sm:w-auto">
          <input type="hidden" name="verification_id" value={row.id} />
          <Button
            type="submit"
            disabled={pending || !configured || !row.hasSession}
            className="w-full sm:w-auto"
          >
            {pending ? "Syncing…" : "Sync Stripe status"}
          </Button>
        </form>
      </div>

      {state.error ? (
        <p role="alert" className="mt-3 rounded-lg bg-wineSoft/40 px-3 py-2 text-sm text-wineDark">
          {state.error}
        </p>
      ) : null}
    </Card>
  );
}
