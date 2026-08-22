import { ProDemandRadar } from "@/components/pro/demand-radar";
import { getMyCityDemand } from "@/lib/demand";
import { requireTherapist } from "@/lib/guards";

export const metadata = { title: "Demand Radar | MasseurMatch" };
export const dynamic = "force-dynamic";

/**
 * Demand Radar in the Pro shell.
 *
 * The page is a data fetch and a component. The component is shared with the
 * legacy `/therapist/demand-radar` route, which supplies its own padding — the
 * Pro layout already supplies this one's, and a page that carried its own would
 * be indented twice here.
 */
export default async function ProDemandRadarPage() {
  const viewer = await requireTherapist("/pro/demand-radar");
  const demand = await getMyCityDemand(viewer.user.id);

  return <ProDemandRadar demand={demand} />;
}
