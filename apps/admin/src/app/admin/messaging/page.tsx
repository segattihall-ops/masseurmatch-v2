import type { Metadata } from "next";

import { requireAdmin } from "@/lib/guards";

import { MessagingConsole } from "./messaging-console";

export const metadata: Metadata = {
  title: "Messaging",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function MessagingPage() {
  await requireAdmin("/messaging");

  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 sm:py-12">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-wine">Communication</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Messaging</h1>
        <p className="mt-2 max-w-3xl text-sm text-ink/60">
          Operate the real messaging contacts, inbox, Knotty controls and outbound transport queue.
          Opt-outs and the global pause are enforced again on the server when a message is queued.
        </p>
      </header>
      <MessagingConsole />
    </main>
  );
}
