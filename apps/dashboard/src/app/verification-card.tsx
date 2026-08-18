import { buttonVariants, Card, CardDescription, CardHeader, CardTitle } from "@masseurmatch/ui";
import Link from "next/link";

/**
 * Phone and identity, together.
 *
 * One card rather than two because they are the same question to a therapist —
 * "what else proves I am real" — and because separately they would each be a
 * card carrying one line of text.
 *
 * Verified rows stay visible instead of disappearing. A badge that quietly
 * vanishes from the dashboard is indistinguishable from one that was revoked.
 */
export function VerificationCard({
  phoneVerified,
  identityVerified,
}: {
  phoneVerified: boolean;
  identityVerified: boolean;
}) {
  const rows = [
    {
      label: "Phone",
      done: phoneVerified,
      href: "/verify-phone",
      todo: "Verify your number",
      note: "Also lets you sign in with a text message.",
    },
    {
      label: "Identity",
      done: identityVerified,
      href: "/verify-id",
      todo: "Send a document",
      note: "A person on our team checks it, then deletes it.",
    },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardDescription>Verification</CardDescription>
        <CardTitle className="text-ds-20">
          {phoneVerified && identityVerified ? "Fully verified" : "Build trust with clients"}
        </CardTitle>
      </CardHeader>
      <div className="space-y-3 px-6 pb-6">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-ink">{row.label}</p>
              <p className="text-xs text-text-muted">{row.done ? "Verified" : row.note}</p>
            </div>
            {row.done ? (
              <span className="text-sm text-text-muted">✓</span>
            ) : (
              <Link href={row.href} className={buttonVariants({ variant: "outline", size: "sm" })}>
                {row.todo}
              </Link>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
