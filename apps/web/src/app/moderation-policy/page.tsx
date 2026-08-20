import type { Metadata } from "next";
import Link from "next/link";

import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Moderation Policy";
const DESCRIPTION =
  "How MasseurMatch handles policy violations, content enforcement, account actions, and appeals. Every enforcement action is documented with a reason.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/moderation-policy") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/moderation-policy"),
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
  },
};

const ACTION_TYPES = [
  {
    action: "Warning",
    when: "A first or minor violation — inaccurate profile claim, ambiguous photo, or a single reported incident that does not yet justify removal.",
    effect: "Notification sent. No public-facing change. Logged for pattern tracking.",
  },
  {
    action: "Content removal",
    when: "A specific photo, post, or profile section violates policy: explicit material, misleading credentials, watermarked images.",
    effect: "The violating content is removed. Profile remains active if no pattern exists.",
  },
  {
    action: "Suspension (temporary)",
    when: "Repeated warnings, a substantiated complaint, or a pending investigation into a serious but unconfirmed allegation.",
    effect:
      "Profile hidden from public search. Provider retains account access. SLA: resolved within 5 business days.",
  },
  {
    action: "Permanent ban",
    when: "A confirmed pattern of serious violations, solicitation of illegal services, identity fraud, or client harm.",
    effect:
      "Account terminated. Profile removed permanently. Device and email fingerprints flagged to prevent re-registration.",
  },
];

const SLA_ROWS = [
  { action: "Warning", response: "24 hours" },
  { action: "Content removal", response: "24 hours" },
  { action: "Suspension review", response: "5 business days" },
  { action: "Ban appeal decision", response: "10 business days" },
  { action: "Report acknowledgment", response: "48 hours" },
];

const APPEAL_REQUIREMENTS = [
  "A clear statement of why you believe the action was in error",
  "Any evidence or context relevant to the decision",
  "Contact information so we can follow up",
];

export default function ModerationPolicyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-16 pt-16">
      <h1 className="font-display text-ds-40 font-bold tracking-tight text-text-primary">
        Moderation Policy
      </h1>
      <p className="mt-3 text-sm text-text-secondary">{"Last updated: June 11, 2026"}</p>
      <p className="mt-4 text-text-secondary">
        {
          "MasseurMatch is a directory platform, not a passive hosting service. We actively enforce quality and safety standards. Every enforcement action is logged with a documented reason. This page explains exactly how that works."
        }
      </p>

      <div className="mt-10 space-y-10">
        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            Transparency principle
          </h2>
          <p className="text-text-secondary">
            {
              "Every moderation action we take — warning, removal, suspension, or ban — is logged with a written reason. Affected users receive that reason. We do not take silent action without documentation."
            }
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            Types of enforcement actions
          </h2>
          <ul className="list-disc space-y-4 pl-6">
            {ACTION_TYPES.map((item) => (
              <li key={item.action} className="text-text-secondary">
                <strong className="font-semibold text-text-primary">{item.action}.</strong>{" "}
                <strong className="font-semibold text-text-primary">When:</strong> {item.when}{" "}
                <strong className="font-semibold text-text-primary">Effect:</strong> {item.effect}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            Response time commitments
          </h2>
          <ul className="list-disc space-y-2 pl-6">
            {SLA_ROWS.map((row) => (
              <li key={row.action} className="text-text-secondary">
                {row.action}
                {" — "}
                <strong className="font-semibold text-text-primary">{row.response}</strong>
              </li>
            ))}
          </ul>
          <p className="text-text-secondary">
            {
              "SLAs apply during business hours (Mon–Fri, 9 AM–6 PM CT). Complex cases may take longer; we will communicate delays proactively."
            }
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            Appeals process
          </h2>
          <p className="text-text-secondary">
            {"Any user who receives a suspension or ban may submit an appeal within "}
            <strong className="font-semibold text-text-primary">30 days</strong>
            {" of the action date. Appeals must include:"}
          </p>
          <ul className="list-disc space-y-2 pl-6">
            {APPEAL_REQUIREMENTS.map((item) => (
              <li key={item} className="text-text-secondary">
                {item}
              </li>
            ))}
          </ul>
          <p className="text-text-secondary">
            {"Send appeals to "}
            <a
              href="mailto:appeals@masseurmatch.com"
              className="font-medium text-brand-secondary underline underline-offset-2"
            >
              appeals@masseurmatch.com
            </a>
            {
              ". We will acknowledge within 48 hours and issue a final decision within 10 business days."
            }
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
            Report a violation
          </h2>
          <p className="text-text-secondary">
            {
              "If you see a profile, listing, or interaction that violates these policies, report it. Include as much context as possible — screenshot, profile URL, description of the incident. Every report is reviewed by a human."
            }
          </p>
          <p className="text-text-secondary">
            {"Report to "}
            <a
              href="mailto:trust@masseurmatch.com?subject=Policy%20violation%20report"
              className="font-medium text-brand-secondary underline underline-offset-2"
            >
              trust@masseurmatch.com
            </a>
            {", or read our "}
            <Link
              href="/trust"
              className="font-medium text-brand-secondary underline underline-offset-2"
            >
              Trust &amp; Safety standards
            </Link>
            {"."}
          </p>
        </section>
      </div>
    </main>
  );
}
