import Link from "next/link";
import { buttonVariants, Card, CardContent, FadeIn, Input, StaggerItem, StaggerList } from "@masseurmatch/ui";
import type { CityListing, TherapistListing } from "@masseurmatch/db/actions/directory-config";
import { cityPath } from "@masseurmatch/db/actions/directory-config";

import { TherapistCard } from "@/components/therapist-card";

const sectionHeading = "font-display text-ds-32 font-bold tracking-tight text-text-primary sm:text-ds-40";

export function HomeHero({ therapistCount, cityCount }: { therapistCount: number; cityCount: number }) {
  return (
    <section className="relative overflow-hidden border-b border-border-subtle bg-bg-subtle">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -right-28 -top-32 h-96 w-96 rounded-full bg-brand-soft opacity-70 blur-3xl" />
        <div className="absolute -bottom-40 left-1/4 h-80 w-80 rounded-full bg-bg-elevated opacity-80 blur-3xl" />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-6 pb-16 pt-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:pb-24 lg:pt-24">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-secondary">
            Independent massage therapist directory
          </p>
          <h1 className="mt-5 max-w-4xl font-display text-ds-48 font-bold tracking-tight text-text-primary sm:text-ds-56">
            Find the right massage therapist for you.
          </h1>
          <p className="mt-6 max-w-2xl text-ds-18 leading-8 text-text-secondary">
            Explore public profiles, compare specialties, location and service details, then contact independent therapists directly.
          </p>

          <form action="/search" method="get" className="mt-8 max-w-2xl" role="search">
            <label htmlFor="home-search" className="sr-only">
              Search therapists by name, city or specialty
            </label>
            <div className="flex flex-col gap-3 rounded-3xl border border-border-subtle bg-bg-elevated p-3 shadow-sm sm:flex-row">
              <Input
                id="home-search"
                name="q"
                type="search"
                placeholder="Search by name, city or specialty"
                className="min-h-12 flex-1 border-0 bg-transparent shadow-none"
              />
              <button type="submit" className={buttonVariants({ size: "lg" })}>
                Search therapists
              </button>
            </div>
          </form>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/search" className={buttonVariants({ size: "lg", variant: "outline" })}>
              Browse directory
            </Link>
            <Link href="/for-therapists" className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-brand-secondary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              List your practice
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1" aria-label="Directory highlights">
          <Card className="overflow-hidden border-border-subtle bg-bg-elevated/95">
            <CardContent className="p-7 pt-7">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-secondary">Built for discovery</p>
              <p className="mt-3 font-display text-ds-24 font-bold tracking-tight text-text-primary">
                Profiles with useful details before you reach out.
              </p>
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                Review specialties, location, incall or outcall information and other public profile details in one place.
              </p>
            </CardContent>
          </Card>

          {therapistCount > 0 || cityCount > 0 ? (
            <Card className="border-border-subtle bg-bg-elevated/95">
              <CardContent className="grid grid-cols-2 gap-6 p-7 pt-7">
                <div>
                  <p className="font-display text-ds-32 font-bold text-text-primary">{therapistCount}</p>
                  <p className="mt-1 text-sm text-text-secondary">public {therapistCount === 1 ? "profile" : "profiles"}</p>
                </div>
                <div>
                  <p className="font-display text-ds-32 font-bold text-text-primary">{cityCount}</p>
                  <p className="mt-1 text-sm text-text-secondary">active {cityCount === 1 ? "city" : "cities"}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border-subtle bg-bg-elevated/95">
              <CardContent className="p-7 pt-7">
                <p className="font-display text-ds-18 font-semibold text-text-primary">Direct contact, clear roles.</p>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  MasseurMatch is a directory. Therapists operate independently and manage their own appointments and payments.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}

export function FeaturedTherapistsSection({ therapists }: { therapists: TherapistListing[] }) {
  if (therapists.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20" aria-labelledby="featured-therapists-title">
      <FadeIn whileInView className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">Explore profiles</p>
          <h2 id="featured-therapists-title" className={`mt-3 ${sectionHeading}`}>
            Featured massage therapists
          </h2>
          <p className="mt-3 max-w-2xl text-text-secondary">
            Discover public profiles from independent therapists currently visible in the MasseurMatch directory.
          </p>
        </div>
        <Link href="/search" className="text-sm font-semibold text-brand-secondary underline-offset-4 hover:underline">
          View full directory
        </Link>
      </FadeIn>

      <StaggerList whileInView as="ul" className="mt-9 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {therapists.map((therapist, index) => (
          <StaggerItem as="li" key={therapist.id}>
            <TherapistCard therapist={therapist} priority={index === 0} />
          </StaggerItem>
        ))}
      </StaggerList>
    </section>
  );
}

export function CityDiscoverySection({ cities }: { cities: CityListing[] }) {
  if (cities.length === 0) return null;

  const visibleCities = cities.slice(0, 8);

  return (
    <section className="border-y border-border-subtle bg-bg-subtle" aria-labelledby="city-discovery-title">
      <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20">
        <FadeIn whileInView className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">Browse by location</p>
          <h2 id="city-discovery-title" className={`mt-3 ${sectionHeading}`}>
            Find massage therapists by city
          </h2>
          <p className="mt-3 text-text-secondary">
            City pages are generated from therapists currently visible in the public directory, so every count below comes from real listing data.
          </p>
        </FadeIn>

        <StaggerList whileInView as="ul" className="mt-9 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {visibleCities.map((city) => (
            <StaggerItem as="li" key={cityPath(city)}>
              <Link href={cityPath(city)} className="group block h-full rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <Card className="h-full transition-transform duration-200 group-hover:-translate-y-1">
                  <CardContent className="p-6 pt-6">
                    <p className="font-display text-ds-18 font-semibold text-text-primary">{city.name}</p>
                    <p className="mt-1 text-sm text-text-secondary">{city.state}</p>
                    <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-brand-secondary">
                      {city.therapistCount} {city.therapistCount === 1 ? "therapist" : "therapists"}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </StaggerItem>
          ))}
        </StaggerList>

        <div className="mt-8">
          <Link href="/cities" className={buttonVariants({ variant: "outline" })}>
            Explore all cities
          </Link>
        </div>
      </div>
    </section>
  );
}

const clientSteps = [
  ["01", "Discover", "Search by location, specialty or profile details that matter to you."],
  ["02", "Compare", "Review public profile information, services and contact options."],
  ["03", "Contact directly", "Reach out to the independent therapist and arrange details with them directly."],
] as const;

export function HowItWorksSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20" aria-labelledby="how-it-works-title">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <FadeIn whileInView>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">Simple by design</p>
          <h2 id="how-it-works-title" className={`mt-3 ${sectionHeading}`}>
            How MasseurMatch works
          </h2>
          <p className="mt-4 max-w-xl leading-7 text-text-secondary">
            MasseurMatch helps people discover independent massage therapists. It does not operate therapist businesses, schedule appointments or process client payments.
          </p>
          <Link href="/how-it-works" className="mt-6 inline-flex text-sm font-semibold text-brand-secondary underline-offset-4 hover:underline">
            Learn how the directory works
          </Link>
        </FadeIn>

        <ol className="grid gap-4 sm:grid-cols-3">
          {clientSteps.map(([number, title, description]) => (
            <li key={number} className="rounded-3xl border border-border-subtle bg-bg-elevated p-6">
              <span className="text-xs font-semibold tracking-[0.16em] text-brand-secondary">{number}</span>
              <h3 className="mt-4 font-display text-ds-18 font-semibold text-text-primary">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const differentiators = [
  ["Rich profiles", "See specialties, service categories, location and available profile details before making contact."],
  ["Location discovery", "Browse active cities and find therapists using real public directory data."],
  ["Incall and outcall context", "Profiles can show whether a therapist offers incall, outcall or both when that information is provided."],
  ["Direct connection", "Contact therapists directly rather than being routed through an internal booking marketplace."],
  ["Professional standards", "Content and conduct policies set expectations for professional, non-sexual directory use."],
  ["Clear verification language", "Identity or profile indicators describe platform checks only and are not professional licensing or certification."],
] as const;

export function DifferentiatorsSection() {
  return (
    <section className="border-y border-border-subtle bg-text-primary text-bg-elevated" aria-labelledby="why-masseurmatch-title">
      <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20">
        <FadeIn whileInView className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">Built around useful information</p>
          <h2 id="why-masseurmatch-title" className="mt-3 font-display text-ds-32 font-bold tracking-tight sm:text-ds-40">
            A clearer way to discover independent therapists
          </h2>
        </FadeIn>

        <div className="mt-9 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {differentiators.map(([title, description]) => (
            <article key={title} className="bg-text-primary p-6 sm:p-7">
              <h3 className="font-display text-ds-18 font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-bg-muted">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TrustSection({ therapistCount, cityCount }: { therapistCount: number; cityCount: number }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20" aria-labelledby="trust-title">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <FadeIn whileInView>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">Trust through clarity</p>
          <h2 id="trust-title" className={`mt-3 ${sectionHeading}`}>
            Know what the platform does, and what it does not do
          </h2>
          <p className="mt-4 max-w-xl leading-7 text-text-secondary">
            MasseurMatch provides directory tools, profile information and reporting pathways. Independent therapists remain responsible for their own services, qualifications, scheduling and payments.
          </p>
        </FadeIn>

        <Card className="border-border-subtle">
          <CardContent className="p-7 pt-7 sm:p-8 sm:pt-8">
            {therapistCount > 0 && cityCount > 0 ? (
              <div className="mb-7 grid grid-cols-2 gap-6 border-b border-border-subtle pb-7">
                <div>
                  <p className="font-display text-ds-32 font-bold text-text-primary">{therapistCount}</p>
                  <p className="mt-1 text-sm text-text-secondary">visible public {therapistCount === 1 ? "profile" : "profiles"}</p>
                </div>
                <div>
                  <p className="font-display text-ds-32 font-bold text-text-primary">{cityCount}</p>
                  <p className="mt-1 text-sm text-text-secondary">cities represented</p>
                </div>
              </div>
            ) : null}
            <nav aria-label="Trust and safety resources" className="grid gap-3 sm:grid-cols-2">
              <Link href="/safety" className="rounded-2xl border border-border-subtle p-4 text-sm font-semibold text-text-primary hover:bg-bg-subtle">Safety resources</Link>
              <Link href="/badge-disclaimer" className="rounded-2xl border border-border-subtle p-4 text-sm font-semibold text-text-primary hover:bg-bg-subtle">Badge disclaimer</Link>
              <Link href="/content-guidelines" className="rounded-2xl border border-border-subtle p-4 text-sm font-semibold text-text-primary hover:bg-bg-subtle">Content guidelines</Link>
              <Link href="/report-block-safety" className="rounded-2xl border border-border-subtle p-4 text-sm font-semibold text-text-primary hover:bg-bg-subtle">Report and safety</Link>
            </nav>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export function ProviderCtaSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-16 sm:pb-20" aria-labelledby="provider-cta-title">
      <div className="overflow-hidden rounded-[2rem] border border-border-subtle bg-brand-soft p-7 sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">For independent therapists</p>
          <h2 id="provider-cta-title" className={`mt-3 ${sectionHeading}`}>
            Build a professional presence people can discover
          </h2>
          <p className="mt-4 leading-7 text-text-secondary">
            Create a public listing, present your practice details clearly and make it easier for prospective clients to contact you directly. Visibility depends on the directory and your profile; results are never guaranteed.
          </p>
        </div>
        <div className="mt-7 flex shrink-0 flex-wrap gap-3 lg:mt-0">
          <Link href="/for-therapists" className={buttonVariants({ size: "lg" })}>
            List your practice
          </Link>
          <Link href="/pricing" className={buttonVariants({ size: "lg", variant: "outline" })}>
            View listing plans
          </Link>
        </div>
      </div>
    </section>
  );
}

export const homeFaqItems = [
  ["What is MasseurMatch?", "MasseurMatch is a directory for discovering independent massage therapists. Visitors browse public profiles and contact therapists directly."],
  ["Does MasseurMatch book massage appointments?", "No. MasseurMatch does not schedule or manage client appointments. Appointment details are arranged directly with the independent therapist."],
  ["Does MasseurMatch process client payments?", "No. MasseurMatch does not process payments between clients and therapists. Therapists manage their own business arrangements."],
  ["What does a verification or badge indicator mean?", "A MasseurMatch verification or badge indicator refers only to the specific platform check described by the applicable badge policy. It is not professional licensing, certification or a guarantee of service quality."],
  ["Does MasseurMatch verify professional licenses?", "MasseurMatch should not be treated as a licensing authority. Visitors are responsible for evaluating a therapist and any credentials relevant to their needs or jurisdiction."],
  ["What are incall and outcall listings?", "When a therapist provides this information, incall indicates they may receive clients at their location, while outcall indicates they may travel to a client location. Availability and details are confirmed directly with the therapist."],
  ["How can I report a safety or content concern?", "Use the platform reporting and safety resources to report content or conduct concerns for review under MasseurMatch policies."],
] as const;

export function HomeFaqSection() {
  return (
    <section className="border-y border-border-subtle bg-bg-subtle" aria-labelledby="home-faq-title">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 sm:py-20 lg:grid-cols-[0.7fr_1.3fr]">
        <FadeIn whileInView>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">Questions, answered</p>
          <h2 id="home-faq-title" className={`mt-3 ${sectionHeading}`}>
            MasseurMatch FAQ
          </h2>
          <p className="mt-4 leading-7 text-text-secondary">
            Clear answers about discovery, contact, verification and the directory&apos;s role.
          </p>
          <Link href="/faq" className="mt-6 inline-flex text-sm font-semibold text-brand-secondary underline-offset-4 hover:underline">
            View all FAQs
          </Link>
        </FadeIn>

        <div className="divide-y divide-border-subtle rounded-3xl border border-border-subtle bg-bg-elevated px-6">
          {homeFaqItems.map(([question, answer]) => (
            <details key={question} className="group py-5">
              <summary className="cursor-pointer list-none pr-8 font-display text-ds-18 font-semibold text-text-primary marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                {question}
              </summary>
              <p className="mt-3 max-w-3xl pr-4 text-sm leading-6 text-text-secondary">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCtaSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16 text-center sm:py-24" aria-labelledby="final-cta-title">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">Start with discovery</p>
      <h2 id="final-cta-title" className="mx-auto mt-3 max-w-3xl font-display text-ds-40 font-bold tracking-tight text-text-primary sm:text-ds-48">
        Find a therapist whose profile fits what you&apos;re looking for
      </h2>
      <p className="mx-auto mt-4 max-w-2xl leading-7 text-text-secondary">
        Browse the directory, compare public information and contact independent therapists directly.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/search" className={buttonVariants({ size: "lg" })}>
          Find a therapist
        </Link>
        <Link href="/for-therapists" className={buttonVariants({ size: "lg", variant: "outline" })}>
          List your practice
        </Link>
      </div>
    </section>
  );
}
