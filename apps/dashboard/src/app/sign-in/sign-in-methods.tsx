"use client";

import { useState } from "react";

import { PhoneSignInForm } from "./phone-form";
import { SignInForm } from "./sign-in-form";

/**
 * Password or SMS, one at a time.
 *
 * A toggle rather than both forms stacked: two "sign in" buttons on one screen
 * makes the person choose before they have read either. Password stays the
 * default because it is the only method every account has — a number has to be
 * verified from inside the dashboard first.
 *
 * Remounting the phone form on every switch is deliberate; it is what discards
 * a half-finished code entry when someone goes back to a different number.
 */
export function SignInMethods({
  next,
  turnstileSiteKey,
}: {
  next: string;
  turnstileSiteKey: string | null;
}) {
  const [method, setMethod] = useState<"password" | "phone">("password");
  const [attempt, setAttempt] = useState(0);

  return (
    <div className="space-y-4">
      {method === "password" ? (
        <SignInForm next={next} turnstileSiteKey={turnstileSiteKey} />
      ) : (
        <PhoneSignInForm
          key={attempt}
          next={next}
          turnstileSiteKey={turnstileSiteKey}
          onRestart={() => setAttempt((n) => n + 1)}
        />
      )}

      <button
        type="button"
        onClick={() => {
          setMethod((current) => (current === "password" ? "phone" : "password"));
          setAttempt((n) => n + 1);
        }}
        className="w-full text-center text-sm text-ink/60 hover:underline"
      >
        {method === "password" ? "Sign in with a code by text instead" : "Use my password instead"}
      </button>
    </div>
  );
}
