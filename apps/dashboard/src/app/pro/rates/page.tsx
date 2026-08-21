import Link from "next/link";

import { PageHeader } from "@/components/pro/page-header";
import { DetailRow, Section } from "@/components/pro/section";
import { requireTherapist } from "@/lib/guards";
import { getOrCreateMyProfile } from "@/lib/profile";

export const metadata = { title: "Rates | MasseurMatch" };
export const dynamic = "force-dynamic";

/** Prices are whole dollars in the database; "not set" is a real state, not zero. */
function money(value: number | null): string {
  return value === null || value === undefined ? "Not set" : `$${value}`;
}

/**
 * What the listing currently charges.
 *
 * Read-only, and links to the listing editor rather than repeating its form.
 * Two places to change a price is how the two end up disagreeing.
 */
export default async function ProRatesPage() {
  const viewer = await requireTherapist("/pro/rates");
  const { profile } = await getOrCreateMyProfile(viewer.user.id);

  return (
    <>
      <PageHeader
        eyebrow="Provider dashboard"
        title="Rates"
        subtitle="What clients see before they contact you."
        action={{ href: "/pro/listing", label: "Edit listing" }}
      />

      <Section title="Your pricing">
        <div>
          <DetailRow label="Starting price" value={money(profile.starting_price)} />
          <DetailRow label="Incall" value={money(profile.incall_price)} />
          <DetailRow label="Outcall" value={money(profile.outcall_price)} />
        </div>
      </Section>

      <Section title="Why it matters">
        <p className="text-sm text-muted-foreground">
          A listing with no price is filtered out of every price-sorted search, and rates count
          toward your{" "}
          <Link href="/pro/ai-coach" className="underline underline-offset-4">
            profile score
          </Link>
          . Outcall pricing is only shown when mobile service is switched on.
        </p>
      </Section>
    </>
  );
}
