import type { Metadata } from "next";
import Link from "next/link";

import { absoluteUrl, SITE_NAME } from "@/lib/site";

const TITLE = "Legal Center";
const DESCRIPTION =
  "Every MasseurMatch policy in one place — terms, privacy, conduct rules, content standards, and how to report a problem.";
const PATH = "/legal";

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

/**
 * The legal hub.
 *
 * Written directly rather than ported: the old page assembled itself from
 * constants imported across several modules, and porting that machinery would
 * have brought over a second navigation system to maintain. What the page owes
 * its reader is a complete, current index — and being generated from the list
 * below means it cannot drift from the pages that actually exist.
 *
 * Grouped rather than alphabetical. Someone arriving here has a question
 * ("what am I agreeing to?", "how do I report something?"), not a letter.
 */
const GROUPS: { heading: string; blurb: string; links: { href: string; label: string }[] }[] = [
  {
    heading: "The agreement",
    blurb: "What you agree to by using the site, and the terms specific to each kind of user.",
    links: [
      { href: "/terms", label: "Terms of Service" },
      { href: "/client-terms", label: "Client Terms" },
      { href: "/provider-terms", label: "Provider Terms" },
      { href: "/advertising-terms", label: "Advertising Terms" },
      { href: "/subscriptions", label: "Subscription Terms" },
      { href: "/refund-policy", label: "Refund Policy" },
    ],
  },
  {
    heading: "Conduct and content",
    blurb: "What is allowed on the platform, what is not, and the standards profiles are held to.",
    links: [
      { href: "/acceptable-use", label: "Acceptable Use Policy" },
      { href: "/prohibited-conduct", label: "Prohibited Conduct" },
      { href: "/community-guidelines", label: "Community Guidelines" },
      { href: "/content-guidelines", label: "Content Guidelines" },
      { href: "/photo-profile-policy", label: "Photo & Profile Policy" },
    ],
  },
  {
    heading: "Your data",
    blurb: "What is collected, how it is used, and how to get it removed.",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/cookie-policy", label: "Cookie Policy" },
      { href: "/data-deletion", label: "Data Deletion" },
      { href: "/email-opt-out", label: "Email Opt-Out" },
      { href: "/sms-terms", label: "SMS Terms" },
    ],
  },
  {
    heading: "Safety and reporting",
    blurb: "How to report a problem, and what happens after you do.",
    links: [
      { href: "/safety", label: "Safety" },
      { href: "/report-block-safety", label: "Report, Block & Safety" },
      { href: "/trust", label: "Trust & Safety" },
      { href: "/dmca", label: "DMCA / Copyright" },
    ],
  },
  {
    heading: "Disclosures",
    blurb: "What the platform is, what it is not, and where its limits are.",
    links: [
      { href: "/platform-disclaimer", label: "Platform Disclaimer" },
      { href: "/ai-disclosure", label: "AI Assistant Disclosure" },
      { href: "/badge-disclaimer", label: "Badge Disclaimer" },
      { href: "/verification", label: "Verification" },
      { href: "/accessibility", label: "Accessibility" },
    ],
  },
];

export default function LegalCenterPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-16 pt-16">
      <header className="border-b border-border-subtle pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">Legal</p>
        <h1 className="mt-3 font-display text-ds-40 font-bold tracking-tight text-text-primary">
          {TITLE}
        </h1>
        <p className="mt-4 leading-relaxed text-text-secondary">{DESCRIPTION}</p>
      </header>

      <div className="mt-10 space-y-10">
        {GROUPS.map((group) => (
          <section key={group.heading} className="space-y-3">
            <h2 className="font-display text-ds-24 font-bold tracking-tight text-text-primary">
              {group.heading}
            </h2>
            <p className="text-text-secondary">{group.blurb}</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block rounded-2xl border border-border-subtle px-4 py-3 text-sm font-medium text-text-primary transition hover:border-brand-secondary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
