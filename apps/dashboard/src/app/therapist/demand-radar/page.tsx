import { ProDemandRadar } from "@/components/pro/demand-radar";
import { getMyCityDemand } from "@/lib/demand";
import { requireTherapist } from "@/lib/guards";

export const metadata = { title: "Demand Radar | MasseurMatch" };
export const dynamic = "force-dynamic";

/**
 * Demand Radar at its old address.
 *
 * One implementation, rendered in two shells: `/pro/*` is the front door and
 * this keeps every existing link and bookmark working. The legacy layout gives
 * `<main>` no padding of its own, so the wrapper supplies it here — which is
 * the whole difference between this file and the `/pro` one.
 *
 * It also guards properly now. The page it replaces returned `null` when
 * `auth.getUser()` came back empty, so a signed-out visitor got a blank screen
 * instead of the sign-in page.
 */
export default async function TherapistDemandRadarPage() {
  const viewer = await requireTherapist("/therapist/demand-radar");
  const demand = await getMyCityDemand(viewer.user.id);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
      <ProDemandRadar demand={demand} />
    </div>
  );
}
