import Link from "next/link";

import { PageHeader } from "@/components/pro/page-header";
import { DetailRow, Section } from "@/components/pro/section";
import { requireTherapist } from "@/lib/guards";
import { getOrCreateMyProfile } from "@/lib/profile";

export const metadata = { title: "Settings | MasseurMatch" };
export const dynamic = "force-dynamic";

/**
 * Account settings.
 *
 * Deliberately a map rather than a second copy of every form. Each thing that
 * can be changed already has a page that owns it, and duplicating those fields
 * here would create two places to write the same column.
 */
export default async function ProSettingsPage() {
  const viewer = await requireTherapist("/pro/settings");
  const { profile } = await getOrCreateMyProfile(viewer.user.id);

  const destinations = [
    { href: "/pro/listing", label: "Listing", note: "Name, headline, bio, services and rates" },
    { href: "/pro/photos", label: "Photos", note: "Gallery and primary photo" },
    { href: "/pro/growth", label: "Availability", note: "Travel dates and specials" },
    { href: "/pro/notifications", label: "Notifications", note: "What we send you and when" },
    { href: "/pro/subscription", label: "Subscription", note: "Plan, billing and cancellation" },
    { href: "/reset-password", label: "Password", note: "Change your sign-in password" },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Provider dashboard"
        title="Settings"
        subtitle="Your account, and where each part of it is changed."
      />

      <Section title="Account">
        <div>
          <DetailRow label="Email" value={profile.email ?? viewer.user.email ?? "Not set"} />
          <DetailRow label="Phone" value={profile.phone ?? "Not set"} />
          <DetailRow
            label="Public URL"
            value={profile.slug ? `/${profile.slug}` : "Not assigned"}
          />
          <DetailRow
            label="Last updated"
            value={new Date(profile.updated_at).toLocaleDateString()}
          />
        </div>
      </Section>

      <Section title="Change something">
        <ul className="space-y-2">
          {destinations.map((destination) => (
            <li key={destination.href}>
              <Link
                href={destination.href}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-4 transition hover:bg-muted"
              >
                <span>
                  <span className="block font-medium text-foreground">{destination.label}</span>
                  <span className="block text-sm text-muted-foreground">{destination.note}</span>
                </span>
                <span aria-hidden className="text-muted-foreground">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
