import Link from "next/link";

/**
 * One number on the dashboard grid.
 *
 * `value` is a string rather than a number so the empty state can be an em
 * dash. That distinction matters: a completeness figure that has never been
 * computed is not zero percent, and printing `0%` would tell a therapist their
 * profile is empty when nobody has looked yet.
 *
 * The whole card is the link when there is somewhere to go — a number worth
 * showing usually has a page behind it, and making only the footnote clickable
 * hides that.
 */
export function MetricCard({
  label,
  value,
  hint,
  href,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  href?: string;
  icon: React.ReactNode;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <span className="text-muted-foreground" aria-hidden>
          {icon}
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold leading-tight text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </>
  );

  const shell = "rounded-xl border border-border bg-card p-4";

  if (!href) return <div className={shell}>{body}</div>;

  return (
    <Link href={href} className={`${shell} block transition hover:border-foreground/20`}>
      {body}
    </Link>
  );
}
