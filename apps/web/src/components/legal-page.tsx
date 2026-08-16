import Link from "next/link";

/**
 * Wrapper for legal and policy pages.
 *
 * The body is styled by *descendant selectors* rather than by putting a class
 * on every element. That is deliberate: these pages are legally reviewed prose
 * ported verbatim from the previous site, and rewriting each `<p>` and `<li>`
 * to carry a className is both enormous and an invitation to change the text
 * while editing the markup. Paste the prose; the wrapper styles it.
 *
 * No `prose` plugin — `@tailwindcss/typography` is not installed, and adding it
 * would introduce a second type scale alongside the design system's. Every
 * value below is an existing token.
 */

const LEGAL_LINKS = [
  { href: "/legal", label: "Legal Center" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/cookie-policy", label: "Cookies" },
  { href: "/provider-terms", label: "Provider Terms" },
  { href: "/client-terms", label: "Client Terms" },
  { href: "/acceptable-use", label: "Acceptable Use" },
  { href: "/subscriptions", label: "Subscriptions" },
  { href: "/refund-policy", label: "Refunds" },
  { href: "/dmca", label: "DMCA" },
];

const BODY_STYLES = [
  "[&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-ds-24 [&_h2]:font-bold",
  "[&_h2]:tracking-tight [&_h2]:text-text-primary",
  "[&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-ds-18 [&_h3]:font-semibold",
  "[&_h3]:tracking-tight [&_h3]:text-text-primary",
  "[&_p]:mt-4 [&_p]:leading-relaxed [&_p]:text-text-secondary",
  "[&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6",
  "[&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6",
  "[&_li]:leading-relaxed [&_li]:text-text-secondary",
  "[&_a]:font-medium [&_a]:text-brand-secondary [&_a]:underline [&_a]:underline-offset-2",
  "[&_strong]:font-semibold [&_strong]:text-text-primary",
  "[&_table]:mt-4 [&_table]:w-full [&_table]:text-left [&_table]:text-sm",
  "[&_th]:border-b [&_th]:border-border-subtle [&_th]:py-2 [&_th]:text-text-primary",
  "[&_td]:border-b [&_td]:border-border-subtle [&_td]:py-2 [&_td]:text-text-secondary",
].join(" ");

export function LegalPage({
  title,
  path,
  lastUpdated = "August 16, 2026",
  children,
}: {
  title: string;
  /** Used to mark the current page in the nav, so it is not a link to itself. */
  path: string;
  lastUpdated?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-16 pt-16">
      <nav className="mb-10 flex flex-wrap gap-2" aria-label="Legal pages">
        {LEGAL_LINKS.map((item) =>
          item.href === path ? (
            <span
              key={item.href}
              aria-current="page"
              className="rounded-full border border-brand-secondary bg-brand-soft px-3 py-1.5 text-xs font-medium text-text-primary"
            >
              {item.label}
            </span>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-border-subtle px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:border-brand-secondary hover:text-text-primary"
            >
              {item.label}
            </Link>
          ),
        )}
      </nav>

      <header className="border-b border-border-subtle pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">Legal</p>
        <h1 className="mt-3 font-display text-ds-40 font-bold tracking-tight text-text-primary">
          {title}
        </h1>
        <p className="mt-3 text-sm text-text-secondary">Last updated: {lastUpdated}</p>
      </header>

      <article className={BODY_STYLES}>{children}</article>
    </main>
  );
}
