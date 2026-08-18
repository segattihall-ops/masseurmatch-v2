"use client";

import { Button, Input } from "@masseurmatch/ui";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";

import { Turnstile } from "@/components/turnstile";
import { MIN_PASSWORD_LENGTH } from "@/lib/credentials";

import { signUp } from "./actions";
import { EMPTY_SIGN_UP_STATE } from "./form-state";

/**
 * React 18 in this repo, so `useFormState`/`useFormStatus` from `react-dom` —
 * `useActionState` does not exist here. `useFormStatus` only reports the form
 * it is rendered *inside*, which is why the button is its own component.
 */
function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creating your account…" : "Create account"}
    </Button>
  );
}

export function SignUpForm({
  next,
  turnstileSiteKey,
}: {
  next: string;
  turnstileSiteKey: string | null;
}) {
  const [state, formAction] = useFormState(signUp, EMPTY_SIGN_UP_STATE);

  // Replaces the form rather than sitting above it. Leaving the fields on
  // screen after a successful signup invites a second submission, which now
  // does nothing useful and looks broken.
  if (state.status === "check-email") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-ink">
          Check <span className="font-medium">{state.email}</span> for a confirmation link. Opening
          it signs you in and takes you to your dashboard.
        </p>
        <p className="text-sm text-ink/60">
          The link only works in this browser. If nothing arrives in a few minutes, look in your
          spam folder.
        </p>
        <Link
          href="/sign-in"
          className="inline-block text-sm font-medium text-wine hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      <div className="space-y-1.5">
        <label htmlFor="full_name" className="text-sm font-medium text-ink">
          Your name <span className="font-normal text-ink/50">(optional)</span>
        </label>
        <Input id="full_name" name="full_name" type="text" autoComplete="name" />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-ink">
          Email
        </label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-ink">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          required
        />
        <p className="text-xs text-ink/50">At least {MIN_PASSWORD_LENGTH} characters.</p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirm" className="text-sm font-medium text-ink">
          Confirm password
        </label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          required
        />
      </div>

      <Turnstile siteKey={turnstileSiteKey} />

      {state.status === "error" ? (
        <p role="alert" className="text-sm text-wine">
          {state.error}
        </p>
      ) : null}

      <Submit />
    </form>
  );
}
