"use client";

import { Button, Input } from "@masseurmatch/ui";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";

import { Turnstile } from "@/components/turnstile";

import { requestPasswordReset } from "./actions";
import { EMPTY_FORGOT_PASSWORD_STATE } from "./form-state";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Sending…" : "Send reset link"}
    </Button>
  );
}

export function ForgotPasswordForm({ turnstileSiteKey }: { turnstileSiteKey: string | null }) {
  const [state, formAction] = useFormState(requestPasswordReset, EMPTY_FORGOT_PASSWORD_STATE);

  if (state.status === "sent") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-ink">
          If <span className="font-medium">{state.email}</span> has an account, a reset link is on
          its way. It opens in this browser and expires after an hour.
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
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-ink">
          Email
        </label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
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
