import { Card } from "@masseurmatch/ui";
import type { Metadata } from "next";

import { getEmailConsole } from "@/lib/admin-secondary";
import { requireAdmin } from "@/lib/guards";

export const metadata: Metadata = {
  title: "Email operations",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminEmailsPage() {
  await requireAdmin("/admin/emails");
  const { campaigns, templates, queued } = await getEmailConsole();

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold text-ink">Email operations</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink/60">
        Live campaign, template, and queue state. Sending remains owned by the transactional-email
        pipeline; this Admin does not bypass suppression, consent, or delivery safeguards.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-ink/55">Campaigns</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{campaigns.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-ink/55">Templates</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{templates.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-ink/55">Queued deliveries</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{queued}</p>
        </Card>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-ink">Campaigns</h2>
        <div className="mt-4 space-y-3">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{campaign.name}</p>
                  <p className="mt-1 text-sm text-ink/60">{campaign.subject}</p>
                </div>
                <span className="rounded-full bg-ink/5 px-2 py-1 text-xs capitalize text-ink/60">
                  {campaign.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-ink/45">
                {campaign.send_category} · scheduled {new Date(campaign.scheduled_for).toLocaleString()}
              </p>
            </Card>
          ))}
          {campaigns.length === 0 ? <p className="text-sm text-ink/50">No campaigns stored.</p> : null}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-ink">Templates</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {templates.map((template) => (
            <Card key={template.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{template.name}</p>
                  <p className="mt-1 text-sm text-ink/60">{template.subject}</p>
                </div>
                <span className="text-xs text-ink/45">{template.is_active ? "Active" : "Inactive"}</span>
              </div>
              {template.description ? <p className="mt-2 text-xs text-ink/50">{template.description}</p> : null}
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
