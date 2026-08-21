import { Card } from "@masseurmatch/ui";
import type { Metadata } from "next";
import Link from "next/link";

import { requireAdmin } from "@/lib/guards";

export const metadata: Metadata = {
  title: "Admin tools",
  robots: { index: false, follow: false },
};

const TOOLS = [
  ["/admin/billing", "Billing", "Subscription state and provider webhook events."],
  ["/admin/emails", "Email Center", "Campaign, template, and queue observability."],
  ["/admin/sms", "SMS", "Conversation logs, profiles, and unresolved follow-ups."],
  ["/admin/migrations", "Profile Imports", "External profile migration audit trail."],
  ["/admin/profile-cms", "Profile CMS", "Admin profile corrections with mandatory audit reason."],
  ["/admin/blog", "Blog", "Published content inventory managed by the public-content owner."],
  ["/admin/cities", "Cities", "Live directory coverage derived from profiles."],
  ["/admin/keywords", "Keywords", "Keyword inventory and recent trend measurements."],
  ["/admin/legal", "Legal", "Published policy and legal-document shortcuts."],
  ["/admin/settings", "Settings", "Production settings diagnostics and integration status."],
] as const;

export default async function AdminToolsPage() {
  await requireAdmin("/admin/tools");

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-semibold text-ink">Admin tools</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink/60">
        Operational tools retained from the OLD Admin. Experimental design-system and booking
        surfaces are intentionally not part of production operations.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {TOOLS.map(([href, label, description]) => (
          <Link key={href} href={href}>
            <Card className="h-full p-5 transition hover:border-wine/30">
              <h2 className="font-semibold text-ink">{label}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">{description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
