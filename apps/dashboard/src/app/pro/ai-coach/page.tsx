import { ProAiCoach } from "@/components/pro/ai-coach";
import { requireTherapist } from "@/lib/guards";
import { getProDashboard } from "@/lib/pro-dashboard";

export const metadata = { title: "AI Profile Coach | MasseurMatch" };
export const dynamic = "force-dynamic";

/**
 * The Coach in the Pro shell.
 *
 * Reads the same gathered dashboard data as `/pro/dashboard`, so the banner
 * there and the list here are always the same ranking — they are literally the
 * same `coachAdvice` call.
 */
export default async function ProAiCoachPage() {
  const viewer = await requireTherapist("/pro/ai-coach");
  const data = await getProDashboard(viewer.user.id);

  return <ProAiCoach data={data} />;
}
