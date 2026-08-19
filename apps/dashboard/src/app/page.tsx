import { redirect } from "next/navigation";

// Redirect to /therapist dashboard
export default function DashboardRoot() {
  redirect("/therapist");
}
