import { buttonVariants } from "@masseurmatch/ui";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/**
 * 404.
 *
 * `follow: true` with `index: false` on purpose — the page itself is worthless
 * to a search index, but the links out of it are how a crawler that hit a stale
 * therapist URL finds the directory again. A blanket `nofollow` would strand it.
 *
 * The links are the point. A 404 whose only affordance is "go home" wastes the
 * one moment a visitor is looking for a way forward, and most arrivals here are
 * old profile URLs from before the migration.
 */
export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col items-center px-6 py-24 text-center">
      <p className="font-stat text-ds-32 text-ink/30">404</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink">We couldn&rsquo;t find that page</h1>
      <p className="mt-3 text-ink/60">
        The link may be out of date, or the therapist may no longer be listed.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className={buttonVariants()}>
          Go to the directory
        </Link>
        <Link href="/search" className={buttonVariants({ variant: "outline" })}>
          Search therapists
        </Link>
      </div>
    </main>
  );
}
