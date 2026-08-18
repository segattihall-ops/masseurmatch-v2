"use client";

import { Button, Card } from "@masseurmatch/ui";
import { useFormState, useFormStatus } from "react-dom";

import { cancelSubscription, changePlan, startSubscription } from "./actions";
import { EMPTY_BILLING_STATE, type BillingState } from "./billing-state";

/**
 * Plan selection and cancellation.
 *
 * A client component only because these are forms with pending state. All three
 * actions run on the server; nothing here talks to a payment provider, and no
 * provider key is reachable from this file.
 */

type PlanOption = {
  id: string;
  name: string;
  priceCents: number;
  photoLimit: number;
  blurb: string;
  /** What this plan unlocks, already resolved from the entitlement table. */
  unlocks: string[];
};

function price(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

function Err({ state }: { state: BillingState }) {
  if (!state.error) return null;
  return (
    <p role="alert" className="mt-3 text-sm text-wine">
      {state.error}
    </p>
  );
}

function SubmitButton({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant?: "primary" | "outline";
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} disabled={pending}>
      {pending ? "Working…" : children}
    </Button>
  );
}

/* -------------------------------------------------------------------------- */

export function PlanPicker({
  plans,
  currentPlanId,
  hasSubscription,
}: {
  plans: PlanOption[];
  currentPlanId: string;
  hasSubscription: boolean;
}) {
  // Changing an existing subscription and starting a new one are different
  // provider calls, so they are different actions rather than one with a flag.
  const [state, action] = useFormState(
    hasSubscription ? changePlan : startSubscription,
    EMPTY_BILLING_STATE,
  );

  return (
    <section className="mt-10">
      <h2 className="mb-3 text-xl font-semibold text-ink">
        {hasSubscription ? "Change your plan" : "Choose a plan"}
      </h2>

      <div className="grid gap-4 sm:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          return (
            <Card key={plan.id} className="flex h-full flex-col p-5">
              <h3 className="text-lg font-semibold text-ink">{plan.name}</h3>
              <p className="mt-1 font-stat text-ds-32 text-ink">
                {price(plan.priceCents)}
                <span className="text-base font-normal text-ink/50">/mo</span>
              </p>
              <p className="mt-2 text-sm text-ink/60">{plan.blurb}</p>
              <ul className="mt-3 list-none space-y-1 p-0 text-sm text-ink/60">
                <li>{plan.photoLimit} photos</li>
                {plan.unlocks.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>

              <form action={action} className="mt-4 pt-2">
                <input type="hidden" name="plan" value={plan.id} />
                {isCurrent ? (
                  <p className="text-sm font-medium text-ink/50">Your current plan</p>
                ) : (
                  <SubmitButton variant={hasSubscription ? "outline" : "primary"}>
                    {hasSubscription ? `Switch to ${plan.name}` : `Choose ${plan.name}`}
                  </SubmitButton>
                )}
              </form>
            </Card>
          );
        })}
      </div>

      <Err state={state} />

      <p className="mt-4 text-sm text-ink/50">
        You will be sent to PayPal to approve the payment. Your plan changes once PayPal confirms it
        — nothing is charged before you approve.
      </p>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

export function CancelForm({ cancelAtPeriodEnd }: { cancelAtPeriodEnd: boolean }) {
  const [state, action] = useFormState(cancelSubscription, EMPTY_BILLING_STATE);

  if (cancelAtPeriodEnd) {
    return (
      <p className="mt-8 text-sm text-ink/60">
        Your subscription is set to end when the current period finishes. Your listing stays live
        until then.
      </p>
    );
  }

  return (
    <form action={action} className="mt-8">
      <SubmitButton variant="outline">Cancel subscription</SubmitButton>
      <p className="mt-2 text-sm text-ink/50">
        Your listing stays live until the end of the period you have already paid for.
      </p>
      <Err state={state} />
    </form>
  );
}
