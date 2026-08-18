import type { Metadata } from "next";

import {
  InstitutionalBand,
  InstitutionalCardGrid,
  InstitutionalCta,
  InstitutionalHero,
  InstitutionalPage,
  InstitutionalSection,
  InstitutionalSplit,
  InstitutionalSteps,
} from "@/components/institutional/institutional-page";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Massage Near Me";
const DESCRIPTION =
  "Find a male massage therapist by city, compare public profile details, and contact the independent provider directly.";
const PATH = "/near-me";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl(PATH) },
  openGraph: {
    type: "website",
    url: absoluteUrl(PATH),
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const dynamic = "force-static";

export default function Page() {
  return (
    <InstitutionalPage>
      <InstitutionalHero
        eyebrow="Local discovery"
        title="Massage near you starts"
        highlight="with the right local context."
        description={DESCRIPTION}
        actions={[
          { label: "Browse cities", href: "/cities" },
          { label: "Search therapists", href: "/search", secondary: true },
        ]}
        stats={[
          {
            value: "City first",
            label: "Local pages organize providers around markets they actually serve.",
          },
          {
            value: "Incall / outcall",
            label: "Profiles show the session formats a therapist offers.",
          },
          {
            value: "Direct contact",
            label: "Confirm the final details with the provider themselves.",
          },
        ]}
      />

      <InstitutionalBand>
        “Near me” is discovery, not automatic proximity. MasseurMatch organizes public listings by
        city and profile information; confirm the exact address, travel area, and availability with
        the therapist before arranging a session.
      </InstitutionalBand>

      <InstitutionalSection
        eyebrow="Start local"
        title="Use the city as the first filter, then compare the details."
        intro="A useful local search should reduce the field without pretending that every provider covers the same neighborhoods or travel radius."
      >
        <InstitutionalSteps
          steps={[
            {
              title: "Choose your city",
              body: "Browse city pages or search by market to see public therapists who list that city as part of their practice location.",
              meta: "Local intent",
            },
            {
              title: "Compare session format",
              body: "Check whether each therapist offers incall, outcall, or both and review the location information available on the profile.",
              meta: "Incall / outcall",
            },
            {
              title: "Compare services and rates",
              body: "Use techniques, service categories, published pricing, photos, and profile detail to narrow the shortlist.",
              meta: "Practical fit",
            },
            {
              title: "Confirm directly",
              body: "Ask the provider about exact location, travel area, timing, total price, and anything else important before meeting.",
              meta: "Direct contact",
            },
          ]}
        />
      </InstitutionalSection>

      <InstitutionalSection
        dark
        eyebrow="Session format"
        title="Incall and outcall answer different location questions."
      >
        <InstitutionalSplit
          dark
          left={
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d66b7a]">
                Incall
              </p>
              <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white">
                You travel to the provider&apos;s working location.
              </h3>
              <p className="mt-5 text-sm leading-7 text-white/60">
                The public profile can tell you that incall is offered and may include neighborhood
                context. Confirm the exact address, access instructions, parking, and session
                details directly before arrival.
              </p>
            </div>
          }
          right={
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d66b7a]">
                Outcall
              </p>
              <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white">
                The provider travels to an agreed location.
              </h3>
              <p className="mt-5 text-sm leading-7 text-white/60">
                Travel coverage can vary by neighborhood, hotel, distance, and provider policy.
                Confirm whether your location is covered and whether any travel charge applies
                before the session is arranged.
              </p>
            </div>
          }
        />
      </InstitutionalSection>

      <InstitutionalSection
        eyebrow="What to compare"
        title="Distance is only one part of a useful match."
      >
        <InstitutionalCardGrid
          cards={[
            {
              title: "Services",
              body: "Look for the techniques and service categories that match what you actually want from the session.",
            },
            {
              title: "Published rates",
              body: "Use profile pricing as an early comparison point, then confirm the final total directly with the therapist.",
            },
            {
              title: "Photos",
              body: "Approved provider photos are shown when available; initials remain the fallback when no approved usable image exists.",
            },
            {
              title: "Trust signals",
              body: "Profile review and identity verification provide specific platform signals, not a license check or service guarantee.",
            },
            {
              title: "Neighborhood context",
              body: "A city can contain very different travel times. Use the listed neighborhood information when available and verify the exact location directly.",
            },
            {
              title: "Provider communication",
              body: "The final fit includes how clearly the independent provider answers practical questions about timing, location, price, and expectations.",
            },
          ]}
        />
      </InstitutionalSection>

      <InstitutionalCta
        title="Start with the market you are actually in."
        description="Browse current city coverage or search the directory by the location and service you need."
        actions={[
          { label: "Browse all cities", href: "/cities" },
          { label: "Browse by state", href: "/states", secondary: true },
        ]}
      />
    </InstitutionalPage>
  );
}
