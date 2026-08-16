"use client";

import { AnimatePresence, Button, Input, PresenceItem } from "@masseurmatch/ui";
import { useFormState, useFormStatus } from "react-dom";

import {
  ONBOARDING_STEPS,
  STEP_LABELS,
  type OnboardingStep,
  type BasicsInput,
} from "@/lib/onboarding";

import { saveBasics, saveServices, submitForReview } from "./actions";
import { EMPTY_STEP_STATE, type FieldErrors } from "./form-state";

/* -------------------------------------------------------------- shared bits */

function Err({ errors, name }: { errors: FieldErrors | undefined; name: string }) {
  const message = errors?.[name]?.[0];
  if (!message) return null;
  return (
    <p role="alert" className="text-sm text-wine">
      {message}
    </p>
  );
}

function Field({
  label,
  name,
  errors,
  children,
}: {
  label: string;
  name: string;
  errors: FieldErrors | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      <Err errors={errors} name={name} />
    </div>
  );
}

function Save({ label = "Save and continue" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}

/* ------------------------------------------------------------------ stepper */

export function Stepper({
  current,
  progress,
}: {
  current: OnboardingStep;
  progress: Record<OnboardingStep, boolean>;
}) {
  return (
    <ol className="mb-8 flex flex-wrap gap-2" aria-label="Onboarding progress">
      {ONBOARDING_STEPS.map((step, i) => {
        const done = progress[step];
        const active = step === current;
        return (
          <li
            key={step}
            aria-current={active ? "step" : undefined}
            className={[
              "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm",
              active
                ? "bg-wine text-white"
                : done
                  ? "bg-wineSoft text-wineDark"
                  : "bg-ink/5 text-ink/50",
            ].join(" ")}
          >
            <span className="tabular-nums">{i + 1}</span>
            {STEP_LABELS[step]}
            {done && !active ? <span aria-label="complete">✓</span> : null}
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------------------- basics */

export function BasicsStep({ initial }: { initial: Partial<BasicsInput> }) {
  const [state, action] = useFormState(saveBasics, EMPTY_STEP_STATE);

  return (
    <form action={action} className="space-y-4">
      <Field label="Display name" name="display_name" errors={state.fieldErrors}>
        <Input
          id="display_name"
          name="display_name"
          defaultValue={initial.display_name ?? ""}
          required
        />
      </Field>
      <Field label="Full legal name" name="full_name" errors={state.fieldErrors}>
        <Input id="full_name" name="full_name" defaultValue={initial.full_name ?? ""} required />
      </Field>
      <Field label="Headline" name="headline" errors={state.fieldErrors}>
        <Input id="headline" name="headline" defaultValue={initial.headline ?? ""} required />
      </Field>
      <Field label="About your practice" name="bio" errors={state.fieldErrors}>
        <textarea
          id="bio"
          name="bio"
          rows={6}
          defaultValue={initial.bio ?? ""}
          required
          className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-base text-ink outline-none focus-visible:ring-2 focus-visible:ring-wine/40"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="City" name="city" errors={state.fieldErrors}>
          <Input id="city" name="city" defaultValue={initial.city ?? ""} required />
        </Field>
        <Field label="State" name="state" errors={state.fieldErrors}>
          <Input
            id="state"
            name="state"
            maxLength={2}
            defaultValue={initial.state ?? ""}
            required
            placeholder="NY"
          />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone" name="phone" errors={state.fieldErrors}>
          <Input id="phone" name="phone" defaultValue={initial.phone ?? ""} required />
        </Field>
        <Field label="Email" name="email" errors={state.fieldErrors}>
          <Input id="email" name="email" type="email" defaultValue={initial.email ?? ""} required />
        </Field>
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-wine">
          {state.error}
        </p>
      ) : null}
      <Save />
    </form>
  );
}

/* ----------------------------------------------------------------- services */

export function ServicesStep({
  options,
  initial,
}: {
  options: string[];
  initial: {
    service_categories: string[];
    incall_price: number | null;
    outcall_price: number | null;
  };
}) {
  const [state, action] = useFormState(saveServices, EMPTY_STEP_STATE);

  return (
    <form action={action} className="space-y-6">
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-ink">Services you offer</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {options.map((option) => (
            <label key={option} className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                name="service_categories"
                value={option}
                defaultChecked={initial.service_categories.includes(option)}
                className="h-4 w-4 accent-wine"
              />
              {option}
            </label>
          ))}
        </div>
        <Err errors={state.fieldErrors} name="service_categories" />
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Incall rate (USD/hour)" name="incall_price" errors={state.fieldErrors}>
          <Input
            id="incall_price"
            name="incall_price"
            inputMode="numeric"
            defaultValue={initial.incall_price ?? ""}
          />
        </Field>
        <Field label="Outcall rate (USD/hour)" name="outcall_price" errors={state.fieldErrors}>
          <Input
            id="outcall_price"
            name="outcall_price"
            inputMode="numeric"
            defaultValue={initial.outcall_price ?? ""}
          />
        </Field>
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-wine">
          {state.error}
        </p>
      ) : null}
      <Save />
    </form>
  );
}

/* ------------------------------------------------------------------- review */

export function ReviewStep({ ready }: { ready: boolean }) {
  const [state, action] = useFormState(submitForReview, EMPTY_STEP_STATE);

  return (
    <form action={action} className="space-y-4">
      <p className="text-sm text-ink/70">
        Submitting sends your profile to our team for review. It stays private until a reviewer
        approves it — usually within a business day.
      </p>
      {state.error ? (
        <p role="alert" className="text-sm text-wine">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p role="status" className="text-sm text-wineDark">
          Submitted. We will email you when it has been reviewed.
        </p>
      ) : null}
      <Save label={ready ? "Submit for review" : "Finish the earlier steps first"} />
    </form>
  );
}

/* ------------------------------------------------------ animated step shell */

/**
 * Wraps whichever step is showing so it fades between them.
 *
 * `Presence` / `PresenceItem` come from `packages/ui/motion`, which keeps the
 * framer-motion runtime behind its own client boundary — nothing here imports
 * framer-motion directly, and reduced-motion is already honoured inside the
 * wrapper.
 */
export function StepShell({ step, children }: { step: OnboardingStep; children: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <PresenceItem key={step} itemKey={step}>
        {children}
      </PresenceItem>
    </AnimatePresence>
  );
}
