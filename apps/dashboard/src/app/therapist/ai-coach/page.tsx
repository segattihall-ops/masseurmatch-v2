import { ProAiCoach } from "@/components/pro/ai-coach";
import { requireTherapist } from "@/lib/guards";
import { getProDashboard } from "@/lib/pro-dashboard";

export const metadata = { title: "AI Profile Coach | MasseurMatch" };
export const dynamic = "force-dynamic";

/**
 * The Coach at its old address.
 *
 * Same component as `/pro/ai-coach`; the wrapper is the padding the legacy
 * shell does not supply. See the note in `therapist/demand-radar/page.tsx`.
 */
export default async function TherapistAiCoachPage() {
  const viewer = await requireTherapist("/therapist/ai-coach");
  const data = await getProDashboard(viewer.user.id);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
      <ProAiCoach data={data} />
    </div>
  );
}
