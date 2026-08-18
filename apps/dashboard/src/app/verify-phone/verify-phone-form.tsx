"use client";

import { Button, Input } from "@masseurmatch/ui";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";

import { maskPhone } from "@/lib/phone";

import { verifyPhone } from "./actions";
import { EMPTY_VERIFY_PHONE_STATE } from "./form-state";

function Submit({ idle, busy }: { idle: string; busy: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? busy : idle}
    </Button>
  );
}

export function VerifyPhoneForm({ current }: { current: string | null }) {
  const [state, formAction] = useFormState(verifyPhone, EMPTY_VERIFY_PHONE_STATE);

  if (state.stage === "done") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-ink">
          <span className="font-medium">{maskPhone(state.phone)}</span> is verified. You can now
          sign in with a code sent to it.
        </p>
        <Link href="/" className="inline-block text-sm font-medium text-wine hover:underline">
          Back to your dashboard
        </Link>
      </div>
    );
  }

  if (state.stage === "code") {
    return (
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="intent" value="confirm" />
        <input type="hidden" name="phone" value={state.phone} />

        <p className="text-sm text-ink/70">
          We sent a six-digit code to{" "}
          <span className="font-medium text-ink">{maskPhone(state.phone)}</span>.
        </p>

        <div className="space-y-1.5">
          <label htmlFor="code" className="text-sm font-medium text-ink">
            Code
          </label>
          <Input
            id="code"
            name="code"
            // `numeric`, so a phone shows the number pad; `one-time-code` lets
            // iOS and Android offer the code straight from the SMS.
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

        <Submit idle="Confirm" busy="Checking…" />
      </form>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="intent" value="send" />

      <div className="space-y-1.5">
        <label htmlFor="phone" className="text-sm font-medium text-ink">
          Mobile number
        </label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          defaultValue={current ?? ""}
          placeholder="(555) 123-4567"
          required
        />
        <p className="text-xs text-ink/50">
          US numbers can be typed however you like. Start with + for anywhere else.
        </p>
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-wine">
          {state.error}
        </p>
      ) : null}

      <Submit idle="Send me a code" busy="Sending…" />
    </form>
  );
}
