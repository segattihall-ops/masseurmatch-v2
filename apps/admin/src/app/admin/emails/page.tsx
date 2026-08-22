import type { Metadata } from "next";

import { requireAdmin } from "@/lib/guards";

import { EmailCenter } from "./email-center";

export const metadata: Metadata = {
  title: "Email Center",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function EmailCenterPage() {
  await requireAdmin("/emails");

  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 sm:py-12">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-wine">Communication</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Email Center</h1>
        <p className="mt-2 max-w-3xl text-sm text-ink/60">
          Compose, review, schedule and audit provider campaigns using the production lifecycle
          email queue. Marketing preferences and suppressions are enforced before delivery.
        </p>
      </header>
      <EmailCenter />
    </main>
  );
}
