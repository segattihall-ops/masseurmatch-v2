import Link from "next/link";
import {
  Card,
  CardContent,
  FadeIn,
  StaggerItem,
  StaggerList,
  buttonVariants,
} from "@masseurmatch/ui";
import type { CityListing, TherapistListing } from "@masseurmatch/db/actions/directory-config";
import { cityPath } from "@masseurmatch/db/actions/directory-config";

import { TherapistCard } from "@/components/therapist-card";

const sectionHeading =
  "font-display text-ds-32 font-bold tracking-tight text-text-primary sm:text-ds-40";

export function HomeFeaturedTherapists({ therapists }: { therapists: TherapistListing[] }) {
  if (therapists.length === 0) return null;

  return (
    <section className="border-y border-border-subtle bg-gradient-to-b from-bg-subtle to-background py-20 sm:py-24 lg:py-28">
      <div className="mx-auto w-full max-w-7xl px-6">
        <FadeIn whileInView className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary">
              Featured profiles
            </p>
            <h2 className={`mt-4 ${sectionHeading}`}>Featured therapists ready to explore</h2>
            <p className="mt-4 max-w-2xl text-ds-18 leading-8 text-text-secondary">
              Compare reviewed public profiles, location, services, session formats, and published
              rates before contacting a therapist directly.
            </p>
          </div>
          <Link
            href="/search"
            className={buttonVariants({ size: "lg", variant: "outline" })}
          >
            Browse all
          </Link>
        </FadeIn>

        <StaggerList
          whileInView
          as="ul"
          className="mt-12 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3"
        >
          {therapists.map((therapist) => (
            <StaggerItem as="li" key={therapist.id} className="h-full">
              <TherapistCard therapist={therapist} variant="home" />
            </StaggerItem>
          ))}
        </StaggerList>
      </div>
    </section>
  );
}

const discoveryFeatures = [
  [
    "Search faster",
    "Use city, service, and profile filters to narrow the directory without working through irrelevant listings.",
  ],
  [
    "Compare useful details",
    "Review specialties, location, incall or outcall options, published rates, and profile information in one place.",
  ],
  [
    "Local discovery",
    "Move from national discovery into city and service pages built around real public directory inventory.",
  ],
  [
    "Direct communication",
    "Contact the independent therapist directly. MasseurMatch does not insert a booking platform between you.",
  ],
] as const;

export function HomeDiscoverySection() {
  return (
    <section className="bg-background py-20 sm:py-24 lg:py-28" aria-labelledby="discovery-title">
      <div className="mx-auto w-full max-w-7xl px-6">
        <FadeIn whileInView className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary">
            Smarter discovery
          </p>
          <h2 id="discovery-title" className={`mt-4 ${sectionHeading}`}>
            Find the right profile without the noise
          </h2>
          <p className="mt-5 text-ds-18 leading-8 text-text-secondary">
            The V2 directory keeps discovery simple: search real listings, compare the details that
            matter, then connect directly.
          </p>
        </FadeIn>

        <StaggerList
          whileInView
          as="ul"
          className="mt-12 grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 lg:grid-cols-4"
        >
          {discoveryFeatures.map(([title, description], index) => (
            <StaggerItem as="li" key={title}>
              <Card className="h-full border-border-subtle bg-bg-surface">
                <CardContent className="p-7 pt-7">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-sm font-bold text-brand-secondary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-6 font-display text-ds-18 font-semibold text-text-primary">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-text-secondary">{description}</p>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerList>

        <FadeIn
          whileInView
          className="mt-14 rounded-[2rem] border border-border-subtle bg-bg-subtle px-7 py-9 text-center sm:px-10 sm:py-12"
        >
          <h3 className="font-display text-ds-24 font-bold text-text-primary">
            Ready to narrow the directory?
          </h3>
          <p className="mx-auto mt-3 max-w-2xl leading-7 text-text-secondary">
            Start with search, then use local pages and profile details to compare the best fit for
            your needs.
          </p>
          <Link href="/search" className={`mt-7 ${buttonVariants({ size: "lg" })}`}>
            Search therapists
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}

export function HomeCityDiscovery({ cities }: { cities: CityListing[] }) {
  if (cities.length === 0) return null;

  const visibleCities = cities.slice(0, 8);

  return (
    <section className="border-y border-border-subtle bg-bg-subtle py-20 sm:py-24 lg:py-28">
      <div className="mx-auto w-full max-w-7xl px-6">
        <FadeIn whileInView className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary">
              Browse by city
            </p>
            <h2 className={`mt-4 ${sectionHeading}`}>Explore male massage by city</h2>
            <p className="mt-4 max-w-2xl text-ds-18 leading-8 text-text-secondary">
              Open local directory pages and compare therapists using live public listing data.
            </p>
          </div>
          <Link href="/cities" className={buttonVariants({ size: "lg", variant: "outline" })}>
            View all cities
          </Link>
        </FadeIn>

        <StaggerList
          whileInView
          as="ul"
          className="mt-12 grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 lg:grid-cols-4"
        >
          {visibleCities.map((city) => (
            <StaggerItem as="li" key={cityPath(city)}>
              <Link
                href={cityPath(city)}
                className="group block h-full rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Card className="h-full min-h-44 border-border-subtle transition-transform duration-200 group-hover:-translate-y-1">
                  <CardContent className="flex h-full flex-col justify-between p-7 pt-7">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-secondary">
                        Local directory
                      </p>
                      <h3 className="mt-5 font-display text-ds-24 font-bold text-text-primary">
                        {city.name}
                      </h3>
                      <p className="mt-1 text-sm text-text-secondary">{city.state}</p>
                    </div>
                    <p className="mt-7 text-sm font-semibold text-brand-secondary">
                      {city.therapistCount} {city.therapistCount === 1 ? "profile" : "profiles"}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </StaggerItem>
          ))}
        </StaggerList>

        <FadeIn
          whileInView
          className="mt-10 rounded-3xl border border-border-subtle bg-background px-7 py-7 text-center"
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
      </div>
    </section>
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
    features: ["Reviewed profiles", "Profile details", "Incall or outcall", "Trust signals"],
  },
  {
    number: "03",
    title: "Contact directly",
    description:
      "Reach out to the independent therapist and arrange timing, location, pricing, and session details directly.",
    features: ["Direct contact", "No booking middleman", "No session commission", "Independent provider"],
  },
] as const;

export function HomeHowItWorks() {
  return (
    <section className="bg-background py-20 sm:py-24 lg:py-28" aria-labelledby="how-home-title">
      <div className="mx-auto w-full max-w-7xl px-6">
        <FadeIn whileInView className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary">
            Simple process
          </p>
          <h2 id="how-home-title" className={`mt-4 ${sectionHeading}`}>
            How it works
          </h2>
          <p className="mt-5 text-ds-18 leading-8 text-text-secondary">
            Three steps from discovery to direct contact, without turning MasseurMatch into a
            booking marketplace.
          </p>
        </FadeIn>

        <div className="mx-auto mt-14 max-w-5xl space-y-7">
          {howItWorksSteps.map((step) => (
            <FadeIn key={step.number} whileInView>
              <div className="grid gap-6 rounded-[2rem] border border-border-subtle bg-bg-surface p-7 sm:p-9 lg:grid-cols-[96px_1fr]">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-secondary font-display text-ds-18 font-bold text-text-inverse">
                  {step.number}
                </div>
                <div>
                  <h3 className="font-display text-ds-24 font-bold text-text-primary">
                    {step.title}
                  </h3>
                  <p className="mt-3 max-w-3xl leading-7 text-text-secondary">
                    {step.description}
                  </p>
                  <ul className="mt-5 grid list-none gap-2 p-0 sm:grid-cols-2">
                    {step.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm font-medium text-text-primary">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-secondary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn whileInView className="mt-12 text-center">
          <Link href="/how-it-works" className={buttonVariants({ size: "lg", variant: "outline" })}>
            Learn how MasseurMatch works
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}

const trustPillars = [
  [
    "Reviewed before going live",
    "Every public profile passes platform review before publication. Review is not professional license verification or a background check.",
  ],
  [
    "Direct contact",
    "MasseurMatch does not manage appointments or take a commission from massage-session payments.",
  ],
  [
    "Clear identity signals",
    "Where an identity badge appears, it refers only to the specific platform identity check described in the badge policy.",
  ],
  [
    "Professional standards",
    "Content and conduct policies establish expectations for professional, respectful, non-sexual directory use.",
  ],
] as const;

export function HomeTrustSection() {
  return (
    <section className="border-y border-border-subtle bg-text-primary py-20 text-text-inverse sm:py-24 lg:py-28">
      <div className="mx-auto w-full max-w-7xl px-6">
        <FadeIn whileInView className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-electric">
            Trust and safety
          </p>
          <h2 className="mt-4 font-display text-ds-32 font-bold tracking-tight sm:text-ds-40">
            Built around clearer expectations
          </h2>
          <p className="mt-5 text-ds-18 leading-8 text-text-inverse/75">
            MasseurMatch makes its directory role, profile review, and platform signals explicit so
            visitors can make better informed decisions.
          </p>
        </FadeIn>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {trustPillars.map(([title, description], index) => (
            <article
              key={title}
              className="rounded-[1.5rem] border border-white/10 bg-white/5 p-7"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sm font-bold text-brand-electric">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-6 font-display text-ds-18 font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-text-inverse/70">{description}</p>
            </article>
          ))}
        </div>

        <FadeIn
          whileInView
          className="mt-14 rounded-[2rem] border border-white/10 bg-white/5 p-7 sm:p-10"
        >
          <div className="border-b border-white/10 pb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-electric">
              How we build trust
            </p>
            <h3 className="mt-3 font-display text-ds-24 font-bold">Know what each signal means</h3>
          </div>
          <div className="mt-7 grid gap-5 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-[0.14em] text-text-inverse/55">Profile review</p>
              <p className="mt-3 font-display text-ds-18 font-semibold">Before publication</p>
              <p className="mt-2 text-sm leading-6 text-text-inverse/65">
                New profiles are reviewed before they become publicly visible.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-[0.14em] text-text-inverse/55">Identity badges</p>
              <p className="mt-3 font-display text-ds-18 font-semibold">Identity only</p>
              <p className="mt-2 text-sm leading-6 text-text-inverse/65">
                A badge is not professional licensing, certification, or a service-quality guarantee.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-[0.14em] text-text-inverse/55">Directory model</p>
              <p className="mt-3 font-display text-ds-18 font-semibold">Independent providers</p>
              <p className="mt-2 text-sm leading-6 text-text-inverse/65">
                Therapists manage their own services, appointments, qualifications, and payments.
              </p>
            </div>
          </div>
          <div className="mt-7 flex flex-wrap gap-4">
            <Link
              href="/safety"
              className="text-sm font-semibold text-brand-electric underline-offset-4 hover:underline"
            >
              Safety guidance
            </Link>
            <Link
              href="/badge-disclaimer"
              className="text-sm font-semibold text-brand-electric underline-offset-4 hover:underline"
            >
              Badge disclaimer
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

const providerBenefits = [
  "Professional public profile",
  "Direct prospective-client contact",
  "Local city discovery",
  "No booking commission",
  "Clear practice details",
  "Optional visibility features",
] as const;

export function HomeProviderGrowth() {
  return (
    <section className="bg-background py-20 sm:py-24 lg:py-28">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:items-center lg:gap-16">
        <FadeIn whileInView>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary">
            For massage therapists
          </p>
          <h2 className={`mt-4 ${sectionHeading}`}>
            Grow your practice <span className="text-brand-secondary">with MasseurMatch</span>
          </h2>
          <p className="mt-6 text-ds-18 leading-8 text-text-secondary">
            Build a public directory presence in the cities you actually work, show prospective
            clients what you offer, and let them contact you directly. MasseurMatch is not a booking
            service and does not take a commission from your massage-session payments.
          </p>
          <ul className="mt-8 grid list-none gap-3 p-0 sm:grid-cols-2">
            {providerBenefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-secondary" />
                {benefit}
              </li>
            ))}
          </ul>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/for-therapists" className={buttonVariants({ size: "lg" })}>
              Join MasseurMatch
            </Link>
            <Link href="/pricing" className={buttonVariants({ size: "lg", variant: "outline" })}>
              View pricing
            </Link>
          </div>
        </FadeIn>

        <div className="space-y-4">
          {[
            [
              "Professional profile",
              "Present specialties, service formats, rates, location, photos, and direct contact details clearly.",
            ],
            [
              "Direct connections",
              "Prospective clients can use your public profile to reach you without an internal booking marketplace.",
            ],
            [
              "Keep your session revenue",
              "MasseurMatch does not process or take a commission from payments for massage sessions.",
            ],
          ].map(([title, description]) => (
            <Card key={title} className="border-border-subtle">
              <CardContent className="p-7 pt-7">
                <h3 className="font-display text-ds-18 font-semibold text-text-primary">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export const homeFaqItems = [
  [
    "What is MasseurMatch?",
    "MasseurMatch is a directory for discovering independent massage therapists. Visitors browse public profiles and contact therapists directly.",
  ],
  [
    "Are profiles reviewed before they go live?",
    "Yes. Public profiles are reviewed before publication. Profile review is not professional license verification, a background check, or a guarantee of service quality.",
  ],
  [
    "Does MasseurMatch book massage appointments?",
    "No. MasseurMatch does not schedule or manage client appointments. Session details are arranged directly with the independent therapist.",
  ],
  [
    "Does MasseurMatch process massage-session payments?",
    "No. MasseurMatch does not process payments between clients and therapists or take a commission from massage-session payments.",
  ],
  [
    "What does an ID verified badge mean?",
    "It refers only to the identity check described by MasseurMatch's badge policy. It is not professional licensing, certification, a background check, or a guarantee.",
  ],
  [
    "What do incall and outcall mean?",
    "When provided on a profile, incall means the therapist may receive clients at their location, while outcall means the therapist may travel to a client location. Confirm current details directly with the therapist.",
  ],
] as const;

export function HomeFaq() {
  return (
    <section className="border-y border-border-subtle bg-bg-subtle py-20 sm:py-24 lg:py-28">
      <div className="mx-auto w-full max-w-5xl px-6">
        <FadeIn whileInView>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary">
            Common questions
          </p>
          <h2 className="mt-4 font-display text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[0.98] tracking-tight text-text-primary">
            Everything you need to know.
          </h2>
        </FadeIn>

        <div className="mt-10 divide-y divide-border-subtle border-y border-border-subtle">
          {homeFaqItems.map(([question, answer]) => (
            <details key={question} className="group py-6">
              <summary className="cursor-pointer list-none pr-8 font-display text-ds-18 font-semibold text-text-primary marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:text-ds-24">
                {question}
              </summary>
              <p className="mt-4 max-w-3xl leading-7 text-text-secondary">{answer}</p>
            </details>
          ))}
        </div>

        <Link
          href="/faq"
          className="mt-7 inline-flex text-sm font-semibold text-brand-secondary underline-offset-4 hover:underline"
        >
          View all FAQs
        </Link>
      </div>
    </section>
  );
}

export function HomeFinalCta() {
  return (
    <section className="relative overflow-hidden bg-text-primary py-24 text-text-inverse lg:py-32">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-secondary/20 blur-3xl" />
      </div>
      <div className="relative mx-auto w-full max-w-4xl px-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-inverse/60">
          For therapists
        </p>
        <h2 className="mt-5 font-display text-[clamp(2.75rem,7vw,5.75rem)] font-bold leading-[0.92] tracking-tight">
          Get listed today.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-ds-18 leading-8 text-text-inverse/70">
          Create a professional public profile, reach local discovery pages, and let prospective
          clients contact you directly.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/for-therapists" className={buttonVariants({ size: "lg" })}>
            List your practice
          </Link>
          <Link
            href="/pricing"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 px-6 text-sm font-semibold text-text-inverse transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            View pricing
          </Link>
        </div>
      </div>
    </section>
  );
}
