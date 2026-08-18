"use client";

import { Button } from "@masseurmatch/ui";
import { useFormState, useFormStatus } from "react-dom";

import { startGoogleSignIn } from "@/app/auth/oauth-actions";
import { EMPTY_OAUTH_STATE } from "@/app/auth/oauth-state";

/**
 * "Continue with Google", on both auth pages.
 *
 * One component, one label. Sign-in and sign-up are the same request to Google,
 * and wording them differently ("Sign up with Google" on one page) promises a
 * distinction that does not exist — the same click signs an existing user in.
 */

function GoogleMark() {
  // Inline rather than fetched: the CSP blocks third-party origins, and a
  // remote logo would be a request to Google before the user has chosen to go
  // there.
  return (
    <svg aria-hidden viewBox="0 0 18 18" className="h-4 w-4">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" className="w-full gap-2" disabled={pending}>
      <GoogleMark />
      {pending ? "Taking you to Google…" : "Continue with Google"}
    </Button>
  );
}

export function GoogleButton({ next }: { next: string }) {
  const [state, formAction] = useFormState(startGoogleSignIn, EMPTY_OAUTH_STATE);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="next" value={next} />
      <Submit />
      {state.error ? (
        <p role="alert" className="text-sm text-wine">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
