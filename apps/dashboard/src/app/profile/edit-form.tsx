"use client";

import { Button, Input } from "@masseurmatch/ui";
import { useFormState, useFormStatus } from "react-dom";

import type { FieldErrors } from "../onboarding/form-state";
import { EMPTY_STEP_STATE } from "../onboarding/form-state";
import { saveProfile } from "./actions";

type Initial = {
  display_name: string | null;
  full_name: string | null;
  headline: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  email: string | null;
  service_categories: string[] | null;
  incall_price: number | null;
  outcall_price: number | null;
};

function Err({ errors, name }: { errors: FieldErrors | undefined; name: string }) {
  const message = errors?.[name]?.[0];
  return message ? (
    <p role="alert" className="text-sm text-wine">
      {message}
    </p>
  ) : null;
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

function Save() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}

export function EditProfileForm({
  initial,
  serviceOptions,
}: {
  initial: Initial;
  serviceOptions: string[];
}) {
  const [state, action] = useFormState(saveProfile, EMPTY_STEP_STATE);
  const selected = initial.service_categories ?? [];

  return (
    <form action={action} className="space-y-6">
      <Field label="Display name" name="display_name" errors={state.fieldErrors}>
        <Input id="display_name" name="display_name" defaultValue={initial.display_name ?? ""} />
      </Field>
      <Field label="Full legal name" name="full_name" errors={state.fieldErrors}>
        <Input id="full_name" name="full_name" defaultValue={initial.full_name ?? ""} />
      </Field>
      <Field label="Headline" name="headline" errors={state.fieldErrors}>
        <Input id="headline" name="headline" defaultValue={initial.headline ?? ""} />
      </Field>
      <Field label="About your practice" name="bio" errors={state.fieldErrors}>
        <textarea
          id="bio"
          name="bio"
          rows={6}
          defaultValue={initial.bio ?? ""}
          className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-base text-ink outline-none focus-visible:ring-2 focus-visible:ring-wine/40"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="City" name="city" errors={state.fieldErrors}>
          <Input id="city" name="city" defaultValue={initial.city ?? ""} />
        </Field>
        <Field label="State" name="state" errors={state.fieldErrors}>
          <Input id="state" name="state" maxLength={2} defaultValue={initial.state ?? ""} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone" name="phone" errors={state.fieldErrors}>
          <Input id="phone" name="phone" defaultValue={initial.phone ?? ""} />
        </Field>
        <Field label="Email" name="email" errors={state.fieldErrors}>
          <Input id="email" name="email" type="email" defaultValue={initial.email ?? ""} />
        </Field>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-ink">Services</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {serviceOptions.map((option) => (
            <label key={option} className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                name="service_categories"
                value={option}
                defaultChecked={selected.includes(option)}
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

      {state.ok ? (
        <p role="status" className="text-sm text-wineDark">
          {state.error ?? "Saved."}
        </p>
      ) : state.error ? (
        <p role="alert" className="text-sm text-wine">
          {state.error}
        </p>
      ) : null}

      <Save />
    </form>
  );
}
