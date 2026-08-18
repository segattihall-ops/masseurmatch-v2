import type { Metadata } from "next";

import {
  InstitutionalBand,
  InstitutionalCardGrid,
  InstitutionalCta,
  InstitutionalHero,
  InstitutionalPage,
  InstitutionalSection,
  InstitutionalSplit,
} from "@/components/institutional/institutional-page";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Advertise on MasseurMatch";
const DESCRIPTION =
  "MasseurMatch visibility is built around promoting a therapist's own directory listing, not third-party banner ads or sponsored editorial.";
const PATH = "/advertise";

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
        eyebrow="Visibility"
        title="Promote the practice."
        highlight="Not someone else's ad."
        description={DESCRIPTION}
        actions={[
          { label: "See listing plans", href: "/pricing" },
          { label: "Advertising terms", href: "/advertising-terms", secondary: true },
        ]}
        stats={[
          { value: "Your listing", label: "Paid visibility applies to the provider's own MasseurMatch profile." },
          { value: "No ad network", label: "The public directory is not funded by third-party banner inventory." },
          { value: "No paid badge", label: "Subscription spend cannot purchase an identity-verification result." },
        ]}
      />

      <InstitutionalBand>
        MasseurMatch does not sell display banners, sponsored articles, or third-party ad-network
        inventory as the core product. Paid provider plans change eligible platform features around
        that provider&apos;s own listing.
      </InstitutionalBand>

      <InstitutionalSection
        eyebrow="What paid visibility means"
        title="A stronger directory presence, with the commercial relationship disclosed by the plan."
        intro="Visibility features are platform distribution tools. They do not change who the therapist is or what MasseurMatch has verified about them."
      >
        <InstitutionalCardGrid
          cards={[
            {
              title: "Featured eligibility",
              body: "Plans that include featured eligibility can participate in the platform's featured placement surfaces according to the current product rules.",
              meta: "Plan feature",
            },
            {
              title: "Visibility Spikes",
              body: "Eligible plans include a monthly number of temporary distribution boosts. The current quantity for each tier is shown on the pricing page.",
              meta: "Distribution tool",
            },
            {
              title: "More profile capacity",
              body: "Higher tiers can support more approved profile photos, giving providers more room to represent their practice on the public page.",
              meta: "Profile capacity",
            },
          ]}
        />
      </InstitutionalSection>

      <InstitutionalSection
        dark
        eyebrow="Commercial boundaries"
        title="Money can buy platform features. It cannot buy trust claims."
      >
        <InstitutionalSplit
          dark
          left={
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d66b7a]">
                A plan can change
              </p>
              <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white">
                Visibility and profile entitlements.
              </h3>
              <ul className="mt-6 space-y-4 text-sm leading-7 text-white/60">
                <li>• Photo limits assigned to the subscription tier.</li>
                <li>• Included Visibility Spikes.</li>
                <li>• Available Now eligibility and duration.</li>
                <li>• Featured eligibility where the plan includes it.</li>
              </ul>
            </div>
          }
          right={
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d66b7a]">
                A plan cannot change
              </p>
              <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white">
                What MasseurMatch actually verified.
              </h3>
              <ul className="mt-6 space-y-4 text-sm leading-7 text-white/60">
                <li>• It cannot buy an Identity Verified badge.</li>
                <li>• It cannot turn profile moderation into a professional-license check.</li>
                <li>• It cannot purchase a recommendation or guaranteed result.</li>
                <li>• It cannot make an unsupported profile claim true.</li>
              </ul>
            </div>
          }
        />
      </InstitutionalSection>

      <InstitutionalSection
        eyebrow="Other enquiries"
        title="Press, partnerships, and data requests are not listing ads."
        intro="If the request is not about promoting an independent therapist profile, route it through support so the right team can evaluate it separately from provider subscriptions."
      >
        <InstitutionalCardGrid
          cards={[
            {
              title: "Press",
              body: "Send media and publication enquiries through support@masseurmatch.com with enough context to route the request.",
            },
            {
              title: "Partnerships",
              body: "Partnership proposals are considered separately from listing plans and do not automatically create placement or endorsement rights.",
            },
            {
              title: "Data & research",
              body: "Requests involving platform data, research, or formal use should identify the purpose and requested scope before any review begins.",
            },
          ]}
        />
      </InstitutionalSection>

      <InstitutionalCta
        title="Want more visibility for your own listing?"
        description="Use the current pricing ladder for the exact profile and distribution features available to providers."
        actions={[
          { label: "Compare plans", href: "/pricing" },
          { label: "Contact MasseurMatch", href: "/contact", secondary: true },
        ]}
      />
    </InstitutionalPage>
  );
}
