"use client";

import { Button, Input } from "@masseurmatch/ui";
import { useFormState, useFormStatus } from "react-dom";

import { Turnstile } from "@/components/turnstile";

import { signIn } from "./actions";
import { EMPTY_SIGN_IN_STATE } from "./form-state";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Signing in…" : "Sign in"}
    </Button>
  );
}

export function SignInForm({
  next,
  turnstileSiteKey,
}: {
  next: string;
  turnstileSiteKey: string | null;
}) {
  const [state, formAction] = useFormState(signIn, EMPTY_SIGN_IN_STATE);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />

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
          autoComplete="current-password"
          required
        />
      </div>

      <Turnstile siteKey={turnstileSiteKey} />

      {state.error ? (
        <p role="alert" className="text-sm text-wine">
          {state.error}
        </p>
      ) : null}

      <Submit />
    </form>
  );
}
