import Link from "next/link";

/**
 * Eyebrow, title, one line of context, and at most one action.
 *
 * Shared by every page under `/pro` so the top of the screen is in the same
 * place wherever a therapist lands from the sidebar.
 */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  action?: { href: string; label: string; icon?: React.ReactNode };
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {eyebrow}
        </p>
        <h1 className="text-2xl font-semibold leading-tight text-foreground sm:text-[30px]">
          {title}
        </h1>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>

      {action ? (
        <Link
          href={action.href}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-foreground transition hover:bg-muted"
        >
          {action.icon}
          {action.label}
        </Link>
      ) : null}
    </header>
  );
}
