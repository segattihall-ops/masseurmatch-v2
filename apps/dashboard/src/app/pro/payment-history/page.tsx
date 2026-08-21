import { createServiceClient } from "@masseurmatch/db/client";
import Link from "next/link";

import { PageHeader } from "@/components/pro/page-header";
import { EmptyState, Section } from "@/components/pro/section";
import { requireTherapist } from "@/lib/guards";
import { getMySubscription } from "@/lib/subscription";
import { getOrCreateMyProfile } from "@/lib/profile";

export const metadata = { title: "Payment History | MasseurMatch" };
export const dynamic = "force-dynamic";

type BillingEvent = {
  id: string;
  kind: string;
  provider: string;
  occurred_at: string | null;
  processed_at: string;
  error: string | null;
};

/**
 * What the billing provider has told us about this subscription.
 *
 * `billing_events` is written by the webhook handlers with the service key and
 * has no client-side read path, so the read happens here and is scoped to the
 * caller's own subscription row before anything is returned.
 *
 * Failed events are shown rather than filtered out. A charge that did not go
 * through is the row a therapist most needs to see.
 */
export default async function ProPaymentHistoryPage() {
  const viewer = await requireTherapist("/pro/payment-history");
  const { profile } = await getOrCreateMyProfile(viewer.user.id);
  const subscription = await getMySubscription(profile.id).catch(() => null);

  let events: BillingEvent[] = [];

  if (subscription) {
    try {
      const { data } = await createServiceClient()
        .from("billing_events")
        .select("id,kind,provider,occurred_at,processed_at,error")
        .eq("subscription_id", subscription.id)
        .order("processed_at", { ascending: false })
        .limit(50);
      events = (data ?? []) as unknown as BillingEvent[];
    } catch {
      events = [];
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Provider dashboard"
        title="Payment history"
        subtitle="Every billing event recorded against your subscription."
        action={{ href: "/pro/subscription", label: "Manage subscription" }}
      />

      <Section title="Billing events">
        {events.length === 0 ? (
          <EmptyState>
            {subscription ? (
              "No billing events recorded yet."
            ) : (
              <>
                No subscription on this account.{" "}
                <Link href="/pro/subscription" className="underline underline-offset-4">
                  See the plans
                </Link>
                .
              </>
            )}
          </EmptyState>
        ) : (
          <ul className="space-y-2">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-border p-4"
              >
                <div>
                  <p className="font-medium text-foreground">{event.kind}</p>
                  <p className="text-xs text-muted-foreground">
                    {event.provider} ·{" "}
                    {new Date(event.occurred_at ?? event.processed_at).toLocaleString()}
                  </p>
                </div>
                {event.error ? (
                  <span className="text-sm text-destructive">{event.error}</span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
