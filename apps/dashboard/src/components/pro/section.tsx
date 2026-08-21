/**
 * A titled panel, and the thing to say when it is empty.
 *
 * Every list under `/pro` is the same shape — a heading, sometimes a line of
 * context, then rows or nothing — and giving each page its own version of that
 * is how two pages end up disagreeing about what an empty list looks like.
 */
export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="space-y-1">
        <h2 className="font-medium text-foreground">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/**
 * Empty states say what will fill the space, not "no data".
 *
 * A therapist with no inquiries yet has not hit an error, and a page that reads
 * like one sends them to support over nothing.
 */
export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

/** A label/value row, used wherever a page is really a short list of facts. */
export function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border py-2 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
