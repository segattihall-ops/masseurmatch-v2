import Link from "next/link";

import { Badge } from "./badge";

/**
 * One availability control.
 *
 * The state badge and the button are deliberately separate. The badge says what
 * is true now; the button offers the next move — "Activate Available Now" while
 * it is off, "Turn profile OFF" while it is on. A switch would have to be both
 * at once, and a switch that reads as its own state is the control people
 * misread most.
 *
 * `state === null` means the card has no on/off state to report (Mobile /
 * Outcall is configured, not switched), so no badge is drawn at all.
 */
export function ToggleCard({
  title,
  description,
  icon,
  state,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  state: boolean | null;
  /** The action slot — a link, or a form button bound to a server action. */
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
            aria-hidden
          >
            {icon}
          </span>
          <div className="space-y-1">
            <p className="font-medium text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        {state === null ? null : (
          <Badge variant={state ? "on" : "off"}>{state ? "On" : "Off"}</Badge>
        )}
      </div>

      <div className="mt-3">{children}</div>
    </section>
  );
}

/** The "go configure this elsewhere" action, for cards that do not toggle in place. */
export function ToggleCardLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-foreground transition hover:bg-muted"
    >
      {icon}
      {label}
    </Link>
  );
}
