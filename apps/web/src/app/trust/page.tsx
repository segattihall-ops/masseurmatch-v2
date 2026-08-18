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

const TITLE = "Trust & Safety";
const DESCRIPTION =
  "How MasseurMatch moderates public profiles, handles identity verification, limits trust claims, protects sensitive evidence, and routes safety concerns.";
const PATH = "/trust";

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
        eyebrow="Trust & safety"
        title="Trust should be legible."
        highlight="Not implied."
        description={DESCRIPTION}
        actions={[
          { label: "Identity verification", href: "/verification" },
          { label: "Report a concern", href: "/report-block-safety", secondary: true },
        ]}
        stats={[
          { value: "Profile review", label: "Listings are moderated before public publication." },
          { value: "Identity review", label: "Optional identity evidence can create a separate verified signal." },
          { value: "Clear limits", label: "A trust signal is never presented as a broader guarantee than the review supports." },
        ]}
      />

      <InstitutionalBand>
        MasseurMatch can review what appears on its platform and record specific verification
        decisions. It does not turn those decisions into guarantees about an independent therapist,
        professional licensing, or the outcome of a future session.
      </InstitutionalBand>

      <InstitutionalSection
        eyebrow="The trust system"
        title="Different risks require different controls."
        intro="Instead of one vague 'verified' label, MasseurMatch separates profile moderation, photo moderation, identity review, privacy handling, and enforcement."
      >
        <InstitutionalCardGrid
          cards={[
            {
              title: "Profile moderation",
              body: "Public-facing profile content is reviewed against platform standards before the listing is approved for publication.",
              meta: "Publication control",
            },
            {
              title: "Photo moderation",
              body: "Profile photos have their own moderation state. Public cards use approved usable images and fall back to initials rather than substituting stock photography.",
              meta: "Image integrity",
            },
            {
              title: "Identity verification",
              body: "Providers can separately submit identity evidence for human review. An approved decision can create the Identity Verified platform signal.",
              meta: "Optional identity signal",
            },
            {
              title: "Sensitive-file minimization",
              body: "The current identity workflow deletes the submitted identity file after the reviewer makes a decision instead of retaining the raw evidence indefinitely.",
              meta: "Privacy control",
            },
            {
              title: "Reporting",
              body: "Clients and providers have a dedicated route for suspicious listings, unsafe behavior, harassment, or other platform concerns that need review.",
              meta: "Escalation path",
            },
            {
              title: "Policy enforcement",
              body: "Content, acceptable-use, prohibited-conduct, and moderation policies define what can remain on the directory and what can be removed or restricted.",
              meta: "Directory integrity",
            },
          ]}
        />
      </InstitutionalSection>

      <InstitutionalSection
        dark
        eyebrow="The line we do not cross"
        title="Specific review is useful. Broad implied certification is not."
      >
        <InstitutionalSplit
          dark
          left={
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d66b7a]">
                What the platform can say
              </p>
              <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white">
                Exactly which platform review occurred.
              </h3>
              <ul className="mt-6 space-y-4 text-sm leading-7 text-white/60">
                <li>• The profile passed publication review.</li>
                <li>• A visible photo has an approved moderation state.</li>
                <li>• Identity evidence was approved when Identity Verified is shown.</li>
                <li>• A report or moderation decision can be recorded and enforced on-platform.</li>
              </ul>
            </div>
          }
          right={
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d66b7a]">
                What those signals do not certify
              </p>
              <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white">
                Professional standing or future behavior outside the review scope.
              </h3>
              <ul className="mt-6 space-y-4 text-sm leading-7 text-white/60">
                <li>• No universal massage-license verification.</li>
                <li>• No criminal or other background investigation.</li>
                <li>• No guarantee of qualifications, insurance, or service claims.</li>
                <li>• No promise of safety, quality, conduct, or session outcome.</li>
              </ul>
            </div>
          }
        />
      </InstitutionalSection>

      <InstitutionalSection
        eyebrow="From submission to public signal"
        title="Trust features are designed as explicit state changes, not marketing adjectives."
      >
        <InstitutionalSteps
          steps={[
            {
              title: "Information is submitted",
              body: "A provider creates or updates the listing, adds photos, or separately submits identity evidence through the appropriate workflow.",
              meta: "Input",
            },
            {
              title: "The relevant review occurs",
              body: "Profile content, photos, and identity evidence follow their own moderation or review paths rather than sharing one ambiguous approval state.",
              meta: "Review",
            },
            {
              title: "The platform records the result",
              body: "Approved, rejected, visible, or verified states drive what the public site is allowed to show and which signals appear.",
              meta: "State",
            },
            {
              title: "Concerns can reopen scrutiny",
              body: "Reports and moderation tools allow the platform to review a listing again when new information or conduct raises a platform concern.",
              meta: "Enforcement",
            },
          ]}
        />
      </InstitutionalSection>

      <InstitutionalSection
        dark
        eyebrow="Directory boundary"
        title="Trust features support discovery. They do not make MasseurMatch part of the massage session."
        intro="Scheduling, session payments, and service arrangements remain directly between the client and the independent provider outside MasseurMatch."
      >
        <InstitutionalCardGrid
          dark
          cards={[
            {
              title: "No booking control",
              body: "MasseurMatch does not schedule the client session or control the independent therapist's calendar.",
            },
            {
              title: "No client session payment processing",
              body: "The platform does not collect the client's massage payment or take a commission from the therapist's session revenue.",
            },
            {
              title: "No employment relationship",
              body: "Providers listed in the directory are independent professionals responsible for their own services and professional obligations.",
            },
          ]}
        />
      </InstitutionalSection>

      <InstitutionalCta
        title="Use the right trust page for the question you actually have."
        description="Read the verification limits, review client safety guidance, or report a concern that needs moderation."
        actions={[
          { label: "Read verification", href: "/verification" },
          { label: "Safety guidance", href: "/safety", secondary: true },
          { label: "Report a concern", href: "/report-block-safety", secondary: true },
        ]}
      />
    </InstitutionalPage>
  );
}
