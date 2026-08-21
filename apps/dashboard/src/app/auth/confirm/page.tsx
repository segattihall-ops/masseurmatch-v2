import { Card } from "@masseurmatch/ui";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { emailLinkType, type EmailLinkType } from "@/lib/email-links";
import { safeNext } from "@/lib/safe-next";

import { confirmEmailLink } from "./actions";

export const metadata: Metadata = {
  title: "Confirm",
  robots: { index: false, follow: false },
};

/**
 * The interstitial an email link lands on.
 *
 * The link in a confirmation email carries a single-use token, and email
 * providers pre-fetch links with a GET to scan them — Outlook Safe Links,
 * Gmail, corporate antivirus. When the token was verified directly in the GET
 * callback, the scanner's fetch consumed it: the account got confirmed by a
 * robot, the session went nowhere, and the person's own click — one second
 * later in the auth logs — bounced to "link expired". This page is the fix:
 * rendering it consumes nothing, and the token is only spent when the person
 * presses the button, which submits a POST no scanner will ever send.
 */

const HEADINGS: Record<EmailLinkType, { title: string; body: string; button: string }> = {
  signup: {
    title: "Confirm your email",
    body: "Press the button to confirm your email address and open your dashboard.",
    button: "Confirm email",
  },
  invite: {
    title: "Accept your invitation",
    body: "Press the button to accept your invitation and set up your account.",
    button: "Accept invitation",
  },
  magiclink: {
    title: "Sign in",
    body: "Press the button to finish signing in to your account.",
    button: "Sign in",
  },
  recovery: {
    title: "Reset your password",
    body: "Press the button to continue to password reset.",
    button: "Continue",
  },
  email_change: {
    title: "Confirm your new email",
    body: "Press the button to confirm this change to your account's email address.",
    button: "Confirm change",
  },
  email: {
    title: "Confirm your email",
    body: "Press the button to confirm your email address.",
    button: "Confirm email",
  },
};

function first(value: string | string[] | undefined): string | null {
  return (Array.isArray(value) ? value[0] : value) ?? null;
}

export default function ConfirmPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const tokenHash = first(searchParams.token_hash);
  const type = emailLinkType(first(searchParams.type));
  const next = safeNext(first(searchParams.next));
  const setup = first(searchParams.setup) ?? "";

  if (!tokenHash || !type) redirect("/sign-in?notice=link-invalid");

  const heading = HEADINGS[type];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
      <Card className="w-full p-8">
        <h1 className="text-2xl font-semibold text-ink">{heading.title}</h1>
        <p className="mt-1 mb-6 text-sm text-ink/60">{heading.body}</p>

        <form action={confirmEmailLink}>
          <input type="hidden" name="token_hash" value={tokenHash} />
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="next" value={next} />
          <input type="hidden" name="setup" value={setup} />
          <button
            type="submit"
            className="w-full rounded-lg bg-wine px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            {heading.button}
          </button>
        </form>

        <p className="mt-6 text-xs text-ink/40">
          This link can only be used once. If it has already been used, sign in instead.
        </p>
      </Card>
    </main>
  );
}
