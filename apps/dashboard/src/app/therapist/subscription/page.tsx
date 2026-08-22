import { redirect } from "next/navigation";

/**
 * Moved to `/pro/subscription`.
 *
 * The page here quoted prices typed into its own JSX: three plans at $0, $29
 * and $79, against the four real ones in `plans.ts` at $0, $39, $79 and $129.
 * It offered Standard at ten dollars under its price, promised it "unlimited
 * photos" where the plan gives six, omitted Pro entirely, and its Upgrade
 * button had no handler.
 *
 * A redirect rather than a re-export: `/pro` is the front door, and it is the
 * only shell with a mobile navigation. Rendering the same page in the legacy
 * shell would keep a second, non-responsive route to it alive for no gain.
 */
export default function TherapistSubscriptionPage() {
  redirect("/pro/subscription");
}
