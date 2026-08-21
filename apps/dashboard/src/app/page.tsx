import { redirect } from "next/navigation";

/**
 * The signed-in root.
 *
 * Sends therapists to the Pro dashboard, which is the front door: `/therapist`
 * still resolves for anything linking to it, but everything new lives under
 * `/pro`.
 */
export default function DashboardRoot() {
  redirect("/pro");
}
