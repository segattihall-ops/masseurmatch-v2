"use client";

import { Button, Input } from "@masseurmatch/ui";
import { useFormState, useFormStatus } from "react-dom";

import { Turnstile } from "@/components/turnstile";
import { maskPhone } from "@/lib/phone";

import { signInWithPhone } from "./phone-actions";
import { EMPTY_PHONE_SIGN_IN_STATE } from "./phone-state";

function Submit({ idle, busy }: { idle: string; busy: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? busy : idle}
    </Button>
  );
}

export function PhoneSignInForm({
  next,
  turnstileSiteKey,
  onRestart,
}: {
  next: string;
  turnstileSiteKey: string | null;
  onRestart: () => void;
}) {
  const [state, formAction] = useFormState(signInWithPhone, EMPTY_PHONE_SIGN_IN_STATE);

  if (state.stage === "code") {
    return (
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="intent" value="confirm" />
        <input type="hidden" name="phone" value={state.phone} />
        <input type="hidden" name="next" value={next} />

        <p className="text-sm text-ink/70">
          If an account uses <span className="font-medium text-ink">{maskPhone(state.phone)}</span>,
          a six-digit code is on its way.
        </p>

        <div className="space-y-1.5">
          <label htmlFor="sms-code" className="text-sm font-medium text-ink">
            Code
          </label>
          <Input
            id="sms-code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            autoFocus
          />
        </div>

        {state.error ? (
          <p role="alert" className="text-sm text-wine">
            {state.error}
          </p>
        ) : null}

        <Submit idle="Sign in" busy="Checking…" />

        {/* A mistyped number waits for a code that never comes — the reply
            cannot say so without answering "does this number have an account".
            This is the way out. */}
        <button
          type="button"
          onClick={onRestart}
          className="w-full text-center text-sm text-ink/60 hover:underline"
        >
          Use a different number
        </button>
      </form>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="intent" value="send" />
      <input type="hidden" name="next" value={next} />

      <div className="space-y-1.5">
        <label htmlFor="sign-in-phone" className="text-sm font-medium text-ink">
          Mobile number
        </label>
        <Input
          id="sign-in-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="(555) 123-4567"
          required
        />
        <p className="text-xs text-ink/50">
          Only works if you have verified this number from your dashboard.
        </p>
      </div>

      <Turnstile siteKey={turnstileSiteKey} />

      {state.error ? (
        <p role="alert" className="text-sm text-wine">
          {state.error}
        </p>
      ) : null}

      <Submit idle="Send me a code" busy="Sending…" />
    </form>
  );
}
