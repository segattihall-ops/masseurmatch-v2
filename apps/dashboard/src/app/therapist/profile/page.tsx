import { redirect } from "next/navigation";

/**
 * This route was a second, partial profile editor. It posted to an
 * `/api/profile` endpoint that does not exist and drifted from the onboarding
 * schemas, so it redirects to the canonical editor — the same pattern the
 * production app uses for its duplicate editors.
 */
export default function TherapistProfilePage() {
  redirect("/profile");
}
