"use client";

import { reportError } from "@masseurmatch/config/observability";
import { Button, buttonVariants } from "@masseurmatch/ui";
import Link from "next/link";
import { useEffect } from "react";

/**
 * Route-level error boundary.
 *
 * Must be a client component — React needs `reset` to re-render the segment.
 *
 * What is deliberately NOT shown: `error.message`. In production Next replaces
 * server error messages with a generic string and a digest, but this boundary
 * also catches client-side errors whose messages are whatever threw — which for
 * a failed data fetch can include a query, a column list, or a row id. The
 * digest is shown instead, because it is the value that lets someone match a
 * user's screenshot to a server log without putting anything else on screen.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { digest: error.digest, where: "web/error-boundary" });
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col items-center px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold text-ink">Something went wrong</h1>
      <p className="mt-3 text-ink/60">
        This one is on us. Try again in a moment — if it keeps happening, the directory is still
        browsable from the home page.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Go to the directory
        </Link>
      </div>

      {error.digest ? (
        <p className="mt-8 text-xs text-ink/40">
          Reference: <code>{error.digest}</code>
        </p>
      ) : null}
    </main>
  );
}
