import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  FadeIn,
  StaggerItem,
  StaggerList,
  buttonVariants,
} from "@masseurmatch/ui";
import type { Metadata } from "next";
import Link from "next/link";

import { getAdminMetrics } from "@/lib/admin";
import { requireAdmin } from "@/lib/guards";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin("/admin");
  const metrics = await getAdminMetrics();

  const cards = [
    { label: "Approved", value: metrics.approved },
    { label: "Pending review", value: metrics.pending },
    { label: "Draft", value: metrics.draft },
    { label: "Rejected", value: metrics.rejected },
    { label: "Suspended", value: metrics.suspended },
    { label: "Signups, last 30 days", value: metrics.signupsLast30Days },
  ];

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <FadeIn>
        <h1 className="text-3xl font-semibold text-ink">Admin</h1>
        <p className="mt-1 text-sm text-ink/60">Everything below is read live from the database.</p>
      </FadeIn>

      <StaggerList className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <StaggerItem key={card.label}>
            <Card className="h-full">
              <CardHeader>
                <CardDescription>{card.label}</CardDescription>
                <CardTitle className="font-stat text-ds-32">{card.value}</CardTitle>
              </CardHeader>
            </Card>
          </StaggerItem>
        ))}
      </StaggerList>

      <FadeIn delay={0.1} className="mt-8 flex flex-wrap gap-3">
        <Link href="/admin/moderation" className={buttonVariants()}>
          Moderation queue{metrics.pending > 0 ? ` (${metrics.pending})` : ""}
        </Link>
        <Link href="/admin/verifications" className={buttonVariants({ variant: "outline" })}>
          Identity verifications
        </Link>
        <Link href="/admin/demand-radar" className={buttonVariants({ variant: "outline" })}>
          Demand Radar
        </Link>
      </FadeIn>

      {metrics.byCity.length > 0 ? (
        <FadeIn delay={0.16} className="mt-10">
          <h2 className="mb-3 text-xl font-semibold text-ink">Approved profiles by city</h2>
          <Card className="p-4">
            <ul className="divide-y divide-ink/10">
              {metrics.byCity.map((row) => (
                <li key={row.city} className="flex justify-between py-2 text-sm">
                  <span className="text-ink">{row.city}</span>
                  <span className="tabular-nums text-ink/60">{row.count}</span>
                </li>
              ))}
            </ul>
          </Card>
        </FadeIn>
      ) : null}
    </main>
  );
}
