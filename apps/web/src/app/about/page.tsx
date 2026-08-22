import type { Metadata } from "next";
import Image from "next/image";

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

const TITLE = "About MasseurMatch";
const DESCRIPTION =
  "MasseurMatch is a professional directory built to make independent male massage therapists easier to discover, compare, and contact directly.";

const RENE_PHOTO =
  "https://res.cloudinary.com/dyfxkq2nk/image/upload/v1787352177/17DF33F3-A1A4-450E-8001-725E746DA0F9_xdmryx.png";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/about") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/about"),
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const dynamic = "force-static";

export default function AboutPage() {
  return (
    <InstitutionalPage>
      <InstitutionalHero
        eyebrow="Our manifesto"
        title="A better way to discover"
        highlight="independent massage professionals."
        description="MasseurMatch gives clients clearer information before first contact and gives independent therapists a professional public presence without putting a booking platform between them."
        actions={[
          { label: "Find a therapist", href: "/search" },
          { label: "List your practice", href: "/for-therapists", secondary: true },
        ]}
        stats={[
          {
            value: "Directory only",
            label: "Discovery and direct contact, without a booking middleman.",
          },
          { value: "Human reviewed", label: "Profiles are reviewed before they become public." },
          {
            value: "Independent",
            label: "Therapists control their practice, rates, and client relationships.",
          },
        ]}
      />

      <InstitutionalBand>
        MasseurMatch does not provide massage, employ the therapists in the directory, process
        client session payments, or arrange appointments. The public profile helps both sides make a
        more informed first connection.
      </InstitutionalBand>

      <InstitutionalSection
        eyebrow="Why we exist"
        title="Less guesswork. More useful context."
        intro="Finding the right independent therapist should not require piecing together anonymous listings, incomplete profiles, and unclear contact paths."
      >
        <InstitutionalCardGrid
          cards={[
            {
              eyebrow: "01",
              title: "Clear discovery",
              body: "City, service, session format, published rates, and profile details are organized so clients can compare what actually matters before reaching out.",
              meta: "Search with context",
            },
            {
              eyebrow: "02",
              title: "Visible trust signals",
              body: "Profile review and identity verification are shown as specific signals with specific limits, rather than broad claims that imply more than was checked.",
              meta: "No badge inflation",
            },
            {
              eyebrow: "03",
              title: "Direct relationships",
              body: "Once a client finds a therapist, communication and any service arrangement happen directly with that independent provider.",
              meta: "No booking commission",
            },
          ]}
        />
      </InstitutionalSection>

      <InstitutionalSection
        dark
        eyebrow="Two sides, one directory"
        title="Built for the person searching and the professional being found."
      >
        <InstitutionalSplit
          dark
          left={
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d66b7a]">
                For clients
              </p>
              <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white">
                Compare before first contact.
              </h3>
              <p className="mt-5 text-sm leading-7 text-white/60">
                Read the profile, understand the therapist&apos;s location and session formats,
                review published services and rates, and use visible trust signals as one part of
                your own decision.
              </p>
              <p className="mt-5 text-sm leading-7 text-white/60">
                MasseurMatch never substitutes a stock photo for a real provider and does not turn a
                profile review into a guarantee of service quality or professional licensing.
              </p>
            </div>
          }
          right={
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d66b7a]">
                For therapists
              </p>
              <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white">
                Own the relationship with your clients.
              </h3>
              <p className="mt-5 text-sm leading-7 text-white/60">
                Build a public profile around your actual practice, appear in relevant city and
                service discovery, and publish the contact information you want prospective clients
                to use.
              </p>
              <p className="mt-5 text-sm leading-7 text-white/60">
                MasseurMatch does not take a percentage of session revenue or control how you run
                your independent practice.
              </p>
            </div>
          }
        />
      </InstitutionalSection>

      <InstitutionalSection
        eyebrow="What we stand for"
        title="Trust is strongest when the limits are visible."
        intro="The directory is designed around precise claims, professional boundaries, and useful information rather than manufactured certainty."
      >
        <InstitutionalCardGrid
          cards={[
            {
              title: "Specific verification",
              body: "An Identity Verified badge means identity evidence was reviewed. It does not mean MasseurMatch verified a professional license, performed a background check, or endorsed the provider.",
            },
            {
              title: "Professional content",
              body: "Profiles and photos are moderated before publication, with policies intended to keep the directory lawful, professional, non-sexual, and useful for genuine massage discovery.",
            },
            {
              title: "Responsible privacy",
              body: "Sensitive identity evidence is handled privately during review and raw verification images are deleted after the final decision, while limited audit status can be retained.",
            },
          ]}
        />
      </InstitutionalSection>

      <InstitutionalSection
        dark
        eyebrow="Meet the team"
        title="Technology shaped by perspective."
        intro="MasseurMatch is built by people who believe thoughtful technology can make independent professionals easier to discover while keeping trust, clarity, and human connection at the center."
      >
        <div className="overflow-hidden rounded-[2rem] border border-white/[0.10] bg-white/[0.04] shadow-2xl shadow-black/20">
          <div className="grid lg:grid-cols-[0.86fr_1.14fr] lg:items-stretch">
            <div className="relative min-h-[420px] overflow-hidden bg-white/[0.03] sm:min-h-[520px] lg:min-h-[620px]">
              <Image
                src={RENE_PHOTO}
                alt="Rene, web development specialist at MasseurMatch"
                fill
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover object-top"
                priority={false}
              />
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/40 to-transparent lg:hidden"
              />
            </div>

            <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d66b7a]">
                Web Development · Cuba
              </p>
              <h3 className="mt-4 font-display text-[clamp(2rem,4vw,3.5rem)] font-semibold tracking-tight text-white">
                Rene
              </h3>
              <p className="mt-2 text-sm font-medium text-white/50">
                Web Development Specialist · University of Havana graduate
              </p>

              <div className="mt-8 h-px w-16 bg-[#d66b7a]/70" />

              <p className="mt-8 max-w-2xl text-base leading-8 text-white/70">
                Born and educated in Cuba, Rene brings a technical perspective shaped by curiosity,
                resourcefulness, and a strong foundation in web development. A graduate of the
                University of Havana, he approaches digital products with an eye for both the
                systems behind them and the people who ultimately use them.
              </p>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/70">
                At MasseurMatch, that perspective supports our goal of creating a faster, clearer,
                and more dependable experience for independent professionals and the clients looking
                to discover them. His work reflects the principle behind the platform itself:
                technology should remove friction, build confidence, and make meaningful connections
                easier.
              </p>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/[0.08] bg-black/15 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                    Background
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">Cuban</p>
                </div>
                <div className="rounded-2xl border border-white/[0.08] bg-black/15 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                    Education
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">University of Havana</p>
                </div>
                <div className="rounded-2xl border border-white/[0.08] bg-black/15 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                    Focus
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">Web Development</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </InstitutionalSection>

      <InstitutionalCta
        eyebrow="Start here"
        title="Discovery should feel clear before the first message."
        description="Browse the directory as a client or build a professional listing as an independent therapist."
        actions={[
          { label: "Browse therapists", href: "/search" },
          { label: "How it works", href: "/how-it-works", secondary: true },
        ]}
      />
    </InstitutionalPage>
  );
}
