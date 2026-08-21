import { redirect } from "next/navigation";

export default function LegacyProfileReportsPage() {
  redirect("/admin/reports");
}
