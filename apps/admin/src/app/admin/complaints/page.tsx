import { redirect } from "next/navigation";

export default function LegacyComplaintsPage() {
  redirect("/admin/profile-reports");
}
