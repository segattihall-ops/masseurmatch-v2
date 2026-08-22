import Link from "next/link";
import { FadeIn, StaggerItem, StaggerList } from "@masseurmatch/ui";
import type { CityListing, TherapistListing } from "@masseurmatch/db/actions/directory-config";
import { cityPath } from "@masseurmatch/db/actions/directory-config";

import {
  InstitutionalCardGrid,
  InstitutionalCta,
  InstitutionalFaq,
  InstitutionalSection,
} from "@/components/institutional/institutional-page";
import { TherapistCard } from "@/components/therapist-card";

const primaryAction =
  "inline-flex min-h-12 items-center justify-center rounded-full bg-brand-secondary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-secondary/15 transition duration-300 hover:-translate-y-0.5 hover:bg-action-primary-hover hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

const secondaryAction =
  "inline-flex min-h-12 items-center justify-center rounded-full border border-border-strong bg-bg-surface px-6 py-3 text-sm font-semibold text-text-primary transition duration-300 hover:-translate-y-0.5 hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function HomeFeaturedTherapists({ therapists }: { therapists: TherapistListing[] }) {
  if (therapists.length === 0) return null;

  return (
    <InstitutionalSection
      eyebrow="Featured profiles"
      title="Featured therapists ready to explore"
      intro="Compare public profiles, location, services, session formats, and rates shown on provider-submitted profiles before contacting an independent therapist directly."
    >
      <div className="flex justify-end">
        <Link href="/search" className={secondaryAction}>
          Browse all
          <span aria-hidden="true" className="ml-2">
            →
          </span>
        </Link>
      </div>

      <StaggerList
        whileInView
        as="ul"
        className="mt-8 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3"
      >
        {therapists.map((therapist) => (
          <StaggerItem as="li" key={therapist.id} className="h-full">
            <TherapistCard therapist={therapist} variant="home" />
          </StaggerItem>
        ))}
      </StaggerList>
    </InstitutionalSection>
  );
}

const discoveryFeatures = [
  [
    "Search faster",
    "Use city, service, and profile filters to narrow the directory without working through irrelevant listings.",
  ],
  [
    "Compare useful details",
    "Review specialties, location, incall or outcall options, published rates, and provider-submitted profile information in one place.",
  ],
  [
    "Local discovery",
    "Move from national discovery into city and service pages built around public directory listings.",
  ],
  [
    "Direct communication",
    "Contact the independent therapist directly. MasseurMatch does not insert a booking platform between you.",
  ],
] as const;

export function HomeDiscoverySection() {
  return (
    <InstitutionalSection
      eyebrow="Smarter discovery"
      title="Find the right profile without the noise"
      intro="Search public listings, compare the details providers publish, then contact an independent therapist directly."
    >
      <InstitutionalCardGrid
        cards={discoveryFeatures.map(([title, body], index) => ({
          eyebrow: String(index + 1).padStart(2, "0"),
          title,
          body,
        }))}
      />

      <FadeIn
        whileInView
        className="mt-12 rounded-[2rem] border border-border-subtle bg-bg-subtle px-7 py-9 text-center sm:px-10 sm:py-12"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-brand-secondary">
          Start searching
        </p>
        <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
          Ready to narrow the directory?
        </h3>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-text-secondary sm:text-base">
          Start with search, then use local pages and profile details to compare options for your
          needs.
        </p>
        <Link href="/search" className={`mt-7 ${primaryAction}`}>
          Search therapists
          <span aria-hidden="true" className="ml-2">
            →
          </span>
        </Link>
      </FadeIn>
    </InstitutionalSection>
  );
}

export function HomeCityDiscovery({ cities }: { cities: CityListing[] }) {
  if (cities.length === 0) return null;

  const visibleCities = cities.slice(0, 8);

  return (
    <InstitutionalSection
      eyebrow="Browse by city"
      title="Explore male massage by city"
      intro="Open local directory pages and compare therapists using current public listing data."
    >
      <div className="flex justify-end">
        <Link href="/cities" className={secondaryAction}>
          View all cities
          <span aria-hidden="true" className="ml-2">
            →
          </span>
        </Link>
      </div>

      <StaggerList
        whileInView
        as="ul"
        className="mt-8 grid list-none gap-px overflow-hidden rounded-[2rem] border border-border-subtle bg-border-subtle p-0 sm:grid-cols-2 lg:grid-cols-4"
      >
        {visibleCities.map((city) => (
          <StaggerItem as="li" key={cityPath(city)} className="bg-bg-surface">
            <Link
              href={cityPath(city)}
              className="group flex min-h-56 h-full flex-col justify-between p-7 transition duration-300 hover:bg-bg-subtle sm:p-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            >
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-secondary">
                  Local directory
                </p>
                <h3 className="mt-4 font-display text-xl font-semibold tracking-tight text-text-primary">
                  {city.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">{city.state}</p>
              </div>
              <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-brand-secondary">
                {city.therapistCount} {city.therapistCount === 1 ? "profile" : "profiles"} →
              </p>
            </Link>
          </StaggerItem>
        ))}
      </StaggerList>

      <FadeIn
        whileInView
        className="mt-10 rounded-3xl border border-border-subtle bg-bg-subtle px-7 py-7 text-center"
      >
        <p className="text-sm leading-6 text-text-secondary">
          City pages reflect therapists currently visible in the public directory.
        </p>
        <Link
          href="/cities"
          className="mt-3 inline-flex text-sm font-semibold text-brand-secondary underline-offset-4 hover:underline"
        >
          Browse the directory by location
        </Link>
      </FadeIn>
    </InstitutionalSection>
  );
}

const howItWorksSteps = [
  {
    number: "01",
    title: "Search and filter",
    description:
      "Start with city or service, then narrow the results using the public details that matter to you.",
    features: ["City discovery", "Service search", "Session format", "Published pricing"],
  },
  {
    number: "02",
    title: "Review and compare",
    description:
      "Read the full profile, compare specialties and location details, and check visible profile or identity signals.",
    features: ["Public profiles", "Profile details", "Incall or outcall", "Platform signals"],
  },
  {
    number: "03",
    title: "Contact directly",
    description:
      "Reach out to the independent therapist and arrange timing, location, pricing, and session details directly.",
    features: [
      "Direct contact",
      "No booking middleman",
      "No session commission",
      "Independent provider",
    ],
  },
] as const;

export function HomeHowItWorks() {
  return (
    <InstitutionalSection
      eyebrow="Simple process"
      title="How it works"
      intro="Three steps from discovery to direct contact. MasseurMatch is a directory and does not become a party to the massage appointment."
    >
      <StaggerList
        whileInView
        as="ol"
        className="grid list-none gap-px overflow-hidden rounded-[2rem] border border-border-subtle bg-border-subtle p-0 lg:grid-cols-3"
      >
        {howItWorksSteps.map((step) => (
          <StaggerItem as="li" key={step.number} className="min-h-80 bg-bg-surface p-7 sm:p-8">
            <span className="font-display text-5xl font-bold tracking-[-0.04em] text-brand-secondary/10">
              {step.number}
            </span>
            <h3 className="mt-8 font-display text-xl font-semibold tracking-tight text-text-primary">
              {step.title}
            </h3>
            <p className="mt-4 text-sm leading-7 text-text-secondary">{step.description}</p>
            <ul className="mt-6 list-none space-y-2 p-0">
              {step.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-text-muted"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-secondary" />
                  {feature}
                </li>
              ))}
            </ul>
          </StaggerItem>
        ))}
      </StaggerList>

      <div className="mt-10 flex justify-center">
        <Link href="/how-it-works" className={secondaryAction}>
          Learn how MasseurMatch works
          <span aria-hidden="true" className="ml-2">
            →
          </span>
        </Link>
      </div>
    </InstitutionalSection>
  );
}

const trustPillars = [
  [
    "Platform standards",
    "Profiles and content are subject to MasseurMatch platform rules. Platform review does not verify professional licenses, credentials, backgrounds, or service quality.",
  ],
  [
    "Direct contact",
    "MasseurMatch does not manage appointments or process massage-session payments between clients and providers.",
  ],
  [
    "Limited identity signals",
    "Where an identity badge appears, it refers only to the specific identity check described in the badge policy and is not a professional endorsement.",
  ],
  [
    "Independent providers",
    "Providers are independent third parties responsible for their own services, qualifications, appointments, pricing, payments, and legal compliance.",
  ],
] as const;

export function HomeTrustSection() {
  return (
    <InstitutionalSection
      dark
      eyebrow="Transparency & platform standards"
      title="Clear information without overpromising"
      intro="MasseurMatch explains its directory role and the limits of its platform signals so visitors can evaluate independent providers for themselves."
    >
      <InstitutionalCardGrid
        dark
        cards={trustPillars.map(([title, body], index) => ({
          eyebrow: String(index + 1).padStart(2, "0"),
          title,
          body,
        }))}
      />

      <FadeIn
        whileInView
        className="mt-12 overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#151517]"
      >
        <div className="border-b border-white/[0.08] p-7 sm:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d66b7a]">
            Platform transparency
          </p>
          <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Know what MasseurMatch does — and does not — verify
          </h3>
        </div>
        <div className="grid gap-px bg-white/[0.08] sm:grid-cols-3">
          {[
            [
              "Profile content",
              "Platform-rule review",
              "MasseurMatch may review profile content for compliance with platform rules. This is not license, credential, or background verification.",
            ],
            [
              "Identity badges",
              "Identity only",
              "A badge is a limited platform signal. It is not professional licensing, certification, a background check, endorsement, or guarantee.",
            ],
            [
              "Directory model",
              "Independent providers",
              "Providers control and are responsible for their services, qualifications, appointments, pricing, payments, and legal compliance.",
            ],
          ].map(([eyebrow, title, body]) => (
            <div key={eyebrow} className="bg-[#111113] p-7 sm:p-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/38">
                {eyebrow}
              </p>
              <p className="mt-3 font-display text-xl font-semibold tracking-tight text-white">
                {title}
              </p>
              <p className="mt-3 text-sm leading-7 text-white/58">{body}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-white/[0.08] p-7 sm:p-8">
          <p className="max-w-5xl text-sm leading-7 text-white/58">
            MasseurMatch is a directory platform only. Providers are independent third parties.
            MasseurMatch does not provide massage services, employ providers, verify professional
            licenses, conduct background checks, or guarantee provider qualifications, services,
            pricing, availability, legality, safety, quality, or results. Users are responsible for
            evaluating providers and making their own decisions.
          </p>
          <div className="mt-5 flex flex-wrap gap-4">
            <Link
              href="/safety"
              className="text-sm font-semibold text-[#d66b7a] underline-offset-4 hover:underline"
            >
              Safety guidance
            </Link>
            <Link
              href="/badge-disclaimer"
              className="text-sm font-semibold text-[#d66b7a] underline-offset-4 hover:underline"
            >
              Badge disclaimer
            </Link>
            <Link
              href="/platform-disclaimer"
              className="text-sm font-semibold text-[#d66b7a] underline-offset-4 hover:underline"
            >
              Platform disclaimer
            </Link>
          </div>
        </div>
      </FadeIn>
    </InstitutionalSection>
  );
}

const providerBenefits = [
  "Public directory profile",
  "Direct prospective-client contact",
  "Local city discovery",
  "No booking commission",
  "Clear practice details",
  "Optional visibility features",
] as const;

export function HomeProviderGrowth() {
  return (
    <InstitutionalSection
      eyebrow="For massage therapists"
      title="Build your public presence with MasseurMatch"
      intro="Create a public directory presence in the cities you work, show prospective clients the information you choose to publish, and let them contact you directly. MasseurMatch is not a booking service and does not take a commission from your massage-session payments."
    >
      <div className="grid overflow-hidden rounded-[2rem] border border-border-subtle lg:grid-cols-2">
        <FadeIn whileInView direction="right" className="bg-bg-surface p-7 sm:p-9 lg:p-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-secondary">
            Built for independent providers
          </p>
          <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight text-text-primary">
            A public directory presence you control.
          </h3>
          <ul className="mt-7 grid list-none gap-3 p-0 sm:grid-cols-2">
            {providerBenefits.map((benefit) => (
              <li
                key={benefit}
                className="flex items-center gap-2 text-sm font-medium text-text-primary"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-brand-secondary" />
                {benefit}
              </li>
            ))}
          </ul>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/for-therapists" className={primaryAction}>
              Join MasseurMatch
              <span aria-hidden="true" className="ml-2">
                →
              </span>
            </Link>
            <Link href="/pricing" className={secondaryAction}>
              View pricing
            </Link>
          </div>
        </FadeIn>

        <FadeIn
          whileInView
          direction="left"
          delay={0.08}
          className="border-t border-border-subtle bg-bg-subtle p-7 sm:p-9 lg:border-l lg:border-t-0 lg:p-12"
        >
          <div className="divide-y divide-border-subtle">
            {[
              [
                "Public profile",
                "Present specialties, service formats, rates, location, photos, and direct contact details you choose to publish.",
              ],
              [
                "Direct connections",
                "Prospective clients can use your public profile to reach you without an internal booking marketplace.",
              ],
              [
                "Session payments stay direct",
                "MasseurMatch does not process or take a commission from payments between clients and providers for massage sessions.",
              ],
            ].map(([title, description]) => (
              <div key={title} className="py-6 first:pt-0 last:pb-0">
                <h3 className="font-display text-xl font-semibold tracking-tight text-text-primary">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-text-secondary">{description}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </InstitutionalSection>
  );
}

export const homeFaqItems = [
  [
    "What is MasseurMatch?",
    "MasseurMatch is a directory for discovering independent massage therapists. Visitors browse public profiles and contact providers directly.",
  ],
  [
    "What does MasseurMatch review?",
    "MasseurMatch may review profile content for compliance with platform rules. Any such review is not professional license or credential verification, a background check, endorsement, or guarantee of service quality.",
  ],
  [
    "Does MasseurMatch book massage appointments?",
    "No. MasseurMatch does not schedule or manage client appointments. Session details are arranged directly with the independent provider.",
  ],
  [
    "Does MasseurMatch process massage-session payments?",
    "No. MasseurMatch does not process payments between clients and providers or take a commission from massage-session payments.",
  ],
  [
    "What does an ID verified badge mean?",
    "It refers only to the specific identity check described by MasseurMatch's badge policy. It is not professional licensing, certification, credential verification, a background check, endorsement, or a guarantee.",
  ],
  [
    "Are therapists MasseurMatch employees?",
    "No. Providers listed on MasseurMatch are independent third parties responsible for their own services, qualifications, appointments, pricing, payments, and legal compliance.",
  ],
  [
    "What do incall and outcall mean?",
    "When provided on a profile, incall means the provider may receive clients at their location, while outcall means the provider may travel to a client location. Confirm current details directly with the provider.",
  ],
] as const;

export function HomeFaq() {
  return (
    <InstitutionalSection
      eyebrow="Common questions"
      title="Everything you need to know."
      intro="A quick guide to the directory model, platform rules, direct contact, and limited identity signals."
    >
      <InstitutionalFaq items={homeFaqItems.map(([question, answer]) => ({ question, answer }))} />
      <Link
        href="/faq"
        className="mt-7 inline-flex text-sm font-semibold text-brand-secondary underline-offset-4 hover:underline"
      >
        View all FAQs
      </Link>
    </InstitutionalSection>
  );
}

export function HomeFinalCta() {
  return (
    <InstitutionalCta
      eyebrow="For therapists"
      title="Get listed today."
      description="Create a public directory profile, appear on relevant local discovery pages, and let prospective clients contact you directly."
      actions={[
        { label: "List your practice", href: "/for-therapists" },
        { label: "View pricing", href: "/pricing", secondary: true },
      ]}
    />
  );
}
