import { type ProfileScore, scoreSummary } from "@masseurmatch/db/profile-score";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@masseurmatch/ui";
import Link from "next/link";

/**
 * Profile Score, on the dashboard home.
 *
 * A server component — it is a number and some links, so there is no reason to
 * ship it to the browser.
 *
 * Shows at most three actions. The list is already sorted by points available,
 * so the top three are the three worth doing; a full audit of every field would
 * turn a nudge into a chore, and the rest reappear as these get done.
 *
 * No progress bar, no badge, no grade. The number and the next thing to do are
 * the whole feature.
 */
const MAX_ACTIONS = 3;

export function ProfileScoreCard({ score }: { score: ProfileScore }) {
  const actions = score.todo.slice(0, MAX_ACTIONS);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile score</CardTitle>
        <CardDescription>{scoreSummary(score)}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="font-stat text-ds-32 text-text-primary">
          {score.total}
          <span className="text-base font-normal text-text-secondary"> of 100</span>
        </p>

        {actions.length > 0 ? (
          <ul className="space-y-2">
            {actions.map((check) => (
              <li key={check.id} className="text-sm">
                <Link
                  href={check.href}
                  className="text-text-primary underline underline-offset-4 hover:opacity-80"
                >
                  {check.action}
                </Link>{" "}
                {/* The points are the reason to bother, so they are stated
                    rather than implied by list order alone. */}
                <span className="text-text-muted">+{check.possible - check.earned}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
