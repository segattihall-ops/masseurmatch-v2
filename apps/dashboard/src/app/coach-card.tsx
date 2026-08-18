import { coachAllClear, type Advice, type CoachSignals } from "@masseurmatch/db/coach";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@masseurmatch/ui";
import Link from "next/link";

/**
 * Coach, on the dashboard home.
 *
 * Called "Coach" rather than "AI Coach". There is no model behind it — the old
 * one had none either, it was a rules engine — and naming it after a technology
 * it does not use would be the first dishonest thing on the page.
 *
 * Every line shows the observation underneath it, so a therapist can disagree
 * with the advice rather than being asked to trust it.
 */
const MAX_ADVICE = 3;

export function CoachCard({ advice, signals }: { advice: Advice[]; signals: CoachSignals }) {
  const shown = advice.slice(0, MAX_ADVICE);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coach</CardTitle>
        <CardDescription>
          {shown.length === 0 ? coachAllClear(signals) : "What would help most, right now."}
        </CardDescription>
      </CardHeader>

      {shown.length > 0 ? (
        <CardContent>
          <ol className="space-y-3">
            {shown.map((item) => (
              <li key={item.id} className="space-y-0.5">
                <p className="text-sm text-text-primary">
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="underline underline-offset-4 hover:opacity-80"
                    >
                      {item.title}
                    </Link>
                  ) : (
                    item.title
                  )}
                </p>
                <p className="text-xs text-text-muted">{item.because}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      ) : null}
    </Card>
  );
}
