import Link from "next/link";

/**
 * The single next thing worth doing.
 *
 * One action, never a list. The Coach page ranks everything; repeating that
 * ranking here would turn the top of the dashboard into a second to-do list
 * and make the one action that matters harder to find.
 *
 * Renders nothing when there is nothing to suggest — an empty banner reading
 * "you're all set" is a permanent piece of furniture nobody reads twice.
 */
export function AiCoachBanner({
  title,
  description,
  href = "/pro/ai-coach",
}: {
  title: string | null;
  description: string | null;
  href?: string;
}) {
  if (!title) return null;

  return (
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-indigo-50 p-4">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
          AI Coach next action
        </p>
        <p className="font-semibold text-foreground">{title}</p>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>

      <Link
        href={href}
        className="inline-flex h-9 shrink-0 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
      >
        Open AI Coach
      </Link>
    </section>
  );
}
