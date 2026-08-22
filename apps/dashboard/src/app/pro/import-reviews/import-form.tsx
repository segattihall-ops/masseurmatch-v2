"use client";

import { Button, Input } from "@masseurmatch/ui";
import { useFormState, useFormStatus } from "react-dom";

import { requestImport } from "./actions";
import { EMPTY_IMPORT_STATE } from "./form-state";

/**
 * React 18 in this repo, so `useFormState`/`useFormStatus` from `react-dom`.
 * `useFormStatus` reports only the form it is rendered inside, which is why the
 * button is its own component.
 */
function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Sending…" : "Request import"}
    </Button>
  );
}

function Errors({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p className="text-sm text-destructive" role="alert">
      {errors[0]}
    </p>
  );
}

/**
 * The form that starts an import.
 *
 * `defaultEmail` is the address on the profile. Prefilled rather than read from
 * the session on the server, because a therapist whose account email is an old
 * one should be able to correct it here without editing their listing first.
 */
export function ImportRequestForm({ defaultEmail }: { defaultEmail: string }) {
  const [state, formAction] = useFormState(requestImport, EMPTY_IMPORT_STATE);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="source_url" className="text-sm font-medium text-foreground">
          Link to your existing listing
        </label>
        <Input
          id="source_url"
          name="source_url"
          type="url"
          inputMode="url"
          autoComplete="url"
          placeholder="https://…"
          required
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground">
          The public page your reviews are on today. We check it before anything is copied across.
        </p>
        <Errors errors={state.fieldErrors?.source_url} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="platform" className="text-sm font-medium text-foreground">
            Site name <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <Input id="platform" name="platform" maxLength={100} placeholder="Taken from the link" />
          <Errors errors={state.fieldErrors?.platform} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Where we reply
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={defaultEmail}
          />
          <Errors errors={state.fieldErrors?.email} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="notes" className="text-sm font-medium text-foreground">
          Anything we should know{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          maxLength={1000}
          className="w-full rounded-xl border border-border/90 bg-white/92 px-4 py-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/25"
          placeholder="A different display name on that site, which reviews are yours, anything unusual."
        />
        <Errors errors={state.fieldErrors?.notes} />
      </div>

      {/* Announced rather than only painted: the form does not move when it
          succeeds, so nothing else would tell a screen reader it worked. */}
      <p aria-live="polite" className="text-sm">
        {state.ok ? (
          <span className="text-foreground">
            Requested. It is on the list below and our team will look at it.
          </span>
        ) : state.error ? (
          <span className="text-destructive">{state.error}</span>
        ) : null}
      </p>

      <Submit />
    </form>
  );
}
