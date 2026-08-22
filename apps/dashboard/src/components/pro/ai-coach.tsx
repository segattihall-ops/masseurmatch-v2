import { scoreSummary } from "@masseurmatch/db/profile-score";
import Link from "next/link";

import type { ProDashboardData } from "@/lib/pro-dashboard";

import { PageHeader } from "./page-header";
import { EmptyState, Section } from "./section";

/**
 * AI Profile Coach.
 *
 * ---------------------------------------------------------------------------
 * What was here before
 * ---------------------------------------------------------------------------
 * Three score cards that all read "—" with the hint "Analysis in progress", and
 * four numbered recommendations hard-coded in the source — the same four for
 * every therapist, including "Therapists with complete profiles get 70% more
 * views", a figure with nothing behind it. Nothing on the page read the
 * profile it was supposedly coaching.
 *
 * `scoreProfile` and `coachAdvice` were already written and already tested, and
 * only the dashboard banner was calling them. So this renders those: a score
 * derived from the profile on every read, the five checks that make it up, and
 * the ranked advice — each item carrying the number that produced it, so a
 * therapist can disagree with it.
 *
 * The "AI" in the title is production's name for this feature and the sidebar
 * says the same, so the page keeps it. What it actually is — a rules engine
 * over your own numbers, no model, no API key — is stated at the foot rather
 * than implied away.
 */
export function ProAiCoach({ data }: { data: ProDashboardData }) {
  const { score, advice } = data;

  return (
    <>
      <PageHeader
        eyebrow="Provider dashboard"
        title="AI profile coach"
        subtitle="What your listing scores today, and the thing most worth fixing next."
      />

      <Section title="Profile score" description={scoreSummary(score)}>
        <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
          <p className="text-4xl font-semibold leading-none text-foreground">{score.total}</p>
          <p className="text-sm text-muted-foreground">out of 100</p>
        </div>

        <div
          className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted"
          role="img"
          aria-label={`Profile score: ${score.total} out of 100`}
        >
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${Math.max(0, Math.min(100, score.total))}%` }}
          />
        </div>

        <ul className="mt-5 space-y-2">
          {score.checks.map((check) => {
            const done = check.action === null;
            return (
              <li
                key={check.id}
                className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-border py-2 last:border-0"
              >
                <span className="text-sm text-foreground">
                  {check.label}
                  {done ? null : (
                    <>
                      {" "}
                      <Link
                        href={check.href}
                        className="text-muted-foreground underline underline-offset-4"
                      >
                        fix this
                      </Link>
                    </>
                  )}
                </span>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {check.earned} / {check.possible}
                </span>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section
        title="What to do next"
        description="Ordered by what it is worth, not by how easy it is. Every line names the number behind it."
      >
        {advice.length === 0 ? (
          <EmptyState>{data.allClear}</EmptyState>
        ) : (
          <ol className="space-y-3">
            {advice.map((item, index) => (
              <li key={item.id} className="rounded-lg border border-border p-4">
                <p className="font-medium text-foreground">
                  <span className="text-muted-foreground">{index + 1}.</span> {item.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{item.because}</p>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="mt-3 inline-flex min-h-9 items-center rounded-lg border border-border px-3 text-sm font-medium text-foreground transition hover:bg-muted"
                  >
                    Go and do it
                  </Link>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </Section>

      <Section title="Where these come from">
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Signal label="Profile score" value={`${score.total}/100`} />
          <Signal label="Views in the window" value={String(data.views.window)} />
          <Signal
            label="Local demand"
            value={data.demand.score === null ? "No reading" : String(data.demand.score)}
          />
          <Signal
            label="Contact rate"
            value={data.contacts.rate === null ? "—" : `${data.contacts.rate.toFixed(1)}%`}
          />
        </dl>

        <p className="mt-4 text-sm text-muted-foreground">
          The coach reads your profile, your view and contact counts, and the demand reading for
          your city, then ranks what is worth doing. There is no model behind it and nothing you
          write here is sent anywhere — it is arithmetic over your own numbers, which is why every
          suggestion can tell you what it is based on.
        </p>
      </Section>
    </>
  );
}

function Signal({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-base font-semibold text-foreground">{value}</dd>
    </div>
  );
}
