import { buttonVariants } from "@masseurmatch/ui";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

/**
 * 404 for the dashboard.
 *
 * `nofollow` as well as `noindex` here, unlike the public site: there is nothing
 * behind these links a crawler should be walking into.
 *
 * The links point at the dashboard's own entry points rather than the public
 * site, because anyone reaching a 404 here is signed in and looking for
 * something of their own.
 */
export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col items-center px-6 py-24 text-center">
      <p className="font-stat text-ds-32 text-ink/30">404</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink">We couldn&rsquo;t find that page</h1>
      <p className="mt-3 text-ink/60">The link may be out of date.</p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/profile" className={buttonVariants()}>
          Your profile
        </Link>
        <Link href="/subscription" className={buttonVariants({ variant: "outline" })}>
          Subscription
        </Link>
      </div>
    </main>
  );
}
